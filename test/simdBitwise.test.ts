import { compileTest } from './util';
/* global test, expect */

test('v128.not', async () => {
  await compileTest(
    ['fd00', 'fd4d'],
    `(module
      (memory 1)
      (func $not (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        v128.not
        v128.store)

      (export "not" (func $not))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      for (let i = 0; i < 16; i++) {
        memory1[i] = i;
        memory2[i] = i;
        memory1[i + 16] = 0xFF;
        memory2[i + 16] = 0xFF;
      }

      exports1.not(0, 0);
      exports2.not(0, 0);
      expect(memory2).toStrictEqual(memory1);

      exports1.not(0, 0);
      exports2.not(0, 0);
      expect(memory2).toStrictEqual(memory1);

      exports1.not(16, 32);
      exports2.not(16, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.not(32, 64);
      exports2.not(32, 64);
      expect(memory2).toStrictEqual(memory1);

      exports1.not(16, 16);
      exports2.not(16, 16);
      expect(memory2).toStrictEqual(memory1);
    },
  );
});

test('v128.and + v128.andnot + v128.or + v128.xor', async () => {
  await compileTest(
    ['fd00', 'fd4e', 'fd4f', 'fd50', 'fd51'],
    `(module
      (memory 1)
      (func $and (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        v128.and
        v128.store)

      (func $andnot (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        v128.andnot
        v128.store)

      (func $or (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        v128.or
        v128.store)

      (func $xor (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        v128.xor
        v128.store)

      (export "and" (func $and))
      (export "andnot" (func $andnot))
      (export "or" (func $or))
      (export "xor" (func $xor))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['and', 'andnot', 'or', 'xor'];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        exports1[fn[z]](0, 16, 32);
        exports2[fn[z]](0, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 5, 32);
        exports2[fn[z]](0, 5, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 16, 32);
        exports2[fn[z]](16, 16, 32);
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

test('shl + shr_s + shr_u', async () => {
  await compileTest(
    ['fdcb', 'fdcc', 'fdcd', 'fdab', 'fdac', 'fdad'],
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

      (export "i64x2shl" (func $i64x2shl))
      (export "i64x2shr_u" (func $i64x2shr_u))
      (export "i64x2shr_s" (func $i64x2shr_s))
      (export "i32x4shl" (func $i32x4shl))
      (export "i32x4shr_u" (func $i32x4shr_u))
      (export "i32x4shr_s" (func $i32x4shr_s))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['i64x2shl', 'i64x2shr_u', 'i64x2shr_s', 'i32x4shl', 'i32x4shr_u', 'i32x4shr_s'];

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
