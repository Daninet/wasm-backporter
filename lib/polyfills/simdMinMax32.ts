/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i32x4Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  const buf = [];
  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i32.wrap_i64'],
      instruction,
      op['select'],
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      instruction,
      op['select'],
      op['i64.extend_i32_u'],
      op['i64.const'], 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0], ...buf[1],
  ]);
}

export const i32x4MinS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.min_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.lt_s'], localIndices)
  ),
};

export const i32x4MinU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.min_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.lt_u'], localIndices)
  ),
};

export const i32x4MaxS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.max_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.gt_s'], localIndices)
  ),
};

export const i32x4MaxU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.max_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.gt_u'], localIndices)
  ),
};
