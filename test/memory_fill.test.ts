import { compileTest } from './util';
/* global test, expect */

test('memory.fill', async () => {
  await compileTest(
    'fc0b',
    `(module
      (memory 1)
      (func $fill (param $p1 i32) (param $p2 i32) (param $p3 i32) (result i32)
        get_local $p1 ;; target offset
        get_local $p2 ;; byte value to set
        get_local $p3 ;; length
        memory.fill
        get_local $p1
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
