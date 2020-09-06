import { compileTest } from './util';
/* global test, expect */

test('v128.load + i32x4.extract_lane + f32x4.extract_lane', async () => {
  await compileTest(
    ['fd00', 'fd1b', 'fd1f'],
    `(module
      (memory 1)
      (func $extract0 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i32x4.extract_lane 0
        i32.store)

      (func $extract1 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i32x4.extract_lane 1
        i32.store)

      (func $extract2 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i32x4.extract_lane 2
        i32.store)
    
      (func $extract3 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i32x4.extract_lane 3
        i32.store)

      (func $f_extract0 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f32x4.extract_lane 0
        f32.store)

      (func $f_extract1 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f32x4.extract_lane 1
        f32.store)

      (func $f_extract2 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f32x4.extract_lane 2
        f32.store)
    
      (func $f_extract3 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        f32x4.extract_lane 3
        f32.store)

      (export "extract0" (func $extract0))
      (export "extract1" (func $extract1))
      (export "extract2" (func $extract2))
      (export "extract3" (func $extract3))

      (export "f_extract0" (func $f_extract0))
      (export "f_extract1" (func $f_extract1))
      (export "f_extract2" (func $f_extract2))
      (export "f_extract3" (func $f_extract3))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = [
        'extract0', 'extract1', 'extract2', 'extract3',
        'f_extract0', 'f_extract1', 'f_extract2', 'f_extract3',
      ];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
        }

        exports1[fn[z]](0, 16);
        exports2[fn[z]](0, 16);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](1, 32);
        exports2[fn[z]](1, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](3, 0);
        exports2[fn[z]](3, 0);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});
