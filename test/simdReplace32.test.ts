import { compileTest } from './util';
/* global test, expect */

test('i32x4.replace_lane', async () => {
  await compileTest(
    ['fd1c', 'fd20'],
    `(module
      (memory 1)
      (func $replace0 (param $src i32) (param $line i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $line
        i32.load
        i32x4.replace_lane 0
        v128.store)

      (func $replace1 (param $src i32) (param $line i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $line
        i32.load
        i32x4.replace_lane 1
        v128.store)

      (func $replace2 (param $src i32) (param $line i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $line
        i32.load
        i32x4.replace_lane 2
        v128.store)

      (func $replace3 (param $src i32) (param $line i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $line
        i32.load
        i32x4.replace_lane 3
        v128.store)

      (func $f_replace0 (param $src i32) (param $line i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $line
        f32.load
        f32x4.replace_lane 0
        v128.store)

      (func $f_replace1 (param $src i32) (param $line i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $line
        f32.load
        f32x4.replace_lane 1
        v128.store)

      (func $f_replace2 (param $src i32) (param $line i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $line
        f32.load
        f32x4.replace_lane 2
        v128.store)

      (func $f_replace3 (param $src i32) (param $line i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        get_local $line
        f32.load
        f32x4.replace_lane 3
        v128.store)

      (export "replace0" (func $replace0))
      (export "replace1" (func $replace1))
      (export "replace2" (func $replace2))
      (export "replace3" (func $replace3))
      (export "f_replace0" (func $f_replace0))
      (export "f_replace1" (func $f_replace1))
      (export "f_replace2" (func $f_replace2))
      (export "f_replace3" (func $f_replace3))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = [
        'replace0', 'replace1', 'replace2', 'replace3',
        'f_replace0', 'f_replace1', 'f_replace2', 'f_replace3',
      ];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
        }

        exports1[fn[z]](0, 2, 16);
        exports2[fn[z]](0, 2, 16);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](4, 0, 32);
        exports2[fn[z]](4, 0, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](3, 14, 32);
        exports2[fn[z]](3, 14, 32);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});
