/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U32_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function f32x4Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  const buf = [];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        ...(j === 1 ? [
          op['i64.const'], 0x20,
          op['i64.shr_u'],
        ] : []),
        op['i32.wrap_i64'],
        op['f32.reinterpret_i32'],

        op['local.get'], ...localIndices[i + 2],
        ...(j === 1 ? [
          op['i64.const'], 0x20,
          op['i64.shr_u'],
        ] : []),
        op['i32.wrap_i64'],
        op['f32.reinterpret_i32'],

        instruction,
        op['i32.const'], ...U32_MAX,
        op['i32.mul'],
        op['i64.extend_i32_u'],

        ...(j === 1 ? [
          op['i64.const'], 0x20,
          op['i64.shl'],
          op['i64.or'],
        ] : []),
      ]));
    }
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0], ...buf[1],
    ...buf[2], ...buf[3],
  ]);
}

export const f32x4Eq: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.eq',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.eq'], localIndices)
  ),
};

export const f32x4Ne: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.ne',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.ne'], localIndices)
  ),
};

export const f32x4Lt: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.lt',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.lt'], localIndices)
  ),
};

export const f32x4Le: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.le',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.le'], localIndices)
  ),
};

export const f32x4Gt: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.gt',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.gt'], localIndices)
  ),
};

export const f32x4Ge: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.ge',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.ge'], localIndices)
  ),
};

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
