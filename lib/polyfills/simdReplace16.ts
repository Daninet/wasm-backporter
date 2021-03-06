/* eslint-disable indent */
/* eslint-disable dot-notation */
import { EXCLUDE16, U16_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i16x8ReplaceLane: IPolyfill = {
  locals: ['i32', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.replace_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    const lane = instruction.params[0];
    return new Uint8Array([
      op['local.set'], ...localIndices[0],

      ...(lane < 4 ? [
        op['local.set'], ...localIndices[1],
      ] : []),

      op['i64.const'], ...EXCLUDE16[lane % 4],
      op['i64.and'],
      op['local.get'], ...localIndices[0],
      op['i32.const'], ...U16_MAX,
      op['i32.and'],
      op['i64.extend_i32_u'],

      ...(lane % 4 !== 0 ? [
        op['i64.const'], ((lane % 4) * 0x10),
        op['i64.shl'],
      ] : []),

      op['i64.or'],

      ...(lane < 4 ? [
        op['local.get'], ...localIndices[1],
      ] : []),
    ]);
  },
};
