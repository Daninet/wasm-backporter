/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import { i64x2Splat } from './simdSplat';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

// TODO support offsets
export const v64x2LoadSplat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'v64x2.load_splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.load'], 0x00, 0x00,
      ...i64x2Splat.replacer(instruction, fnIndex, localIndices),
    ])
  ),
};

function i64x2Load32x2(localIndices: Uint8Array[], signed: boolean) {
  const extend = signed ? op['i64.extend_i32_s'] : op['i64.extend_i32_u'];

  return new Uint8Array([
    op['local.tee'], ...localIndices[0],
    op['i32.load'], 0x00, 0x00,
    extend,
    op['local.get'], ...localIndices[0],
    op['i32.const'], 0x04,
    op['i32.add'],
    op['i32.load'], 0x00, 0x00,
    extend,
  ]);
}

export const i64x2Load32x2U: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i64x2.load32x2_u',
  replacer: (instruction, fnIndex, localIndices) => i64x2Load32x2(localIndices, false),
};

export const i64x2Load32x2S: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i64x2.load32x2_s',
  replacer: (instruction, fnIndex, localIndices) => i64x2Load32x2(localIndices, true),
};
