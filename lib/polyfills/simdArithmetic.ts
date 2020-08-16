/* eslint-disable indent */
/* eslint-disable dot-notation */
import { MINUS_ONE } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function i64x2Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],
    op['local.get'], ...localIndices[1],
    instruction,
    op['local.get'], ...localIndices[0],
    op['local.get'], ...localIndices[2],
    instruction,
  ]);
}

export const i64x2Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.add',
  replacer: (instruction, fnIndex, localIndices) => (
    i64x2Op(op['i64.add'], localIndices)
  ),
};

export const i64x2Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    i64x2Op(op['i64.sub'], localIndices)
  ),
};

export const i64x2Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    i64x2Op(op['i64.mul'], localIndices)
  ),
};

export const i64x2Neg: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], ...MINUS_ONE,
      op['i64.const'], ...MINUS_ONE,
      ...i64x2Op(op['i64.mul'], localIndices),
    ])
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
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i32.wrap_i64'],
      instruction,
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
    i32x4Op(op['i32.add'], localIndices)
  ),
};

export const i32x4Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.sub'], localIndices)
  ),
};

export const i32x4Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op(op['i32.mul'], localIndices)
  ),
};

// export const i32x4Neg: IPolyfill = {
//   locals: ['i64', 'i64', 'i64', 'i64'],
//   match: (instruction) => instruction.name === 'i32x4.neg',
//   replacer: (instruction, fnIndex, localIndices) => (
//     new Uint8Array([
//       op['i64.const'], ...MINUS_ONE,
//       op['i64.const'], ...MINUS_ONE,
//       ...i32x4Op(op['i32.mul'], localIndices),
//     ])
//   ),
// };
