/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U8_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i8x16Opi32(instruction: number, localIndices: Uint8Array[], signed: boolean): Uint8Array {
  const buf = [];
  const signExtension = signed ? [op['i32.extend8_s']] : [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 8; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        op['i64.const'], j * 0x8,
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        ...signExtension,
        op['local.get'], ...localIndices[2],
        instruction,
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        op['i64.extend_i32_u'],
        op['i64.const'], j * 0x8,
        op['i64.shl'],
        op['i64.or'],
      ]));
    }
  }

  return new Uint8Array([
    op['i32.const'], 0x8,
    op['i32.rem_u'],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    op['i64.const'], 0,
    ...buf[0], ...buf[1], ...buf[2], ...buf[3],
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],

    op['i64.const'], 0,
    ...buf[8], ...buf[9], ...buf[10], ...buf[11],
    ...buf[12], ...buf[13], ...buf[14], ...buf[15],
  ]);
}

export const i8x16Shl: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.shl',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Opi32(op['i32.shl'], localIndices, false)
  ),
};

export const i8x16ShrU: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.shr_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Opi32(op['i32.shr_u'], localIndices, false)
  ),
};

export const i8x16ShrS: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.shr_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Opi32(op['i32.shr_s'], localIndices, true)
  ),
};
