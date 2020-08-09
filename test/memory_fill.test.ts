import { compileTest } from './util';
/* global test, expect */

test('memory.fill', async () => {
  await compileTest(
    'fc0b',
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
    async ({ exports }) => {
      const memory = Buffer.from(exports.memory.buffer);
      const buf = Buffer.alloc(memory.length);
      expect(memory.every((item) => item === 0)).toBe(true);

      expect(exports.fill(0, 0xBE, 16)).toBe(0xBE);
      buf.fill(0xBE, 0, 16);
      expect(buf).toStrictEqual(memory);

      expect(exports.fill(0, 0x12, 0)).toBe(0xBE);
      expect(buf).toStrictEqual(memory);

      expect(exports.fill(15, 0x23, 1)).toBe(0x23);
      buf.fill(0x23, 15, 15 + 1);
      expect(buf).toStrictEqual(memory);

      expect(exports.fill(1500, 0x99, 700)).toBe(0x99);
      buf.fill(0x99, 1500, 1500 + 700);
      expect(buf).toStrictEqual(memory);
    },
  );
});
