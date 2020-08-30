import { compileTest } from './util';
/* global test, expect */

test('memory.copy', async () => {
  await compileTest(
    ['fc0a'],
    `(module
      (memory 1)
      (func $copy (param $dst i32) (param $src i32) (param $size i32) (result i32)
        get_local $dst
        get_local $src
        get_local $size
        memory.copy
        get_local $dst
        i32.load8_u)
      (export "copy" (func $copy))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      for (let i = 0; i < 1500; i++) {
        memory1[i] = i % 256;
        memory2[i] = i % 256;
      }

      expect(memory1).toStrictEqual(memory2);

      expect(exports1.copy(1, 10, 16)).toBe(exports2.copy(1, 10, 16));
      expect(memory1).toStrictEqual(memory2);

      expect(exports1.copy(0, 5, 0)).toBe(exports2.copy(0, 5, 0));
      expect(memory1).toStrictEqual(memory2);

      expect(exports1.copy(0, 5, 3)).toBe(exports2.copy(0, 5, 3));
      expect(memory1).toStrictEqual(memory2);

      expect(exports1.copy(11, 11, 3)).toBe(exports2.copy(11, 11, 3));
      expect(memory1).toStrictEqual(memory2);

      expect(exports1.copy(5, 1, 15)).toBe(exports2.copy(5, 1, 15));
      expect(memory1).toStrictEqual(memory2);

      expect(exports1.copy(129, 128, 5)).toBe(exports2.copy(129, 128, 5));
      expect(memory1).toStrictEqual(memory2);
    },
  );
});
