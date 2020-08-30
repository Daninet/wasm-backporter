/* eslint-disable indent */
/* eslint-disable dot-notation */
import {
  MINUS_ONE, S16_MAX, U16_MAX,
} from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';
import { encodeULEB128 } from '../leb128';

const op = reverseOpCodes;

function i16x8Op(instructions: number[], localIndices: Uint8Array[]): Uint8Array {
  const buf = [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 4; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        op['i64.const'], encodeULEB128(j * 0x10),
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        op['local.get'], ...localIndices[i + 2],
        op['i64.const'], encodeULEB128(j * 0x10),
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        ...instructions,
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
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    op['i64.const'], 0,
    ...buf[0], ...buf[1], ...buf[2], ...buf[3],

    op['i64.const'], 0,
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],
  ]);
}

export const i16x8Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.add',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([op['i32.add']], localIndices)
  ),
};

export const i16x8AddSaturateU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.add_saturate_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
      op['i32.add'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...U16_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...U16_MAX,
      op['i32.le_u'],
      op['select'],
    ], localIndices)
  ),
};

export const i16x8AddSaturateS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.add_saturate_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
      op['local.set'], ...localIndices[4],
      op['i32.extend16_s'],
      op['local.get'], ...localIndices[4],
      op['i32.extend16_s'],
      op['i32.add'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...S16_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...S16_MAX,
      op['i32.le_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i16x8Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([op['i32.sub']], localIndices)
  ),
};

export const i16x8SubSaturateU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.sub_saturate_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
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

export const i16x8SubSaturateS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.sub_saturate_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
      op['local.set'], ...localIndices[4],
      op['i32.extend16_s'],
      op['local.get'], ...localIndices[4],
      op['i32.extend16_s'],
      op['i32.sub'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...S16_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...S16_MAX,
      op['i32.le_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i16x8Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([op['i32.mul']], localIndices)
  ),
};

export const i16x8Neg: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], ...MINUS_ONE,
      op['i64.const'], ...MINUS_ONE,
      ...i16x8Op([op['i32.mul']], localIndices),
    ])
  ),
};

export const i16x8Abs: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], 0x00,
      op['i64.const'], 0x00,
      ...i16x8Op([
        op['drop'],
        op['i32.extend16_s'],
        op['local.tee'], ...localIndices[4],
        op['i32.const'], 0x0f,
        op['i32.shr_s'],
        op['local.get'], ...localIndices[4],
        op['i32.xor'],
        op['local.get'], ...localIndices[4],
        op['i32.const'], 0x0f,
        op['i32.shr_s'],
        op['i32.sub'],
      ], localIndices),
    ])
  ),
};

export const i16x8AvgrU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.avgr_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
      op['i32.add'],
      op['i32.const'], 0x01,
      op['i32.add'],
      op['i32.const'], 0x01,
      op['i32.shr_u'],
    ], localIndices)
  ),
};
