import { compileTest } from './util';
/* global test, expect */

test('memory.fill', async () => {
  await compileTest(
    ['fc0b'],
    `(module
      (memory 1)
      (func $fill (param $dst i32) (param $value i32) (param $size i32) (result i32)
        get_local $dst
        get_local $value
        get_local $size
        memory.fill
        get_local $dst
        i32.load8_u)
      (export "fill" (func $fill))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      expect(memory1.every((item) => item === 0)).toBe(true);
      expect(memory2.every((item) => item === 0)).toBe(true);

      expect(exports1.fill(0, 0xBE, 16)).toBe(exports2.fill(0, 0xBE, 16));
      expect(memory1).toStrictEqual(memory2);

      expect(exports1.fill(0, 0x12, 0)).toBe(exports2.fill(0, 0x12, 0));
      expect(memory1).toStrictEqual(memory2);

      expect(exports1.fill(15, 0x23, 1)).toBe(exports2.fill(15, 0x23, 1));
      expect(memory1).toStrictEqual(memory2);

      expect(exports1.fill(1500, 0x99, 700)).toBe(exports2.fill(1500, 0x99, 700));
      expect(memory1).toStrictEqual(memory2);
    },
  );
});
