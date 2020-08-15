import { compileTest } from './util';
/* global test, expect */

test('i8x16.extract_lane_u', async () => {
  await compileTest(
    ['fd16'],
    `(module
      (memory 1)
      (func $extract0 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.extract_lane_u 0
        get_local $src
        v128.load
        i8x16.extract_lane_u 1
        i32.const 8
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_u 2
        i32.const 16
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_u 3
        i32.const 24
        i32.shr_u
        i32.or
        i32.store)

      (func $extract1 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.extract_lane_u 4
        get_local $src
        v128.load
        i8x16.extract_lane_u 5
        i32.const 8
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_u 6
        i32.const 16
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_u 7
        i32.const 24
        i32.shr_u
        i32.or
        i32.store)

      (func $extract2 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.extract_lane_u 8
        get_local $src
        v128.load
        i8x16.extract_lane_u 9
        i32.const 8
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_u 10
        i32.const 16
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_u 11
        i32.const 24
        i32.shr_u
        i32.or
        i32.store)

      (func $extract3 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.extract_lane_u 12
        get_local $src
        v128.load
        i8x16.extract_lane_u 13
        i32.const 8
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_u 14
        i32.const 16
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_u 15
        i32.const 24
        i32.shr_u
        i32.or
        i32.store)

      (export "extract0" (func $extract0))
      (export "extract1" (func $extract1))
      (export "extract2" (func $extract2))
      (export "extract3" (func $extract3))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      for (let z = 0; z < 4; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 255 - i;
          memory2[i + 16] = 255 - i;
        }

        exports1[`extract${z}`](0, 16);
        exports2[`extract${z}`](0, 16);
        expect(memory2).toStrictEqual(memory1);

        exports1[`extract${z}`](14, 32);
        exports2[`extract${z}`](14, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[`extract${z}`](16, 32);
        exports2[`extract${z}`](16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[`extract${z}`](3, 0);
        exports2[`extract${z}`](3, 0);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});

test('i8x16.extract_lane_s', async () => {
  await compileTest(
    ['fd15'],
    `(module
      (memory 1)
      (func $extract0 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.extract_lane_s 0
        get_local $src
        v128.load
        i8x16.extract_lane_s 1
        i32.const 8
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_s 2
        i32.const 16
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_s 3
        i32.const 24
        i32.shr_u
        i32.or
        i32.store)

      (func $extract1 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.extract_lane_s 4
        get_local $src
        v128.load
        i8x16.extract_lane_s 5
        i32.const 8
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_s 6
        i32.const 16
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_s 7
        i32.const 24
        i32.shr_u
        i32.or
        i32.store)

      (func $extract2 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.extract_lane_s 8
        get_local $src
        v128.load
        i8x16.extract_lane_s 9
        i32.const 8
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_s 10
        i32.const 16
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_s 11
        i32.const 24
        i32.shr_u
        i32.or
        i32.store)

      (func $extract3 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i8x16.extract_lane_s 12
        get_local $src
        v128.load
        i8x16.extract_lane_s 13
        i32.const 8
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_s 14
        i32.const 16
        i32.shr_u
        i32.or
        get_local $src
        v128.load
        i8x16.extract_lane_s 15
        i32.const 24
        i32.shr_u
        i32.or
        i32.store)

      (export "extract0" (func $extract0))
      (export "extract1" (func $extract1))
      (export "extract2" (func $extract2))
      (export "extract3" (func $extract3))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      for (let z = 0; z < 4; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 255 - i;
          memory2[i + 16] = 255 - i;
        }

        exports1[`extract${z}`](0, 16);
        exports2[`extract${z}`](0, 16);
        expect(memory2).toStrictEqual(memory1);

        exports1[`extract${z}`](14, 32);
        exports2[`extract${z}`](14, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[`extract${z}`](16, 32);
        exports2[`extract${z}`](16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[`extract${z}`](3, 0);
        exports2[`extract${z}`](3, 0);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});
