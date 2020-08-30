/* eslint-disable indent */
/* eslint-disable dot-notation */
import { EXCLUDE8, U8_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i8x16ReplaceLane: IPolyfill = {
  locals: ['i32', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.replace_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    const lane = instruction.params[0];
    return new Uint8Array([
      op['local.set'], ...localIndices[0],

      ...(lane < 8 ? [
        op['local.set'], ...localIndices[1],
      ] : []),

      op['i64.const'], ...EXCLUDE8[lane % 8],
      op['i64.and'],
      op['local.get'], ...localIndices[0],
      op['i32.const'], ...U8_MAX,
      op['i32.and'],
      op['i64.extend_i32_u'],

      ...(lane % 8 !== 0 ? [
        op['i64.const'], ((lane % 8) * 0x08),
        op['i64.shl'],
      ] : []),

      op['i64.or'],

      ...(lane < 8 ? [
        op['local.get'], ...localIndices[1],
      ] : []),
    ]);
  },
};
