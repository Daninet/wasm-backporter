/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U16_MAX, U8_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i64x2Splat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i64x2.splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['local.tee'], ...localIndices[0],
      op['local.get'], ...localIndices[0],
    ])
  ),
};

export const i32x4Splat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i32x4.splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.extend_i32_u'],
      op['local.tee'], ...localIndices[0],
      op['i64.const'], 0x20,
      op['i64.shl'],
      op['local.get'], ...localIndices[0],
      op['i64.or'],
      op['local.tee'], ...localIndices[0],
      op['local.get'], ...localIndices[0],
    ])
  ),
};

export const i16x8Splat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i16x8.splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i32.const'], ...U16_MAX,
      op['i32.and'],
      op['i64.extend_i32_u'],
      op['local.tee'], ...localIndices[0],
      op['i64.const'], 0x20,
      op['i64.shl'],
      op['local.get'], ...localIndices[0],
      op['i64.or'],
      op['local.tee'], ...localIndices[0],
      op['i64.const'], 0x10,
      op['i64.shl'],
      op['local.get'], ...localIndices[0],
      op['i64.or'],
      op['local.tee'], ...localIndices[0],
      op['local.get'], ...localIndices[0],
    ])
  ),
};

export const i8x16Splat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i8x16.splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i32.const'], ...U8_MAX,
      op['i32.and'],
      op['i64.extend_i32_u'],
      op['local.tee'], ...localIndices[0],
      op['i64.const'], 0x8,
      op['i64.shl'],
      op['local.get'], ...localIndices[0],
      op['i64.or'],
      op['local.tee'], ...localIndices[0],
      op['i64.const'], 0x20,
      op['i64.shl'],
      op['local.get'], ...localIndices[0],
      op['i64.or'],
      op['local.tee'], ...localIndices[0],
      op['i64.const'], 0x10,
      op['i64.shl'],
      op['local.get'], ...localIndices[0],
      op['i64.or'],
      op['local.tee'], ...localIndices[0],
      op['local.get'], ...localIndices[0],
    ])
  ),
};
