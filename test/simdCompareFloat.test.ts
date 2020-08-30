import { compileTest } from './util';
/* global test, expect */

test('f64x2 comparision', async () => {
  await compileTest(
    ['fd47', 'fd48', 'fd49', 'fd4a', 'fd4b', 'fd4c'],
    `(module
      (memory 1)
      (func $f64x2eq (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f64x2.eq
        v128.store)

      (func $f64x2ne (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f64x2.ne
        v128.store)

      (func $f64x2lt (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f64x2.lt
        v128.store)

      (func $f64x2le (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f64x2.le
        v128.store)

      (func $f64x2gt (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f64x2.gt
        v128.store)

      (func $f64x2ge (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f64x2.ge
        v128.store)

      (export "f64x2eq" (func $f64x2eq))
      (export "f64x2ne" (func $f64x2ne))
      (export "f64x2lt" (func $f64x2lt))
      (export "f64x2le" (func $f64x2le))
      (export "f64x2gt" (func $f64x2gt))
      (export "f64x2ge" (func $f64x2ge))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);
      const fn = [
        'f64x2eq', 'f64x2ne',
        'f64x2lt', 'f64x2le',
        'f64x2gt', 'f64x2ge',
      ];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        exports1[fn[z]](0, 0, 33);
        exports2[fn[z]](0, 0, 33);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 16, 32);
        exports2[fn[z]](16, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 1, 32);
        exports2[fn[z]](0, 1, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](13, 15, 32);
        exports2[fn[z]](13, 15, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](15, 11, 32);
        exports2[fn[z]](15, 11, 32);
        expect(memory2).toStrictEqual(memory1);

        for (let i = 0; i < 32; i++) {
          memory1[i] = i % 15 === 0 ? 3 : 2;
          memory2[i] = i % 15 === 0 ? 3 : 2;
        }

        for (let i = 0; i < 16; i++) {
          exports1[fn[z]](0, i, 32);
          exports2[fn[z]](0, i, 32);
          expect(memory2).toStrictEqual(memory1);
        }

        for (let i = 0; i < 32; i++) {
          memory1[i] = i % 15 === 0 ? 2 : 3;
          memory2[i] = i % 15 === 0 ? 2 : 3;
        }

        for (let i = 0; i < 16; i++) {
          exports1[fn[z]](0, i, 32);
          exports2[fn[z]](0, i, 32);
          expect(memory2).toStrictEqual(memory1);
        }
      }
    },
  );
});

test('f32x4 comparision', async () => {
  await compileTest(
    ['fd41', 'fd42', 'fd43', 'fd44', 'fd45', 'fd46'],
    `(module
      (memory 1)
      (func $f32x4eq (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.eq
        v128.store)

      (func $f32x4ne (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.ne
        v128.store)

      (func $f32x4lt (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.lt
        v128.store)

      (func $f32x4le (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.le
        v128.store)

      (func $f32x4gt (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.gt
        v128.store)

      (func $f32x4ge (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        f32x4.ge
        v128.store)

      (export "f32x4eq" (func $f32x4eq))
      (export "f32x4ne" (func $f32x4ne))
      (export "f32x4lt" (func $f32x4lt))
      (export "f32x4le" (func $f32x4le))
      (export "f32x4gt" (func $f32x4gt))
      (export "f32x4ge" (func $f32x4ge))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);
      const fn = [
        'f32x4eq', 'f32x4ne',
        'f32x4lt', 'f32x4le',
        'f32x4gt', 'f32x4ge',
      ];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        exports1[fn[z]](0, 0, 33);
        exports2[fn[z]](0, 0, 33);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 16, 32);
        exports2[fn[z]](16, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 1, 32);
        exports2[fn[z]](0, 1, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](13, 15, 32);
        exports2[fn[z]](13, 15, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](15, 11, 32);
        exports2[fn[z]](15, 11, 32);
        expect(memory2).toStrictEqual(memory1);

        for (let i = 0; i < 32; i++) {
          memory1[i] = i % 15 === 0 ? 3 : 2;
          memory2[i] = i % 15 === 0 ? 3 : 2;
        }

        for (let i = 0; i < 16; i++) {
          exports1[fn[z]](0, i, 32);
          exports2[fn[z]](0, i, 32);
          expect(memory2).toStrictEqual(memory1);
        }

        for (let i = 0; i < 32; i++) {
          memory1[i] = i % 15 === 0 ? 2 : 3;
          memory2[i] = i % 15 === 0 ? 2 : 3;
        }

        for (let i = 0; i < 16; i++) {
          exports1[fn[z]](0, i, 32);
          exports2[fn[z]](0, i, 32);
          expect(memory2).toStrictEqual(memory1);
        }
      }
    },
  );
});
