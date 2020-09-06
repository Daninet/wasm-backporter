/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function f32x4Converti32x4(localIndices: Uint8Array[], signed: boolean) {
  const buf = [];

  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      signed ? op['f32.convert_i32_s'] : op['f32.convert_i32_u'],
      op['i32.reinterpret_f32'],
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      signed ? op['f32.convert_i32_s'] : op['f32.convert_i32_u'],
      op['i32.reinterpret_f32'],
      op['i64.extend_i32_u'],
      op['i64.const'], 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0], ...buf[1],
  ]);
}

export const f32x4Converti32x4U: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.convert_i32x4_u',
  replacer: (instruction, fnIndex, localIndices) => f32x4Converti32x4(localIndices, false),
};

export const f32x4Converti32x4S: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.convert_i32x4_s',
  replacer: (instruction, fnIndex, localIndices) => f32x4Converti32x4(localIndices, true),
};
