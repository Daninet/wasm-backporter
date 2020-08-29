/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i32x4Bitmask: IPolyfill = {
  locals: ['i64', 'i32'],
  match: (instruction) => instruction.name === 'i32x4.bitmask',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      // op['i32.const'], 0x00,
      // op['local.set'], ...localIndices[1],

      // op['local.tee'], ...localIndices[0],
      // op['i32.wrap_i64'],
      // op['i32.const'], 0x1f,
      // op['i32.shr_u'],
      // op['local.get'], ...localIndices[1],
      // op['i32.or'],
      // op['local.set'], ...localIndices[1],

      // op['local.get'], ...localIndices[0],
      // op['i32.const'], 0x3f,
      // op['i32.shr_u'],
      // op['i32.wrap_i64'],
      // op['local.get'], ...localIndices[1],
      // op['i32.or'],
      // op['local.set'], ...localIndices[1],

      // op['local.tee'], ...localIndices[0],
      // op['i32.const'], 0x1f,
      // op['i32.shr_u'],
      // op['i32.wrap_i64'],
      // op['local.get'], ...localIndices[1],
      // op['i32.or'],
      // op['local.set'], ...localIndices[1],

      // op['local.get'], ...localIndices[0],
      // op['i32.const'], 0x3f,
      // op['i32.shr_u'],
      // op['i32.wrap_i64'],
      // op['local.get'], ...localIndices[1],
      // op['i32.or'],
      // op['local.set'], ...localIndices[1],
    ])
  ),
};
