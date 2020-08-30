/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import { i8x16Splat } from './simdSplat';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

// TODO support offsets
export const v8x16LoadSplat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'v8x16.load_splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i32.load'], 0x00, 0x00,
      ...i8x16Splat.replacer(instruction, fnIndex, localIndices),
    ])
  ),
};
