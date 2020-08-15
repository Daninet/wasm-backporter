import { compileTest } from './util';
/* global test, expect */

test('i8x16 comparision', async () => {
  await compileTest(
    ['fd23', 'fd24', 'fd25', 'fd26', 'fd27', 'fd28', 'fd29', 'fd2a', 'fd2b', 'fd2c'],
    `(module
      (memory 1)
      (func $i8x16eq (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.eq
        v128.store)

      (func $i8x16ne (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.ne
        v128.store)

      (func $i8x16lts (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.lt_s
        v128.store)

      (func $i8x16ltu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.lt_u
        v128.store)

      (func $i8x16les (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.le_s
        v128.store)

      (func $i8x16leu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.le_u
        v128.store)

      (func $i8x16gts (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.gt_s
        v128.store)

      (func $i8x16gtu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.gt_u
        v128.store)

      (func $i8x16ges (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.ge_s
        v128.store)

      (func $i8x16geu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i8x16.ge_u
        v128.store)

      (export "i8x16eq" (func $i8x16eq))
      (export "i8x16ne" (func $i8x16ne))
      (export "i8x16lts" (func $i8x16lts))
      (export "i8x16ltu" (func $i8x16ltu))
      (export "i8x16les" (func $i8x16les))
      (export "i8x16leu" (func $i8x16leu))
      (export "i8x16gts" (func $i8x16gts))
      (export "i8x16gtu" (func $i8x16gtu))
      (export "i8x16ges" (func $i8x16ges))
      (export "i8x16geu" (func $i8x16geu))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);
      const fn = [
        'i8x16eq', 'i8x16ne',
        'i8x16ltu', 'i8x16leu', 'i8x16gtu', 'i8x16geu',
        'i8x16lts', 'i8x16les', 'i8x16gts', 'i8x16ges',
      ];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        console.log(memory1);
        console.log(memory2);
        console.log(fn[z]);
        exports1[fn[z]](0, 0, 33);
        exports2[fn[z]](0, 0, 33);
        console.log(memory1);
        console.log(memory2);
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
