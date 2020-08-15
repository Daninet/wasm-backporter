const wabtFactory = require('wabt');

// node --experimental-wasm-simd   --wasm-simd-post-mvp -- wabt.js
/* global WebAssembly */

(async () => {
  const wabt = await wabtFactory();
  const wat = `(module
    (import "env" "log" (func $log1 (param i32)))
    (import "env" "log" (func $log2 (param i32) (param i32)))
    (import "env" "log" (func $log3 (param i32) (param i32) (param i32)))
    (import "env" "log" (func $log4 (param i32) (param i32) (param i32) (param i32)))
    ;; (global $simdi1 (mut i64) (i64.const 0))
    ;; (global $simdi2 (mut i64) (i64.const 0))
    ;; (global $simdf1 (mut f64) (f64.const 0))
    ;; (global $simdf2 (mut f64) (f64.const 0))
    (memory 1)
    (func $simd (param $p1 i32) (param $p2 i32) (param $p3 i32) (param $p4 i32) (result i32)
      (local $aux i32)
      (local $simdi1 i64)
      (local $simdi2 i64)

      i32.const 0

      ;; -- v128.load polyfill --
      local.tee $aux
      i64.load
      local.get $aux
      i32.const 8
      i32.add
      i64.load

      ;; -- i32x4.extract_lane 1 polyfill --
      drop
      i64.const 32
      i64.shr_u
      i32.wrap_i64

      ;; -- i16x8.extract_lane_u 1 polyfill --
      ;; local.get $simdi1
      ;; i64.const 32
      ;; i64.shl
      ;; i64.const 48
      ;; i64.shr_u
      ;; i32.wrap_i64

      ;; end
      call $log1

      ;; i32.const 0
      ;; v128.load
      ;; i16x8.extract_lane_u 1
      ;; call $log1

      i32.const 0
      i32.load8_u
    )
    (export "simd" (func $simd))
    (export "memory" (memory 0)))
  `;
  const { buffer } = wabt.parseWat('file', wat, { simd: true }).toBinary({});
  const module = new WebAssembly.Module(buffer);
  const { exports } = new WebAssembly.Instance(module, {
    env: {
      log: (...vars) => console.log(vars),
    },
  });
  const arr = new Uint8Array(exports.memory.buffer);
  arr.set(Uint8Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]));
  console.log('instance', exports.simd(1, 2, 3));
})();
