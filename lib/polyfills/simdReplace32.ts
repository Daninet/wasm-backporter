/* eslint-disable indent */
/* eslint-disable dot-notation */
import { EXCLUDE32, U32_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i32x4ReplaceLane: IPolyfill = {
  locals: ['i32', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.replace_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    const lane = instruction.params[0];
    return new Uint8Array([
      op['local.set'], ...localIndices[0],

      ...(lane < 2 ? [
        op['local.set'], ...localIndices[1],
      ] : []),

      op['i64.const'], ...EXCLUDE32[lane % 2],
      op['i64.and'],
      op['local.get'], ...localIndices[0],
      op['i32.const'], ...U32_MAX,
      op['i32.and'],
      op['i64.extend_i32_u'],

      ...(lane % 2 !== 0 ? [
        op['i64.const'], 0x20,
        op['i64.shl'],
      ] : []),

      op['i64.or'],

      ...(lane < 2 ? [
        op['local.get'], ...localIndices[1],
      ] : []),
    ]);
  },
};
