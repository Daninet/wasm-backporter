import { transform } from '../lib/index';
const wabtFactory = require('wabt');
/* global test, expect */
let wabt = null;

beforeAll(async () => {
  wabt = await wabtFactory();
});

async function compileTest(instruction, wat, callback): Promise<any> {
  expect(instruction.length).toBeGreaterThan(1);
  const instructionBuf = Buffer.from(instruction, 'hex');

  const { buffer } = wabt.parseWat('file', wat, { bulk_memory: true }).toBinary({});
  expect(Buffer.from(buffer).includes(instructionBuf)).toBe(true);
  const instance = await WebAssembly.instantiate(buffer, {});
  await callback(instance.instance);

  const newBinary = transform(buffer, {});
  expect(Buffer.from(newBinary).includes(instructionBuf)).toBe(false);
  const newInstance = await WebAssembly.instantiate(newBinary, {});
  await callback(newInstance.instance);
}

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
      (export "fill" (func $fill)))`,
    async ({ exports }) => {
      expect(exports.fill(0, 0xBE, 16)).toBe(0xBE);
    },
  );
});
