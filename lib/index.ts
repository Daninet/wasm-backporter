import { polyfills } from './polyfills';
import { IPolyfill } from './polyfills/type';
import { IInstruction, IInstructionReplacerResult, ILocalType } from './sections/codeFunction';
import { createSections } from './sections/index';

type IAvailableTransforms = 'auto' | 'memory';

interface ITransformOptions {
  transform?: IAvailableTransforms[];
}

interface IHandler {
  fnIndex: Uint8Array;
  locals: ILocalType[];
  match: IPolyfill['match'];
  replacer: IPolyfill['replacer'];
}

const handlers: IHandler[] = [];

function replacer(instruction: IInstruction): IInstructionReplacerResult {
  // eslint-disable-next-line no-restricted-syntax
  for (const handler of handlers) {
    const match = handler.match(instruction);
    if (match) {
      return {
        getReplacement:
          (localIndices) => handler.replacer(instruction, handler.fnIndex, localIndices),
        locals: handler.locals,
      };
    }
  }
  return null;
}

function setupReplacementHandlers(sections: ReturnType<typeof createSections>) {
  polyfills.forEach((p) => {
    let fnIndex: Uint8Array = null;
    if (p.function) {
      fnIndex = sections.addFunction(p.function);
    }

    handlers.push({
      fnIndex,
      locals: p.locals,
      match: p.match,
      replacer: p.replacer,
    });
  });
}

export function transform(
  wasm: Uint8Array, options: ITransformOptions = {},
): Uint8Array {
  const sections = createSections(Buffer.from(wasm));
  setupReplacementHandlers(sections);
  sections.setInstructionReplacer(replacer);
  const exported = sections.export();
  return new Uint8Array(exported.buffer, exported.byteOffset, exported.byteLength);
}

export default transform;
