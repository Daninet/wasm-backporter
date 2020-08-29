import { compileTest } from './util';
/* global test, expect */

test('any_true', async () => {
  await compileTest(
    ['fd62', 'fd82', 'fda2'],
    `(module
      (memory 1)
      (func $i8x16any_true (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.any_true
        i32.store)

      (func $i16x8any_true (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.any_true
        i32.store)

      (func $i32x4any_true (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i32x4.any_true
        i32.store)

      (export "i8x16any_true" (func $i8x16any_true))
      (export "i16x8any_true" (func $i16x8any_true))
      (export "i32x4any_true" (func $i32x4any_true))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      memory1[16] = 0x01;
      memory2[16] = 0x01;

      for (let i = 0; i <= 16; i++) {
        exports1.i8x16any_true(i, 48);
        exports2.i8x16any_true(i, 48);
        expect(memory2).toStrictEqual(memory1);
      }

      for (let i = 0; i <= 16; i++) {
        exports1.i16x8any_true(i, 48);
        exports2.i16x8any_true(i, 48);
        expect(memory2).toStrictEqual(memory1);
      }

      for (let i = 0; i <= 16; i++) {
        exports1.i32x4any_true(i, 48);
        exports2.i32x4any_true(i, 48);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});

test('all_true', async () => {
  await compileTest(
    ['fd63', 'fd83', 'fda3'],
    `(module
      (memory 1)
      (func $i8x16all_true (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.all_true
        i32.store)

      (func $i16x8all_true (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.all_true
        i32.store)

      (func $i32x4all_true (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i32x4.all_true
        i32.store)

      (export "i8x16all_true" (func $i8x16all_true))
      (export "i16x8all_true" (func $i16x8all_true))
      (export "i32x4all_true" (func $i32x4all_true))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const initMem = (bits) => {
        for (let i = 0; i < 32; i++) {
          memory1[i] = 0x01;
          memory2[i] = 0x01;
        }

        for (let i = 0; i < bits / 8; i++) {
          memory1[16 + i] = 0x00;
          memory2[16 + i] = 0x00;
        }
      };

      initMem(8);

      for (let i = 0; i <= 16; i++) {
        exports1.i8x16all_true(i, 48);
        exports2.i8x16all_true(i, 48);
        expect(memory2).toStrictEqual(memory1);
      }

      initMem(16);

      for (let i = 0; i <= 16; i++) {
        exports1.i16x8all_true(i, 48);
        exports2.i16x8all_true(i, 48);
        expect(memory2).toStrictEqual(memory1);
      }

      initMem(32);

      for (let i = 0; i <= 16; i++) {
        exports1.i32x4all_true(i, 48);
        exports2.i32x4all_true(i, 48);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});
