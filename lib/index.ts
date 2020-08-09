import { memoryFill } from './polyfills';
import { createSections } from './sections/index';

type IAvailableTransforms = 'auto' | 'memory';

interface ITransformOptions {
  transform?: IAvailableTransforms[];
}

export function transform(
  wasm: Uint8Array, options: ITransformOptions = {},
): Uint8Array {
  const sections = createSections(Buffer.from(wasm));
  const fnIndex = sections.addFunction(memoryFill.function);
  sections.setInstructionReplacer(memoryFill.replacer, fnIndex);
  const exported = sections.export();
  return new Uint8Array(exported.buffer, exported.byteOffset, exported.byteLength);
}

export default transform;
