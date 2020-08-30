import { compileTest } from './util';
/* global test, expect */

test('splat', async () => {
  await compileTest(
    ['fd07', 'fd08', 'fd09', 'fd0a'],
    `(module
      (memory 1)
      (func $v64x2LoadSplat (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v64x2.load_splat
        v128.store)

      (func $v32x4LoadSplat (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v32x4.load_splat
        v128.store)

      (func $v16x8LoadSplat (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v16x8.load_splat
        v128.store)

      (func $v8x16LoadSplat (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v8x16.load_splat
        v128.store)

      (export "v64x2LoadSplat" (func $v64x2LoadSplat))
      (export "v32x4LoadSplat" (func $v32x4LoadSplat))
      (export "v16x8LoadSplat" (func $v16x8LoadSplat))
      (export "v8x16LoadSplat" (func $v8x16LoadSplat))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['v64x2LoadSplat', 'v32x4LoadSplat', 'v16x8LoadSplat', 'v8x16LoadSplat'];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
          memory1[i + 32] = 0xFF - i;
          memory2[i + 32] = 0xFF - i;
        }

        for (let i = 0; i < 48; i++) {
          exports1[fn[z]](i, 64);
          exports2[fn[z]](i, 64);
          expect(memory2).toStrictEqual(memory1);
        }
      }
    },
  );
});
