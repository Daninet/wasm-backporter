/* eslint-disable indent */
/* eslint-disable dot-notation */
import { EXCLUDE32_1, U16_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i32x4Wideni16x8(localIndices: Uint8Array[], signed: boolean, high: boolean) {
  const extend = signed ? [
    op['i64.extend16_s'],
    op['i64.const'], ...EXCLUDE32_1,
    op['i64.and'],
  ] : [];

  const buf = [];

  for (let i = 0; i < 4; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[0],
      op['i64.const'], i * 0x10,
      op['i64.shr_u'],
      op['i64.const'], ...U16_MAX,
      op['i64.and'],
      ...extend,
      op['i64.const'], i * 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  if (high) {
    return new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['drop'],

      op['i64.const'], 0x00,
      ...buf[0], ...buf[1],

      op['i64.const'], 0x00,
      ...buf[2], ...buf[3],
    ]);
  }

  return new Uint8Array([
    op['drop'],
    op['local.set'], ...localIndices[0],

    op['i64.const'], 0x00,
    ...buf[0], ...buf[1],

    op['i64.const'], 0x00,
    ...buf[2], ...buf[3],
  ]);
}

export const i32x4WidenHighi16x8U: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i32x4.widen_high_i16x8_u',
  replacer: (instruction, fnIndex, localIndices) => i32x4Wideni16x8(localIndices, false, true),
};

export const i32x4WidenHighi16x8S: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i32x4.widen_high_i16x8_s',
  replacer: (instruction, fnIndex, localIndices) => i32x4Wideni16x8(localIndices, true, true),
};

export const i32x4WidenLowi16x8U: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i32x4.widen_low_i16x8_u',
  replacer: (instruction, fnIndex, localIndices) => i32x4Wideni16x8(localIndices, false, false),
};

export const i32x4WidenLowi16x8S: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i32x4.widen_low_i16x8_s',
  replacer: (instruction, fnIndex, localIndices) => i32x4Wideni16x8(localIndices, true, false),
};
