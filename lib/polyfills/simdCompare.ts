/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U16_MAX, U32_MAX, U8_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i32x4Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  const buf = [];
  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i32.wrap_i64'],
      instruction,
      op['i32.const'], ...U32_MAX,
      op['i32.mul'],
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      instruction,
      op['i32.const'], ...U32_MAX,
      op['i32.mul'],
      op['i64.extend_i32_u'],
      op['i64.const'], 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0],
    ...buf[1],
  ]);
}

export const i32x4Eq: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.eq',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.eq'], localIndices)
  ),
};

export const i32x4Ne: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.ne',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.ne'], localIndices)
  ),
};

export const i32x4LtS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.lt_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.lt_s'], localIndices)
  ),
};

export const i32x4LtU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.lt_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.lt_u'], localIndices)
  ),
};

export const i32x4LeS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.le_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.le_s'], localIndices)
  ),
};

export const i32x4LeU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.le_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.le_u'], localIndices)
  ),
};

export const i32x4GtU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.gt_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.gt_u'], localIndices)
  ),
};

export const i32x4GtS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.gt_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.gt_s'], localIndices)
  ),
};

export const i32x4GeU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.ge_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.ge_u'], localIndices)
  ),
};

export const i32x4GeS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.ge_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.ge_s'], localIndices)
  ),
};

function i16x8Op(instruction: number, localIndices: Uint8Array[], signed: boolean): Uint8Array {
  const buf = [];
  const signExtension = signed ? [op['i32.extend16_s']] : [];

  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      // lane 1, 5
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['i32.const'], ...U16_MAX,
      op['i32.and'],
      ...signExtension,
      op['local.get'], ...localIndices[i + 2],
      op['i32.wrap_i64'],
      op['i32.const'], ...U16_MAX,
      op['i32.and'],
      ...signExtension,
      instruction,
      op['i32.const'], ...U16_MAX,
      op['i32.mul'],

      // lane 2, 6
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['i32.const'], 0x10,
      op['i32.shr_u'],
      ...signExtension,
      op['local.get'], ...localIndices[i + 2],
      op['i32.wrap_i64'],
      op['i32.const'], 0x10,
      op['i32.shr_u'],
      ...signExtension,
      instruction,
      op['i32.const'], 0x10,
      op['i32.shl'],
      op['i32.const'], ...U16_MAX,
      op['i32.mul'],

      op['i32.or'],
      op['i64.extend_i32_u'],

      // lane 3, 7
      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['i32.const'], ...U16_MAX,
      op['i32.and'],
      ...signExtension,
      op['local.get'], ...localIndices[i + 2],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['i32.const'], ...U16_MAX,
      op['i32.and'],
      ...signExtension,
      instruction,
      op['i32.const'], ...U16_MAX,
      op['i32.mul'],

      // lane 4, 8
      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x30,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      ...signExtension,
      op['local.get'], ...localIndices[i + 2],
      op['i64.const'], 0x30,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      ...signExtension,
      instruction,
      op['i32.const'], 0x10,
      op['i32.shl'],
      op['i32.const'], ...U16_MAX,
      op['i32.mul'],

      op['i32.or'],
      op['i64.extend_i32_u'],

      op['i64.const'], 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0],
    ...buf[1],
  ]);
}

export const i16x8Eq: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.eq',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.eq'], localIndices, false)
  ),
};

export const i16x8Ne: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.ne',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.ne'], localIndices, false)
  ),
};

export const i16x8LtS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.lt_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.lt_s'], localIndices, true)
  ),
};

export const i16x8LtU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.lt_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.lt_u'], localIndices, false)
  ),
};

export const i16x8LeS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.le_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.le_s'], localIndices, true)
  ),
};

export const i16x8LeU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.le_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.le_u'], localIndices, false)
  ),
};

export const i16x8GtU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.gt_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.gt_u'], localIndices, false)
  ),
};

export const i16x8GtS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.gt_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.gt_s'], localIndices, true)
  ),
};

export const i16x8GeU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.ge_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.ge_u'], localIndices, false)
  ),
};

export const i16x8GeS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.ge_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op(op['i32.ge_s'], localIndices, true)
  ),
};

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
