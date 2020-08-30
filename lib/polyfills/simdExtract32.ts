/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i32x4ExtractLane: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i32x4.extract_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    switch (instruction.params[0]) {
      case 0:
        return new Uint8Array([
          op['drop'],
          op['i32.wrap_i64'],
        ]);
      case 1:
        return new Uint8Array([
          op['drop'],
          op['i64.const'], 0x20,
          op['i64.shr_u'],
          op['i32.wrap_i64'],
        ]);
      case 2:
        return new Uint8Array([
          op['local.set'], ...localIndices[0],
          op['drop'],
          op['local.get'], ...localIndices[0],
          op['i32.wrap_i64'],
        ]);
      default:
        return new Uint8Array([
          op['local.set'], ...localIndices[0],
          op['drop'],
          op['local.get'], ...localIndices[0],
          op['i64.const'], 0x20,
          op['i64.shr_u'],
          op['i32.wrap_i64'],
        ]);
    }
  },
};
