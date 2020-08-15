import { compileTest } from './util';
/* global test, expect */

test('i32x4 comparision', async () => {
  await compileTest(
    ['fd37', 'fd38', 'fd39', 'fd3a', 'fd3b', 'fd3c', 'fd3d', 'fd3e', 'fd3f', 'fd40'],
    `(module
      (memory 1)
      (func $i32x4eq (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.eq
        v128.store)

      (func $i32x4ne (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.ne
        v128.store)

      (func $i32x4lts (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.lt_s
        v128.store)

      (func $i32x4ltu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.lt_u
        v128.store)

      (func $i32x4les (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.le_s
        v128.store)

      (func $i32x4leu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.le_u
        v128.store)

      (func $i32x4gts (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.gt_s
        v128.store)

      (func $i32x4gtu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.gt_u
        v128.store)

      (func $i32x4ges (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.ge_s
        v128.store)

      (func $i32x4geu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.ge_u
        v128.store)

      (export "i32x4eq" (func $i32x4eq))
      (export "i32x4ne" (func $i32x4ne))
      (export "i32x4lts" (func $i32x4lts))
      (export "i32x4ltu" (func $i32x4ltu))
      (export "i32x4les" (func $i32x4les))
      (export "i32x4leu" (func $i32x4leu))
      (export "i32x4gts" (func $i32x4gts))
      (export "i32x4gtu" (func $i32x4gtu))
      (export "i32x4ges" (func $i32x4ges))
      (export "i32x4geu" (func $i32x4geu))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);
      const fn = [
        'i32x4eq', 'i32x4ne',
        'i32x4lts', 'i32x4ltu', 'i32x4les', 'i32x4leu',
        'i32x4gts', 'i32x4gtu', 'i32x4ges', 'i32x4geu',
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
