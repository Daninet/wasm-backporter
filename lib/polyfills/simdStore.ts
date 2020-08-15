/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const v128Store: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'v128.store',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['local.set'], ...localIndices[1],
      op['local.tee'], ...localIndices[2],
      op['local.get'], ...localIndices[1],
      op['i64.store'], 0x00, 0x00,
      op['local.get'], ...localIndices[2],
      op['i32.const'], 0x08,
      op['i32.add'],
      op['local.get'], ...localIndices[0],
      op['i64.store'], 0x00, 0x00,
    ])
  ),
};
