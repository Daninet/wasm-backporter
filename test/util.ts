import { transform } from '../lib/index';
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const wabtFactory = require('wabt');

let wabt = null;

export async function compileTest(instructions: string[], wat, callback): Promise<any> {
  if (!wabt) {
    wabt = await wabtFactory();
  }

  expect(instructions.length).toBeGreaterThan(0);

  const { buffer: originalBinary } =
    wabt.parseWat('file', wat, { bulk_memory: true, simd: true }).toBinary({});

  // fs.writeFileSync('in.wasm', originalBinary);

  const hexBinary = Buffer.from(originalBinary).toString('hex');
  instructions.forEach((instruction) => {
    expect(hexBinary).toMatch(instruction);
  });

  const { instance } = await WebAssembly.instantiate(originalBinary, {});

  const newBinary = transform(originalBinary, {});

  // fs.writeFileSync('out.wasm', newBinary);

  const newHexBinary = Buffer.from(newBinary).toString('hex');
  instructions.forEach((instruction) => {
    expect(newHexBinary).not.toMatch(instruction);
  });

  const { instance: newInstance } = await WebAssembly.instantiate(newBinary, {});
  await callback(instance.exports, newInstance.exports);
}
