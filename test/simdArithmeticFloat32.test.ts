import { compileTest } from './util';
/* global test, expect */

test('f32x4 add + sub + mul + div + min + max', async () => {
  await compileTest(
    ['fde4', 'fde5', 'fde6', 'fde7', 'fde8', 'fde9'],
    `(module
      (memory 1)
      (func $add (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.add
        v128.store)

      (func $sub (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.sub
        v128.store)

      (func $mul (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.mul
        v128.store)

      (func $div (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.div
        v128.store)

      (func $min (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.min
        v128.store)

      (func $max (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.max
        v128.store)

      (export "add" (func $add))
      (export "sub" (func $sub))
      (export "mul" (func $mul))
      (export "div" (func $div))
      (export "min" (func $min))
      (export "max" (func $max))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['add', 'sub', 'mul', 'div', 'min', 'max'];

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
      }
    },
  );
});

test('f32x4 abs + sqrt + neg', async () => {
  await compileTest(
    ['fde0', 'fde1', 'fde3'],
    `(module
      (memory 1)
      (func $abs (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f32x4.abs
        v128.store)

      (func $sqrt (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f32x4.sqrt
        v128.store)

      (func $neg (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f32x4.neg
        v128.store)

      (export "abs" (func $abs))
      (export "sqrt" (func $sqrt))
      (export "neg" (func $neg))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['abs', 'sqrt', 'neg'];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        exports1[fn[z]](1, 32);
        exports2[fn[z]](1, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 32);
        exports2[fn[z]](0, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](12, 32);
        exports2[fn[z]](12, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 32);
        exports2[fn[z]](16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](24, 5);
        exports2[fn[z]](24, 5);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](98, 0);
        exports2[fn[z]](98, 0);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});
