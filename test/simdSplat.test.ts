import { compileTest } from './util';
/* global test, expect */

test('.splat', async () => {
  await compileTest(
    ['fd12', 'fd11', 'fd10', 'fd0f'],
    `(module
      (memory 1)
      (func $i64x2splat (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i64.load
        i64x2.splat
        v128.store)

      (func $i32x4splat (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i32.load
        i32x4.splat
        v128.store)

      (func $i16x8splat (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i32.load
        i16x8.splat
        v128.store)

      (func $i8x16splat (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i32.load
        i8x16.splat
        v128.store)

      (export "i64x2splat" (func $i64x2splat))
      (export "i32x4splat" (func $i32x4splat))
      (export "i16x8splat" (func $i16x8splat))
      (export "i8x16splat" (func $i8x16splat))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['i64x2splat', 'i32x4splat', 'i16x8splat', 'i8x16splat'];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        exports1[fn[z]](0, 32);
        exports2[fn[z]](0, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](2, 32);
        exports2[fn[z]](2, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 32);
        exports2[fn[z]](16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](1, 1);
        exports2[fn[z]](1, 1);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 16);
        exports2[fn[z]](16, 16);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});
