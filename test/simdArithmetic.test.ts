import { compileTest } from './util';
/* global test, expect */

test('i64x2 add + sub + mul + neg', async () => {
  await compileTest(
    ['fdce', 'fdd1', 'fdd5', 'fdc1'],
    `(module
      (memory 1)
      (func $add (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i64x2.add
        v128.store)

      (func $sub (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i64x2.sub
        v128.store)

      (func $mul (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i64x2.mul
        v128.store)

      (func $neg (param $src i32) (param $dst i32)
        get_local $dst
        get_local $src
        v128.load
        i64x2.neg
        v128.store)

      (export "add" (func $add))
      (export "sub" (func $sub))
      (export "mul" (func $mul))
      (export "neg" (func $neg))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['add', 'sub', 'mul'];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        exports1[fn[z]](1, 0, 32);
        exports2[fn[z]](1, 0, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 16, 32);
        exports2[fn[z]](0, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](12, 5, 32);
        exports2[fn[z]](12, 5, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 16, 32);
        exports2[fn[z]](16, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](24, 9, 5);
        exports2[fn[z]](24, 9, 5);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](98, 98, 0);
        exports2[fn[z]](98, 98, 0);
        expect(memory2).toStrictEqual(memory1);
      }

      for (let i = 0; i < 16; i++) {
        memory1[i] = i;
        memory2[i] = i;
        memory1[i + 16] = 0xFF;
        memory2[i + 16] = 0xFF;
      }

      exports1.neg(0, 32);
      exports2.neg(0, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.neg(16, 32);
      exports2.neg(16, 32);
      expect(memory2).toStrictEqual(memory1);

      exports1.neg(12, 32);
      exports2.neg(12, 32);
      expect(memory2).toStrictEqual(memory1);
    },
  );
});

test('i32x4 add + sub + mul + neg', async () => {
  await compileTest(
    ['fdae', 'fdb1', 'fdb5'/* , 'fda1' */],
    `(module
      (memory 1)
      (func $add (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.add
        v128.store)

      (func $sub (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.sub
        v128.store)

      (func $mul (param $srca i32) (param $srcb i32) (param $dst i32)
        get_local $dst
        get_local $srca
        v128.load
        get_local $srcb
        v128.load
        i32x4.mul
        v128.store)

      ;; (func $neg (param $src i32) (param $dst i32)
      ;;   get_local $dst
      ;;   get_local $src
      ;;   v128.load
      ;;   i32x4.neg
      ;;   v128.store)

      (export "add" (func $add))
      (export "sub" (func $sub))
      (export "mul" (func $mul))
      ;; (export "neg" (func $neg))
      (export "memory" (memory 0)))`,
    async (exports1, exports2) => {
      const memory1 = Buffer.from(exports1.memory.buffer);
      const memory2 = Buffer.from(exports2.memory.buffer);

      const fn = ['add', 'sub', 'mul'];

      for (let z = 0; z < fn.length; z++) {
        for (let i = 0; i < 16; i++) {
          memory1[i] = i;
          memory2[i] = i;
          memory1[i + 16] = 0xFF;
          memory2[i + 16] = 0xFF;
        }

        console.log(fn[z]);
        console.log(memory1.slice(1, 17));
        console.log(memory1.slice(0, 16));
        exports1[fn[z]](1, 0, 32);
        exports2[fn[z]](1, 0, 32);
        console.log(memory1.slice(32, 48));
        console.log(memory2.slice(32, 48));
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](0, 16, 32);
        exports2[fn[z]](0, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](12, 5, 32);
        exports2[fn[z]](12, 5, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](16, 16, 32);
        exports2[fn[z]](16, 16, 32);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](24, 9, 5);
        exports2[fn[z]](24, 9, 5);
        expect(memory2).toStrictEqual(memory1);

        exports1[fn[z]](98, 98, 0);
        exports2[fn[z]](98, 98, 0);
        expect(memory2).toStrictEqual(memory1);
      }

      // for (let i = 0; i < 16; i++) {
      //   memory1[i] = i;
      //   memory2[i] = i;
      //   memory1[i + 16] = 0xFF;
      //   memory2[i + 16] = 0xFF;
      // }

      // exports1.neg(0, 32);
      // exports2.neg(0, 32);
      // expect(memory2).toStrictEqual(memory1);

      // exports1.neg(16, 32);
      // exports2.neg(16, 32);
      // expect(memory2).toStrictEqual(memory1);

      // exports1.neg(12, 32);
      // exports2.neg(12, 32);
      // expect(memory2).toStrictEqual(memory1);
    },
  );
});
