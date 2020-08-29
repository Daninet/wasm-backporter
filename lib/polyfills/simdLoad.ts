/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U16_MAX, U8_MAX } from './util';
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

export const v128Const: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'v128.const',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      // TODO
    ])
  ),
};

function i64x2Load32x2(localIndices: Uint8Array[], signed: boolean) {
  const extend = signed ? op['i64.extend_i32_s'] : op['i64.extend_i32_u'];

  return new Uint8Array([
    op['local.tee'], ...localIndices[0],
    op['i32.load'], 0x00, 0x00,
    extend,
    op['local.get'], ...localIndices[0],
    op['i32.const'], 0x04,
    op['i32.add'],
    op['i32.load'], 0x00, 0x00,
    extend,
  ]);
}

export const i64x2Load32x2U: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i64x2.load32x2_u',
  replacer: (instruction, fnIndex, localIndices) => i64x2Load32x2(localIndices, false),
};

export const i64x2Load32x2S: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i64x2.load32x2_s',
  replacer: (instruction, fnIndex, localIndices) => i64x2Load32x2(localIndices, true),
};

function i32x4Load16x4(localIndices: Uint8Array[], signed: boolean) {
  const extend = signed ? [
    op['i64.extend_i32_u'],
    op['i64.extend16_s'],
  ] : [
    op['i64.extend_i32_u'],
  ];

  const buf = [];

  for (let i = 0; i < 4; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[0],
      op['i32.const'], i * 2,
      op['i32.add'],
      op['i32.load'], 0x00, 0x00,
      op['i32.const'], ...U16_MAX,
      op['i32.and'],
      ...extend,
    ]));
  }

  return new Uint8Array([
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

export const i32x4Load16x4U: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i32x4.load16x4_u',
  replacer: (instruction, fnIndex, localIndices) => i32x4Load16x4(localIndices, false),
};

export const i32x4Load16x4S: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i32x4.load16x4_s',
  replacer: (instruction, fnIndex, localIndices) => i32x4Load16x4(localIndices, true),
};

function i16x8Load8x8(localIndices: Uint8Array[], signed: boolean) {
  const extend = signed ? [
    op['i64.extend_i32_u'],
    op['i64.extend8_s'],
  ] : [
    op['i64.extend_i32_u'],
  ];

  const buf = [];

  for (let i = 0; i < 8; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[0],
      op['i32.const'], i,
      op['i32.add'],
      op['i32.load'], 0x00, 0x00,
      op['i32.const'], ...U8_MAX,
      op['i32.and'],
      ...extend,
      op['i64.const'], (i % 4) * 0x10,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[0],

    op['i64.const'], 0x00,
    ...buf[0], ...buf[1],
    ...buf[2], ...buf[3],

    op['i64.const'], 0x00,
    ...buf[4], ...buf[5],
    ...buf[6], ...buf[7],
  ]);
}

export const i16x8Load8x8U: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i16x8.load8x8_u',
  replacer: (instruction, fnIndex, localIndices) => i16x8Load8x8(localIndices, false),
};

export const i16x8Load8x8S: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i16x8.load8x8_s',
  replacer: (instruction, fnIndex, localIndices) => i16x8Load8x8(localIndices, true),
};
