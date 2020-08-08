const wabtFactory = require('wabt');

(async () => {
  const wabt = await wabtFactory();
  console.log('wabt', wabt);
  const wat = `(module
    (memory 1)
    (func $fill (param $p1 i32) (param $p2 i32) (param $p3 i32) (result i32)
      get_local $p1 ;; target offset
      get_local $p2 ;; byte value to set
      get_local $p3 ;; length
      memory.fill
      get_local $p1
      i32.load8_u)
    (export "fill" (func $fill)))
  `;
  const { buffer } = wabt.parseWat('file', wat, { bulk_memory: true }).toBinary({});
  console.log('buffer', buffer);
})();