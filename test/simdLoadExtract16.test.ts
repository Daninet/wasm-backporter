import { compileTest } from './util';
/* global test, expect */

test('i16x8.extract_lane_u', async () => {
  await compileTest(
    ['fd19'],
    `(module
      (memory 1)
      (func $extract0 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_u 0
        i32.store)

      (func $extract1 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_u 1
        i32.store)

      (func $extract2 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_u 2
        i32.store)

      (func $extract3 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_u 3
        i32.store)

      (func $extract4 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_u 4
        i32.store)

      (func $extract5 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_u 5
        i32.store)

      (func $extract6 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_u 6
        i32.store)

      (func $extract7 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_u 7
        i32.store)

      (export "extract0" (func $extract0))
      (export "extract1" (func $extract1))
      (export "extract2" (func $extract2))
      (export "extract3" (func $extract3))
      (export "extract4" (func $extract4))
      (export "extract5" (func $extract5))
      (export "extract6" (func $extract6))
      (export "extract7" (func $extract7))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      for (let z = 0; z < 8; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 16 - i;
          memory2[i + 16] = 16 - i;
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

test('i16x8.extract_lane_s', async () => {
  await compileTest(
    ['fd18'],
    `(module
      (memory 1)
      (func $extract0 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_s 0
        i32.store)

      (func $extract1 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_s 1
        i32.store)

      (func $extract2 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_s 2
        i32.store)

      (func $extract3 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_s 3
        i32.store)

      (func $extract4 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_s 4
        i32.store)

      (func $extract5 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_s 5
        i32.store)

      (func $extract6 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_s 6
        i32.store)

      (func $extract7 (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i16x8.extract_lane_s 7
        i32.store)

      (export "extract0" (func $extract0))
      (export "extract1" (func $extract1))
      (export "extract2" (func $extract2))
      (export "extract3" (func $extract3))
      (export "extract4" (func $extract4))
      (export "extract5" (func $extract5))
      (export "extract6" (func $extract6))
      (export "extract7" (func $extract7))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      for (let z = 0; z < 8; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 255 - i;
          memory2[i + 16] = 255 - i;
        }

        exports1[`extract${z}`](16, 32);
        exports2[`extract${z}`](16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[`extract${z}`](0, 16);
        exports2[`extract${z}`](0, 16);
        expect(memory2).toStrictEqual(memory1);

        exports1[`extract${z}`](14, 32);
        exports2[`extract${z}`](14, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[`extract${z}`](3, 0);
        exports2[`extract${z}`](3, 0);
        expect(memory2).toStrictEqual(memory1);
      }
    },
  );
});
