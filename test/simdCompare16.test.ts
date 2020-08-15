import { compileTest } from './util';
/* global test, expect */

test('i16x8 comparision', async () => {
  await compileTest(
    ['fd2d', 'fd2e', 'fd2f', 'fd30', 'fd31', 'fd32', 'fd33', 'fd34', 'fd35', 'fd36'],
    `(module
      (memory 1)
      (func $i16x8eq (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.eq
        v128.store)

      (func $i16x8ne (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.ne
        v128.store)

      (func $i16x8lts (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.lt_s
        v128.store)

      (func $i16x8ltu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.lt_u
        v128.store)

      (func $i16x8les (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.le_s
        v128.store)

      (func $i16x8leu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.le_u
        v128.store)

      (func $i16x8gts (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.gt_s
        v128.store)

      (func $i16x8gtu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.gt_u
        v128.store)

      (func $i16x8ges (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.ge_s
        v128.store)

      (func $i16x8geu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.ge_u
        v128.store)

      (export "i16x8eq" (func $i16x8eq))
      (export "i16x8ne" (func $i16x8ne))
      (export "i16x8lts" (func $i16x8lts))
      (export "i16x8ltu" (func $i16x8ltu))
      (export "i16x8les" (func $i16x8les))
      (export "i16x8leu" (func $i16x8leu))
      (export "i16x8gts" (func $i16x8gts))
      (export "i16x8gtu" (func $i16x8gtu))
      (export "i16x8ges" (func $i16x8ges))
      (export "i16x8geu" (func $i16x8geu))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);
      const fn = [
        'i16x8eq', 'i16x8ne',
        'i16x8ltu', 'i16x8leu', 'i16x8gtu', 'i16x8geu',
        'i16x8lts', 'i16x8les', 'i16x8gts', 'i16x8ges',
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
