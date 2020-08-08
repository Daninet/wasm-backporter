import { memoryFill } from './polyfills';
import { disassemble, getModifications, reassemble } from "./transformer";

type IAvailableTransforms = 'auto' | 'memory';

interface ITransformOptions {
  transform?: IAvailableTransforms[];
}

const getReplacement = (func, instruction) => {
  if (instruction.name === 'memory.fill') {
    return Buffer.from([
      0x02, 0x40, // block
      0x0d, 0x00, // br_if 0
    ]);
  }
  return null;
};

export function transform(wasm: Uint8Array, options: ITransformOptions = {}): Uint8Array {
  const newFunctions = [memoryFill];
  // console.log(wasm);
  const disassembly = disassemble(wasm);
  console.log('disassembly', disassembly);
  const modifications = getModifications(wasm, disassembly, getReplacement);
  const newWasm = reassemble(wasm, disassembly, modifications, newFunctions);
  // console.log(newWasm);
  return newWasm;
}

export default transform;
