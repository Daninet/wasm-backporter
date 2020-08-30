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
