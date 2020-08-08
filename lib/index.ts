import { disassemble, getModifications, reassemble } from "./transformer";

type IAvailableTransforms = 'auto' | 'memory';

interface ITransformOptions {
  transform?: IAvailableTransforms[];
}

const getReplacement = (func, instruction) => {
  if (instruction.params[0] === 52) {
    return Buffer.from([0x41, 0x35, 0x41, 0x36, 0x6a]);
  }
  if (instruction.name === 'i32.eq') {
    return Buffer.from([0x41, 0x35, 0x6a, 0x46]);
  }
  return null;
};

export function transform(wasm: Uint8Array, options?: ITransformOptions = {}): Uint8Array {
  const disassembly = disassemble(wasm);
  const modifications = getModifications(wasm, disassembly, getReplacement);
  const newWasm = reassemble(wasm, disassembly, modifications);
  return newWasm;
}

export default transform;
