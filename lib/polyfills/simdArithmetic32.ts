/* eslint-disable indent */
/* eslint-disable dot-notation */
import { MINUS_ONE } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i32x4Op(instructions: number[], localIndices: Uint8Array[]): Uint8Array {
  const buf = [];
  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i32.wrap_i64'],
      ...instructions,
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      ...instructions,
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

    ...buf[0], ...buf[1],
  ]);
}

export const i32x4Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.add',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op([op['i32.add']], localIndices)
  ),
};

export const i32x4Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op([op['i32.sub']], localIndices)
  ),
};

export const i32x4Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op([op['i32.mul']], localIndices)
  ),
};

export const i32x4Neg: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], ...MINUS_ONE,
      op['i64.const'], ...MINUS_ONE,
      ...i32x4Op([op['i32.mul']], localIndices),
    ])
  ),
};

export const i32x4Abs: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i32x4.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], 0x00,
      op['i64.const'], 0x00,
      ...i32x4Op([
        op['drop'],
        op['local.tee'], ...localIndices[4],
        op['i32.const'], 0x1f,
        op['i32.shr_s'],
        op['local.get'], ...localIndices[4],
        op['i32.xor'],
        op['local.get'], ...localIndices[4],
        op['i32.const'], 0x1f,
        op['i32.shr_s'],
        op['i32.sub'],
      ], localIndices),
    ])
  ),
};

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
        op['i32.reinterpret_f32'],
        op['i64.extend_i32_u'],
      ]));
    }
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0], ...buf[1],
    op['i64.const'], 0x20,
    op['i64.shl'],
    op['i64.or'],

    ...buf[2], ...buf[3],
    op['i64.const'], 0x20,
    op['i64.shl'],
    op['i64.or'],
  ]);
}

export const f32x4Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.add',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.add'], localIndices)
  ),
};

export const f32x4Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.sub'], localIndices)
  ),
};

export const f32x4Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.mul'], localIndices)
  ),
};

export const f32x4Div: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.div',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.div'], localIndices)
  ),
};

export const f32x4Min: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.min',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.min'], localIndices)
  ),
};

export const f32x4Max: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.max',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.max'], localIndices)
  ),
};

function f32x4OpSingle(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  const buf = [];

  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['f32.reinterpret_i32'],
      instruction,
      op['i32.reinterpret_f32'],
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['f32.reinterpret_i32'],
      instruction,
      op['i32.reinterpret_f32'],
      op['i64.extend_i32_u'],

      op['i64.const'], 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0], ...buf[1],
  ]);
}

export const f32x4Neg: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4OpSingle(op['f32.neg'], localIndices)
  ),
};

export const f32x4Sqrt: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.sqrt',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4OpSingle(op['f32.sqrt'], localIndices)
  ),
};

export const f32x4Abs: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4OpSingle(op['f32.abs'], localIndices)
  ),
};
