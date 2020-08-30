import { compileTest } from './util';
/* global test, expect */

test('i16x8 add + add_saturate + sub + sub_saturate + mul + neg + abs + avgr', async () => {
  await compileTest(
    ['fd8e', 'fd91', 'fd95', 'fd81', 'fd90', 'fd8f', 'fd92', 'fd93', 'fd80', 'fd9b'],
    `(module
      (memory 1)
      (func $add (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.add
        v128.store)

      (func $add_saturate_u (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.add_saturate_u
        v128.store)

      (func $add_saturate_s (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.add_saturate_s
        v128.store)

      (func $sub (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.sub
        v128.store)

      (func $sub_saturate_u (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.sub_saturate_u
        v128.store)

      (func $sub_saturate_s (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.sub_saturate_s
        v128.store)

      (func $mul (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.mul
        v128.store)

      (func $avgr (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.avgr_u
        v128.store)

      (func $neg (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.neg
        v128.store)

      (func $abs (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.abs
        v128.store)

      (export "add" (func $add))
      (export "add_saturate_u" (func $add_saturate_u))
      (export "add_saturate_s" (func $add_saturate_s))
      (export "sub" (func $sub))
      (export "sub_saturate_u" (func $sub_saturate_u))
      (export "sub_saturate_s" (func $sub_saturate_s))
      (export "mul" (func $mul))
      (export "avgr" (func $avgr))
      (export "neg" (func $neg))
      (export "abs" (func $abs))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['add', 'add_saturate_u', 'add_saturate_s', 'sub', 'sub_saturate_u', 'sub_saturate_s', 'mul', 'avgr'];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        exports1[fn[z]](1, 0, 32);
        exports2[fn[z]](1, 0, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 128, 32);
        exports2[fn[z]](16, 128, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](128, 16, 32);
        exports2[fn[z]](128, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](128, 2, 32);
        exports2[fn[z]](128, 2, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 16, 32);
        exports2[fn[z]](0, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](12, 5, 32);
        exports2[fn[z]](12, 5, 32);
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

        exports1[fn[z]](98, 98, 0);
        exports2[fn[z]](98, 98, 0);
        expect(memory2).toStrictEqual(memory1);

        for (let i = 0; i < 16; i++) {
          memory1[i] = i % 2 === 1 ? 0x7F : 0xFF;
          memory2[i] = i % 2 === 1 ? 0x7F : 0xFF;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        exports1[fn[z]](0, 16, 32);
        exports2[fn[z]](0, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 0, 32);
        exports2[fn[z]](16, 0, 32);
        expect(memory2).toStrictEqual(memory1);
      }

      for (let i = 0; i < 16; i++) {
        memory1[i] = i;
        memory2[i] = i;
        memory1[i + 16] = 0xFF;
        memory2[i + 16] = 0xFF;
      }

      exports1.neg(0, 32);
      exports2.neg(0, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.neg(16, 32);
      exports2.neg(16, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.neg(12, 32);
      exports2.neg(12, 32);
      expect(memory2).toStrictEqual(memory1);

      for (let i = 0; i < 16; i++) {
        memory1[i] = i;
        memory2[i] = i;
        memory1[i + 16] = 0xFF;
        memory2[i + 16] = 0xFF;
      }

      exports1.abs(0, 32);
      exports2.abs(0, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.abs(16, 32);
      exports2.abs(16, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.abs(12, 32);
      exports2.abs(12, 32);
      expect(memory2).toStrictEqual(memory1);
    },
  );
});
