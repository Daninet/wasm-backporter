/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U8_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i8x16Op(instruction: number, localIndices: Uint8Array[], signed: boolean): Uint8Array {
  const buf = [];
  const signExtension = signed ? [op['i32.extend8_s']] : [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 8; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        op['i64.const'], j * 0x08,
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['local.tee'], ...localIndices[4],

        op['local.get'], ...localIndices[i + 2],
        op['i64.const'], j * 0x08,
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['local.tee'], ...localIndices[5],

        op['local.get'], ...localIndices[4],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        ...signExtension,

        op['local.get'], ...localIndices[5],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        ...signExtension,

        instruction,
        op['select'],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        op['i64.extend_i32_u'],
        op['i64.const'], j * 0x08,
        op['i64.shl'],
        op['i64.or'],
      ]));
    }
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    op['i64.const'], 0x00,
    ...buf[0], ...buf[1], ...buf[2], ...buf[3],
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],

    op['i64.const'], 0x00,
    ...buf[8], ...buf[9], ...buf[10], ...buf[11],
    ...buf[12], ...buf[13], ...buf[14], ...buf[15],
  ]);
}

export const i8x16MinS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.min_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.lt_s'], localIndices, true)
  ),
};

export const i8x16MinU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.min_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.lt_u'], localIndices, false)
  ),
};

export const i8x16MaxS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.max_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.gt_s'], localIndices, true)
  ),
};

export const i8x16MaxU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.max_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.gt_u'], localIndices, false)
  ),
};
