import { compileTest } from './util';
/* global test, expect */

test('f32x4 convert', async () => {
  await compileTest(
    ['fdfa', 'fdfb'],
    `(module
      (memory 1)
      (func $convertS (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f32x4.convert_i32x4_s
        v128.store)

      (func $convertU (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f32x4.convert_i32x4_u
        v128.store)

      (export "convertS" (func $convertS))
      (export "convertU" (func $convertU))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['convertS', 'convertU'];

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
