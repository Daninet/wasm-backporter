/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i64x2ReplaceLane: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.replace_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    if (instruction.params[0] === 0) {
      return new Uint8Array([
        op['local.set'], ...localIndices[0],
        op['local.set'], ...localIndices[1],
        op['drop'],
        op['local.get'], ...localIndices[0],
        op['local.get'], ...localIndices[1],
      ]);
    }

    return new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['drop'],
      op['local.get'], ...localIndices[0],
    ]);
  },
};
