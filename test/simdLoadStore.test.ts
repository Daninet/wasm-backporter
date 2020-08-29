import { compileTest } from './util';
/* global test, expect */

test('v128.load + v128.store', async () => {
  await compileTest(
    ['fd00', 'fd0b'],
    `(module
      (memory 1)
      (func $copy (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        v128.store)
      (export "copy" (func $copy))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      for (let i = 0; i < 16; i++) {
        memory1[i] = i;
        memory2[i] = i;
      }

      exports1.copy(0, 16);
      exports2.copy(0, 16);
      expect(memory2).toStrictEqual(memory1);

      exports1.copy(1, 32);
      exports2.copy(1, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.copy(10, 9);
      exports2.copy(10, 9);
      expect(memory2).toStrictEqual(memory1);

      exports1.copy(5, 6);
      exports2.copy(5, 6);
      expect(memory2).toStrictEqual(memory1);
    },
  );
});

test('load_extend', async () => {
  await compileTest(
    ['fd06', 'fd05', 'fd04', 'fd03', 'fd02', 'fd01'],
    `(module
      (memory 1)
      (func $load32x2u (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i64x2.load32x2_u
        v128.store)

      (func $load32x2s (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i64x2.load32x2_s
        v128.store)

      (func $load16x4u (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i32x4.load16x4_u
        v128.store)

      (func $load16x4s (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i32x4.load16x4_s
        v128.store)

      (func $load8x8u (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i16x8.load8x8_u
        v128.store)

      (func $load8x8s (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        i16x8.load8x8_s
        v128.store)

      (export "load32x2u" (func $load32x2u))
      (export "load32x2s" (func $load32x2s))
      (export "load16x4u" (func $load16x4u))
      (export "load16x4s" (func $load16x4s))
      (export "load8x8u" (func $load8x8u))
      (export "load8x8s" (func $load8x8s))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['load32x2u', 'load32x2s', 'load16x4u', 'load16x4s', 'load8x8u', 'load8x8s'];

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

test('v128.const + v128.store', async () => {
  // await compileTest(
  //   ['fd0c', 'fd0b'],
  //   `(module
  //     (memory 1)
  //     (func $constInc (param $dst i32)
  //       get_local $dst
  //       v128.const i8x16 0x00 0x01 0x02 0x03 0x04 0x05 0x06 0x07 0x08 0x09 0x0a 0x0b 0x0c 0x0d 0x0e 0x0f
  //       v128.store)

  //     ;; (func $constMax (param $dst i32)
  //     ;;   get_local $dst
  //     ;;   v128.const i64x2 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff 0xff
  //     ;;   v128.store)

  //     (export "constInc" (func $constInc))
  //     ;; (export "constMax" (func $constMax))
  //     (export "memory" (memory 0)))`,
  //   async (exports1, exports2) => {
  //     const memory1 = Buffer.from(exports1.memory.buffer);
  //     const memory2 = Buffer.from(exports2.memory.buffer);

  //     exports1.constInc(16);
  //     exports2.constInc(16);
  //     expect(memory2).toStrictEqual(memory1);

  //     exports1.constInc(32);
  //     exports2.constInc(32);
  //     expect(memory2).toStrictEqual(memory1);

  //     exports1.constMax(16);
  //     exports2.constMax(16);
  //     expect(memory2).toStrictEqual(memory1);

  //     exports1.constMax(0);
  //     exports2.constMax(0);
  //     expect(memory2).toStrictEqual(memory1);
  //   },
  // );
});
