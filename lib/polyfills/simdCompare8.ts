/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U8_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i8x16Op(instruction: number, localIndices: Uint8Array[], signed: boolean): Uint8Array {
  const buf: Uint8Array[] = [];
  const signExtension = signed ? [op['i32.extend8_s']] : [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 8; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        ...(j > 0 ? [
          op['i64.const'], j * 8,
          op['i64.shr_u'],
        ] : []),
        op['i32.wrap_i64'],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        ...signExtension,
        op['local.get'], ...localIndices[i + 2],
        ...(j > 0 ? [
          op['i64.const'], j * 8,
          op['i64.shr_u'],
        ] : []),
        op['i32.wrap_i64'],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        ...signExtension,
        instruction,
        op['i32.const'], ...U8_MAX,
        op['i32.mul'],
        op['i64.extend_i32_u'],
        op['i64.const'], j * 8,
        op['i64.shl'],

        ...(j > 0 ? [op['i64.or']] : []),
      ]));
    }
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0], ...buf[1], ...buf[2], ...buf[3],
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],
    ...buf[8], ...buf[9], ...buf[10], ...buf[11],
    ...buf[12], ...buf[13], ...buf[14], ...buf[15],
  ]);
}

export const i8x16Eq: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.eq',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.eq'], localIndices, false)
  ),
};

export const i8x16Ne: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.ne',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.ne'], localIndices, false)
  ),
};

export const i8x16LtS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.lt_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.lt_s'], localIndices, true)
  ),
};

export const i8x16LtU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.lt_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.lt_u'], localIndices, false)
  ),
};

export const i8x16LeS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.le_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.le_s'], localIndices, true)
  ),
};

export const i8x16LeU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.le_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.le_u'], localIndices, false)
  ),
};

export const i8x16GtU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.gt_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.gt_u'], localIndices, false)
  ),
};

export const i8x16GtS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.gt_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.gt_s'], localIndices, true)
  ),
};

export const i8x16GeU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.ge_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.ge_u'], localIndices, false)
  ),
};

export const i8x16GeS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.ge_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op(op['i32.ge_s'], localIndices, true)
  ),
};
