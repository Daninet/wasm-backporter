import { compileTest } from './util';
/* global test, expect */

test('i32x4.bitmask', async () => {
  await compileTest(
    ['fda4'],
    `(module
      (memory 1)
      (func $bitmask (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i32x4.bitmask
        v128.store)

      (export "bitmask" (func $bitmask))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      for (let i = 0; i < 16; i++) {
        memory1[i] = i;
        memory2[i] = i;
        memory1[i + 16] = 0xFF;
        memory2[i + 16] = 0xFF;
      }

      exports1.bitmask(0, 0);
      exports2.bitmask(0, 0);
      expect(memory2).toStrictEqual(memory1);

      exports1.bitmask(14, 32);
      exports2.bitmask(14, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.bitmask(15, 32);
      exports2.bitmask(15, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.bitmask(16, 32);
      exports2.bitmask(16, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.bitmask(32, 64);
      exports2.bitmask(32, 64);
      expect(memory2).toStrictEqual(memory1);

      exports1.bitmask(16, 16);
      exports2.bitmask(16, 16);
      expect(memory2).toStrictEqual(memory1);
    },
  );
});
