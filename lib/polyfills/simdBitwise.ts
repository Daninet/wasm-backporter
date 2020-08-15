/* eslint-disable indent */
/* eslint-disable dot-notation */
import { encodeULEB128 } from '../leb128';
import { U16_MAX, U64_MAX } from '.';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function v128NotOpcodes(localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['local.set'], ...localIndices[0],
    op['i64.const'], U64_MAX,
    op['i64.xor'],
    op['local.get'], ...localIndices[0],
    op['i64.const'], U64_MAX,
    op['i64.xor'],
  ]);
}

export const v128Not: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'v128.not',
  replacer: (instruction, fnIndex, localIndices) => (
    v128NotOpcodes(localIndices)
  ),
};

function v128Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['local.set'], ...localIndices[0],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[2],
    op['local.get'], ...localIndices[1],
    instruction,
    op['local.get'], ...localIndices[0],
    op['local.get'], ...localIndices[2],
    instruction,
  ]);
}

export const v128And: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'v128.and',
  replacer: (instruction, fnIndex, localIndices) => (
    v128Op(op['i64.and'], localIndices)
  ),
};

export const v128AndNot: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'v128.andnot',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      ...v128NotOpcodes(localIndices),
      ...v128Op(op['i64.and'], localIndices),
    ])
  ),
};

export const v128Or: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'v128.or',
  replacer: (instruction, fnIndex, localIndices) => (
    v128Op(op['i64.or'], localIndices)
  ),
};

export const v128Xor: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'v128.xor',
  replacer: (instruction, fnIndex, localIndices) => (
    v128Op(op['i64.xor'], localIndices)
  ),
};

function i64x2Opi32(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['i64.extend_i32_u'],
    op['local.set'], ...localIndices[0],
    op['local.set'], ...localIndices[1],
    op['local.get'], ...localIndices[0],
    instruction,
    op['local.get'], ...localIndices[1],
    op['local.get'], ...localIndices[0],
    instruction,
  ]);
}

export const i64x2Shl: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.shl',
  replacer: (instruction, fnIndex, localIndices) => (
    i64x2Opi32(op['i64.shl'], localIndices)
  ),
};

export const i64x2ShrU: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.shr_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i64x2Opi32(op['i64.shr_u'], localIndices)
  ),
};

export const i64x2ShrS: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.shr_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i64x2Opi32(op['i64.shr_s'], localIndices)
  ),
};

function i32x4Opi32(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  const buf = [];
  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[2],
      instruction,
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[2],
      instruction,
      op['i64.extend_i32_u'],
      op['i64.const'], 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0],
    ...buf[1],
  ]);
}

export const i32x4Shl: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i32x4.shl',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Opi32(op['i32.shl'], localIndices)
  ),
};

export const i32x4ShrU: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i32x4.shr_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Opi32(op['i32.shr_u'], localIndices)
  ),
};

export const i32x4ShrS: IPolyfill = {
  locals: ['i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i32x4.shr_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Opi32(op['i32.shr_s'], localIndices)
  ),
};

function i16x8Opi32(instruction: number, localIndices: Uint8Array[], signed: boolean): Uint8Array {
  const buf = [];
  const signExtension = signed ? [op['i32.extend16_s']] : [];

  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['i64.const'], 0,
    ]));
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

    ...buf[0], ...buf[1], ...buf[2], ...buf[3],
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],
    ...buf[8], ...buf[9],
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
