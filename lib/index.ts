import {
  dataDrop, elemDrop, memoryCopy, memoryFill,
} from './polyfills/index';
import { IInstruction } from './sections/codeFunction';
import { createSections } from './sections/index';

type IAvailableTransforms = 'auto' | 'memory';

interface ITransformOptions {
  transform?: IAvailableTransforms[];
}

const polyfills = [memoryFill, dataDrop, elemDrop, memoryCopy];
const handlerArr = [];

function replacer(instruction: IInstruction): Uint8Array {
  // eslint-disable-next-line no-restricted-syntax
  for (const handler of handlerArr) {
    const res = handler.replacer(instruction, handler.fnIndex);
    if (res !== null) {
      return res;
    }
  }
  return null;
}

function makeReplacements(sections) {
  polyfills.forEach((p) => {
    let fnIndex = null;
    if (p.function !== null) {
      fnIndex = sections.addFunction(p.function);
    }
    handlerArr.push({
      fnIndex,
      replacer: p.replacer,
    });
  });
}

export function transform(
  wasm: Uint8Array, options: ITransformOptions = {},
): Uint8Array {
  const sections = createSections(Buffer.from(wasm));
  makeReplacements(sections);
  sections.setInstructionReplacer(replacer);
  const exported = sections.export();
  return new Uint8Array(exported.buffer, exported.byteOffset, exported.byteLength);
}

export default transform;
