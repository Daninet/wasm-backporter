/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

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
