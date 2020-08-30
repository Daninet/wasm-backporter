/* eslint-disable indent */
/* eslint-disable dot-notation */
import {
  MINUS_ONE, S8_MAX, U8_MAX,
} from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';
import { encodeULEB128 } from '../leb128';

const op = reverseOpCodes;

function i8x16Op(instructions: number[], localIndices: Uint8Array[]): Uint8Array {
  const buf = [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 8; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        op['i64.const'], encodeULEB128(j * 0x08),
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        op['local.get'], ...localIndices[i + 2],
        op['i64.const'], encodeULEB128(j * 0x08),
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        ...instructions,
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        op['i64.extend_i32_u'],
        op['i64.const'], encodeULEB128(j * 0x08),
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

    op['i64.const'], 0,
    ...buf[0], ...buf[1], ...buf[2], ...buf[3],
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],

    op['i64.const'], 0,
    ...buf[8], ...buf[9], ...buf[10], ...buf[11],
    ...buf[12], ...buf[13], ...buf[14], ...buf[15],
  ]);
}

export const i8x16Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.add',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([op['i32.add']], localIndices)
  ),
};

export const i8x16AddSaturateU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.add_saturate_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['i32.add'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...U8_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...U8_MAX,
      op['i32.le_u'],
      op['select'],
    ], localIndices)
  ),
};

export const i8x16AddSaturateS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.add_saturate_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['local.set'], ...localIndices[4],
      op['i32.extend8_s'],
      op['local.get'], ...localIndices[4],
      op['i32.extend8_s'],
      op['i32.add'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...S8_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...S8_MAX,
      op['i32.le_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i8x16Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([op['i32.sub']], localIndices)
  ),
};

export const i8x16SubSaturateU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.sub_saturate_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['i32.sub'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], 0x00,
      op['local.get'], ...localIndices[4],
      op['i32.const'], 0x00,
      op['i32.ge_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i8x16SubSaturateS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.sub_saturate_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['local.set'], ...localIndices[4],
      op['i32.extend8_s'],
      op['local.get'], ...localIndices[4],
      op['i32.extend8_s'],
      op['i32.sub'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...S8_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...S8_MAX,
      op['i32.le_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i8x16AvgrU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.avgr_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['i32.add'],
      op['i32.const'], 0x01,
      op['i32.add'],
      op['i32.const'], 0x01,
      op['i32.shr_u'],
    ], localIndices)
  ),
};

export const i8x16Neg: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], ...MINUS_ONE,
      op['i64.const'], ...MINUS_ONE,
      ...i8x16Op([op['i32.mul']], localIndices),
    ])
  ),
};

export const i8x16Abs: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], 0x00,
      op['i64.const'], 0x00,
      ...i8x16Op([
        op['drop'],
        op['i32.extend8_s'],
        op['local.tee'], ...localIndices[4],
        op['i32.const'], 0x07,
        op['i32.shr_s'],
        op['local.get'], ...localIndices[4],
        op['i32.xor'],
        op['local.get'], ...localIndices[4],
        op['i32.const'], 0x07,
        op['i32.shr_s'],
        op['i32.sub'],
      ], localIndices),
    ])
  ),
};
