import { transform } from '../lib/index';
const wabtFactory = require('wabt');
/* global test, expect */
let wabt = null;

beforeAll(async () => {
  wabt = await wabtFactory();
});

async function compileTest(wat, callback): Promise<any> {
  const { buffer } = wabt.parseWat('file', wat).toBinary({});
  const instance = await WebAssembly.instantiate(buffer, {});
  await callback(instance.instance);
  const newBinary = transform(buffer, {});
  const newInstance = await WebAssembly.instantiate(newBinary, {});
  await callback(newInstance.instance);
}

test('simple strings', async () => {
  await compileTest(
    `(module
      (func $add (param $lhs i32) (param $rhs i32) (result i32)
        get_local $lhs
        get_local $rhs
        i32.add)
      (export "add" (func $add)))`,
    async ({ exports }) => {
      expect(exports.add(1, 2)).toBe(3);
    },
  );
});
