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
