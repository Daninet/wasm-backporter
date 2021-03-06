import { compileTest } from './util';
/* global test, expect */

test('shl + shr_s + shr_u', async () => {
  await compileTest(
    ['fdcb', 'fdcc', 'fdcd', 'fdab', 'fdac', 'fdad', 'fd8b', 'fd8c', 'fd8d'],
    `(module
      (memory 1)
      (func $i64x2shl (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i64x2.shl
        v128.store)

      (func $i64x2shr_u (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i64x2.shr_u
        v128.store)

      (func $i64x2shr_s (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i64x2.shr_s
        v128.store)

      (func $i32x4shl (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i32x4.shl
        v128.store)

      (func $i32x4shr_u (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i32x4.shr_u
        v128.store)

      (func $i32x4shr_s (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i32x4.shr_s
        v128.store)

      (func $i16x8shl (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i16x8.shl
        v128.store)

      (func $i16x8shr_u (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i16x8.shr_u
        v128.store)

      (func $i16x8shr_s (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i16x8.shr_s
        v128.store)

      (func $i8x16shl (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i8x16.shl
        v128.store)

      (func $i8x16shr_u (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i8x16.shr_u
        v128.store)

      (func $i8x16shr_s (param $src i32) (param $v i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $v
        i8x16.shr_s
        v128.store)

      (export "i64x2shl" (func $i64x2shl))
      (export "i64x2shr_u" (func $i64x2shr_u))
      (export "i64x2shr_s" (func $i64x2shr_s))
      (export "i32x4shl" (func $i32x4shl))
      (export "i32x4shr_u" (func $i32x4shr_u))
      (export "i32x4shr_s" (func $i32x4shr_s))
      (export "i16x8shl" (func $i16x8shl))
      (export "i16x8shr_u" (func $i16x8shr_u))
      (export "i16x8shr_s" (func $i16x8shr_s))
      (export "i8x16shl" (func $i8x16shl))
      (export "i8x16shr_u" (func $i8x16shr_u))
      (export "i8x16shr_s" (func $i8x16shr_s))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = [
        'i64x2shl', 'i64x2shr_u', 'i64x2shr_s',
        'i32x4shl', 'i32x4shr_u', 'i32x4shr_s',
        'i16x8shl', 'i16x8shr_u', 'i16x8shr_s',
        'i8x16shl', 'i8x16shr_u', 'i8x16shr_s',
      ];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        exports1[fn[z]](0, 1, 32);
        exports2[fn[z]](0, 1, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 8, 32);
        exports2[fn[z]](0, 8, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 9, 32);
        exports2[fn[z]](0, 9, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 16, 32);
        exports2[fn[z]](0, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 63, 32);
        exports2[fn[z]](0, 63, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 0xfe, 32);
        exports2[fn[z]](0, 0xfe, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 0, 32);
        exports2[fn[z]](0, 0, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 31, 32);
        exports2[fn[z]](16, 31, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](24, 9, 5);
        exports2[fn[z]](24, 9, 5);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](98, 98, 0);
        exports2[fn[z]](98, 98, 0);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});
