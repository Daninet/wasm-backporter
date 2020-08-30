/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U16_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i16x8Op(instruction: number, localIndices: Uint8Array[], signed: boolean): Uint8Array {
  const buf = [];
  const signExtension = signed ? [op['i32.extend16_s']] : [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 4; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        op['i64.const'], j * 0x10,
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['local.tee'], ...localIndices[4],

        op['local.get'], ...localIndices[i + 2],
        op['i64.const'], j * 0x10,
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['local.tee'], ...localIndices[5],

        op['local.get'], ...localIndices[4],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        ...signExtension,

        op['local.get'], ...localIndices[5],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        ...signExtension,

        instruction,
        op['select'],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        op['i64.extend_i32_u'],
        op['i64.const'], j * 0x10,
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

    op['i64.const'], 0x00,
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],
  ]);
}

export const i16x8MinS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.min_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.lt_s'], localIndices, true)
  ),
};

export const i16x8MinU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.min_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.lt_u'], localIndices, false)
  ),
};

export const i16x8MaxS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.max_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.gt_s'], localIndices, true)
  ),
};

export const i16x8MaxU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.max_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.gt_u'], localIndices, false)
  ),
};
