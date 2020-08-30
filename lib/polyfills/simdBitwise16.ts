/* eslint-disable indent */
/* eslint-disable dot-notation */
import { encodeULEB128 } from '../leb128';
import { U16_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i16x8Opi32(instruction: number, localIndices: Uint8Array[], signed: boolean): Uint8Array {
  const buf = [];
  const signExtension = signed ? [op['i32.extend16_s']] : [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 4; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        op['i64.const'], encodeULEB128(j * 0x10),
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        ...signExtension,
        op['local.get'], ...localIndices[2],
        instruction,
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        op['i64.extend_i32_u'],
        op['i64.const'], encodeULEB128(j * 0x10),
        op['i64.shl'],
        op['i64.or'],
      ]));
    }
  }

  return new Uint8Array([
    op['i32.const'], 0x10,
    op['i32.rem_u'],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    op['i64.const'], 0,
    ...buf[0], ...buf[1], ...buf[2], ...buf[3],

    op['i64.const'], 0,
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],
  ]);
}

export const i16x8Shl: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.shl',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Opi32(op['i32.shl'], localIndices, false)
  ),
};

export const i16x8ShrU: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.shr_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Opi32(op['i32.shr_u'], localIndices, false)
  ),
};

export const i16x8ShrS: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.shr_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Opi32(op['i32.shr_s'], localIndices, true)
  ),
};
