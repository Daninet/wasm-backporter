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

function f64x2Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],
    op['f64.reinterpret_i64'],
    op['local.get'], ...localIndices[1],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.reinterpret_f64'],
    op['local.get'], ...localIndices[0],
    op['f64.reinterpret_i64'],
    op['local.get'], ...localIndices[2],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.reinterpret_f64'],
  ]);
}

export const f64x2Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.add',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.add'], localIndices)
  ),
};

export const f64x2Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.sub'], localIndices)
  ),
};

export const f64x2Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.mul'], localIndices)
  ),
};

export const f64x2Div: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.div',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.div'], localIndices)
  ),
};

export const f64x2Min: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.min',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.min'], localIndices)
  ),
};

export const f64x2Max: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.max',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.max'], localIndices)
  ),
};

function f64x2OpSingle(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['local.set'], ...localIndices[0],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.reinterpret_f64'],
    op['local.get'], ...localIndices[0],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.reinterpret_f64'],
  ]);
}

export const f64x2Neg: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'f64x2.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2OpSingle(op['f64.neg'], localIndices)
  ),
};

export const f64x2Sqrt: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'f64x2.sqrt',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2OpSingle(op['f64.sqrt'], localIndices)
  ),
};

export const f64x2Abs: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'f64x2.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2OpSingle(op['f64.abs'], localIndices)
  ),
};
