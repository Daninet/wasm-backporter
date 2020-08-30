/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

// TODO support offsets
export const v128Load: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'v128.load',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['local.tee'], ...localIndices[0],
      op['i64.load'], 0x00, 0x00,
      op['local.get'], ...localIndices[0],
      op['i32.const'], 0x08,
      op['i32.add'],
      op['i64.load'], 0x00, 0x00,
    ])
  ),
};

export const v128Const: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'v128.const',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      // TODO
    ])
  ),
};
