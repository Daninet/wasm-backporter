import { compileTest } from './util';
/* global test, expect */

test('memory.copy', async () => {
  await compileTest(
    'fc0a',
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
    async ({ exports }) => {
      const memory = Buffer.from(exports.memory.buffer);
      const buf = Buffer.alloc(memory.length);
      for (let i = 0; i < 1500; i++) {
        memory[i] = i % 256;
        buf[i] = i % 256;
      }

      expect(exports.copy(1, 10, 16)).toBe(0x0a);
      buf.copy(buf, 1, 10, 10 + 16);
      expect(buf).toStrictEqual(memory);

      expect(exports.copy(0, 5, 0)).toBe(0x00);
      expect(buf).toStrictEqual(memory);

      buf.copy(buf, 0, 5, 5 + 3);
      expect(exports.copy(0, 5, 3)).toBe(buf[0]);
      expect(buf).toStrictEqual(memory);

      expect(exports.copy(11, 11, 3)).toBe(buf[11]);
      expect(buf).toStrictEqual(memory);

      buf.copy(buf, 5, 1, 1 + 15);
      expect(exports.copy(5, 1, 15)).toBe(buf[5]);
      expect(buf).toStrictEqual(memory);

      buf.copy(buf, 129, 128, 128 + 5);
      expect(exports.copy(129, 128, 5)).toBe(buf[129]);
      expect(buf).toStrictEqual(memory);
    },
  );
});
