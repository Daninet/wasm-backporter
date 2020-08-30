/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U64_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

function f64x2Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    op['f64.reinterpret_i64'],
    op['local.get'], ...localIndices[1],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.extend_i32_u'],
    op['i64.const'], ...U64_MAX,
    op['i64.mul'],

    op['local.get'], ...localIndices[0],
    op['f64.reinterpret_i64'],
    op['local.get'], ...localIndices[2],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.extend_i32_u'],
    op['i64.const'], ...U64_MAX,
    op['i64.mul'],
  ]);
}

export const f64x2Eq: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.eq',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.eq'], localIndices)
  ),
};

export const f64x2Ne: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.ne',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.ne'], localIndices)
  ),
};

export const f64x2Lt: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.lt',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.lt'], localIndices)
  ),
};

export const f64x2Le: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.le',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.le'], localIndices)
  ),
};

export const f64x2Gt: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.gt',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.gt'], localIndices)
  ),
};

export const f64x2Ge: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.ge',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.ge'], localIndices)
  ),
};
