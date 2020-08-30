import { compileTest } from './util';
/* global test, expect */

test('i16x8 min + max', async () => {
  await compileTest(
    ['fd96', 'fd97', 'fd98', 'fd99'],
    `(module
      (memory 1)
      (func $mins (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.min_s
        v128.store)

      (func $minu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.min_u
        v128.store)

      (func $maxs (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.max_s
        v128.store)

      (func $maxu (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i16x8.max_u
        v128.store)

      (export "mins" (func $mins))
      (export "minu" (func $minu))
      (export "maxs" (func $maxs))
      (export "maxu" (func $maxu))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['mins', 'minu', 'maxs', 'maxu'];

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
