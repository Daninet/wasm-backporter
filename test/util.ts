import { transform } from '../lib/index';
// const fs = require('fs');
const wabtFactory = require('wabt');

let wabt = null;

export async function compileTest(instruction, wat, callback): Promise<any> {
  if (!wabt) {
    wabt = await wabtFactory();
  }

  expect(instruction.length).toBeGreaterThan(1);
  const instructionBuf = Buffer.from(instruction, 'hex');

  const { buffer } = wabt.parseWat('file', wat, { bulk_memory: true }).toBinary({});
  // fs.writeFileSync('in.wasm', buffer);
  expect(Buffer.from(buffer).includes(instructionBuf)).toBe(true);
  const instance = await WebAssembly.instantiate(buffer, {});
  await callback(instance.instance);

  const newBinary = transform(buffer, {});
  // fs.writeFileSync('out.wasm', newBinary);
  expect(Buffer.from(newBinary).includes(instructionBuf)).toBe(false);
  const newInstance = await WebAssembly.instantiate(newBinary, {});
  await callback(newInstance.instance);
}
