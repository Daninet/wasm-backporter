import {
  dataDrop, elemDrop, memoryCopy, memoryFill,
} from './polyfills/index';
import {
  i32x4Shl, i32x4ShrS, i32x4ShrU,
  i64x2Shl, i64x2ShrS, i64x2ShrU,
  v128And, v128AndNot, v128Not, v128Or, v128Xor,
} from './polyfills/simdBitwise';
import {
  i32x4Eq, i32x4GeS, i32x4GeU, i32x4GtS,
  i32x4GtU, i32x4LeS, i32x4LeU, i32x4LtS,
  i32x4LtU, i32x4Ne,
  i16x8Eq, i16x8GeS, i16x8GeU, i16x8GtS,
  i16x8GtU, i16x8LeS, i16x8LeU, i16x8LtS,
  i16x8LtU, i16x8Ne,
  i8x16Eq, i8x16Ne,
  i8x16LtS, i8x16LtU, i8x16LeS, i8x16LeU,
  i8x16GtU, i8x16GtS, i8x16GeU, i8x16GeS,
} from './polyfills/simdCompare';
import { i16x8ExtractLaneU, i32x4ExtractLane, i64x2ExtractLane } from './polyfills/simdExtract';
import { v128Load, v16x8LoadSplat, v32x4LoadSplat, v64x2LoadSplat, v8x16LoadSplat } from './polyfills/simdLoad';
import {
  i16x8Splat, i32x4Splat, i64x2Splat, i8x16Splat,
} from './polyfills/simdSplat';
import { v128Store } from './polyfills/simdStore';
import { IPolyfill } from './polyfills/type';
import { IInstruction, IInstructionReplacerResult, ILocalType } from './sections/codeFunction';
import { createSections } from './sections/index';

type IAvailableTransforms = 'auto' | 'memory';

interface ITransformOptions {
  transform?: IAvailableTransforms[];
}

const polyfills = [
  memoryFill, dataDrop, elemDrop, memoryCopy,
  i64x2ExtractLane, i32x4ExtractLane, i16x8ExtractLaneU,
  v128Load, v128Store,
  v128Not, v128And, v128AndNot, v128Or, v128Xor,
  i64x2Shl, i64x2ShrU, i64x2ShrS, i32x4Shl, i32x4ShrU, i32x4ShrS,
  i64x2Splat, i32x4Splat, i16x8Splat, i8x16Splat,
  i32x4Eq, i32x4Ne,
  i32x4LtS, i32x4LtU, i32x4LeS, i32x4LeU,
  i32x4GtU, i32x4GtS, i32x4GeU, i32x4GeS,
  i16x8Eq, i16x8Ne,
  i16x8LtS, i16x8LtU, i16x8LeS, i16x8LeU,
  i16x8GtU, i16x8GtS, i16x8GeU, i16x8GeS,
  i8x16Eq, i8x16Ne,
  i8x16LtS, i8x16LtU, i8x16LeS, i8x16LeU,
  i8x16GtU, i8x16GtS, i8x16GeU, i8x16GeS,
  v64x2LoadSplat, v32x4LoadSplat, v16x8LoadSplat, v8x16LoadSplat,
];

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
