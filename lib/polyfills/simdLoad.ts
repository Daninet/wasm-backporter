/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U16_MAX } from '.';
import { reverseOpCodes } from '../opcodes';
import { i16x8Splat, i32x4Splat, i64x2Splat, i8x16Splat } from './simdSplat';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

// TODO support offsets
export const v128Load: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'v128.load',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['local.tee'], ...localIndices[0],
      op['i64.load'], 0x00, 0x00,
      op['local.get'], ...localIndices[0],
      op['i32.const'], 0x08,
      op['i32.add'],
      op['i64.load'], 0x00, 0x00,
    ])
  ),
};

// TODO support offsets
export const v64x2LoadSplat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'v64x2.load_splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.load'], 0x00, 0x00,
      ...i64x2Splat.replacer(instruction, fnIndex, localIndices),
    ])
  ),
};

// TODO support offsets
export const v32x4LoadSplat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'v32x4.load_splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i32.load'], 0x00, 0x00,
      ...i32x4Splat.replacer(instruction, fnIndex, localIndices),
    ])
  ),
};

// TODO support offsets
export const v16x8LoadSplat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'v16x8.load_splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i32.load'], 0x00, 0x00,
      ...i16x8Splat.replacer(instruction, fnIndex, localIndices),
    ])
  ),
};

// TODO support offsets
export const v8x16LoadSplat: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'v8x16.load_splat',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i32.load'], 0x00, 0x00,
      ...i8x16Splat.replacer(instruction, fnIndex, localIndices),
    ])
  ),
};
