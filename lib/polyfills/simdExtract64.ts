/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i64x2ExtractLane: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i64x2.extract_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    if (instruction.params[0] === 0) {
      return new Uint8Array([
        op['drop'],
      ]);
    }

    return new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['drop'],
      op['local.get'], ...localIndices[0],
    ]);
  },
};
