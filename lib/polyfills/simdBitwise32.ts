/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i32x4Opi32(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  const buf = [];
  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[2],
      instruction,
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[2],
      instruction,
      op['i64.extend_i32_u'],
      op['i64.const'], 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0],
    ...buf[1],
  ]);
}

export const i32x4Shl: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i32x4.shl',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Opi32(op['i32.shl'], localIndices)
  ),
};

export const i32x4ShrU: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i32x4.shr_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Opi32(op['i32.shr_u'], localIndices)
  ),
};

export const i32x4ShrS: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i32x4.shr_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Opi32(op['i32.shr_s'], localIndices)
  ),
};
