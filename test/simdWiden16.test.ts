import { compileTest } from './util';
/* global test, expect */

test('i16x8.widen', async () => {
  await compileTest(
    ['fd87', 'fd88', 'fd89', 'fd8a'],
    `(module
      (memory 1)
      (func $widen_high_i8x16_u (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.widen_high_i8x16_u
        v128.store)

      (func $widen_high_i8x16_s (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.widen_high_i8x16_s
        v128.store)

      (func $widen_low_i8x16_u (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.widen_low_i8x16_u
        v128.store)

      (func $widen_low_i8x16_s (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.widen_low_i8x16_s
        v128.store)

      (export "widen_high_i8x16_u" (func $widen_high_i8x16_u))
      (export "widen_high_i8x16_s" (func $widen_high_i8x16_s))
      (export "widen_low_i8x16_u" (func $widen_low_i8x16_u))
      (export "widen_low_i8x16_s" (func $widen_low_i8x16_s))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['widen_high_i8x16_u', 'widen_high_i8x16_s', 'widen_low_i8x16_u', 'widen_low_i8x16_s'];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        for (let i = 0; i < 20; i++) {
          exports1[fn[z]](i, 48);
          exports2[fn[z]](i, 48);
          expect(memory2).toStrictEqual(memory1);
        }
      }
    },
  );
});
