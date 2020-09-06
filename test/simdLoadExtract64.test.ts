import { compileTest } from './util';
/* global test, expect */

test('v128.load + i64x2.extract_lane + f64x2.extract_lane', async () => {
  await compileTest(
    ['fd00', 'fd1d', 'fd21'],
    `(module
      (memory 1)
      (func $extract0 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i64x2.extract_lane 0
        i64.store)

      (func $extract1 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i64x2.extract_lane 1
        i64.store)

      (func $f_extract0 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f64x2.extract_lane 0
        f64.store)

      (func $f_extract1 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f64x2.extract_lane 1
        f64.store)

      (export "extract0" (func $extract0))
      (export "extract1" (func $extract1))
      (export "f_extract0" (func $f_extract0))
      (export "f_extract1" (func $f_extract1))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['extract0', 'extract1', 'f_extract0', 'f_extract1'];
      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
        }

        exports1[fn[z]](0, 16);
        exports2[fn[z]](0, 16);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](1, 32);
        exports2[fn[z]](1, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](3, 0);
        exports2[fn[z]](3, 0);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});
