/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';
import { U16_MAX, U8_MAX } from './util';

const op = reverseOpCodes;

function anyTrue(localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['i64.const'], 0x00,
    op['i64.ne'],

    op['local.set'], ...localIndices[0],

    op['i64.const'], 0x00,
    op['i64.ne'],

    op['local.get'], ...localIndices[0],
    op['i32.or'],
  ]);
}

export const i32x4AnyTrue: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i32x4.any_true',
  replacer: (instruction, fnIndex, localIndices) => anyTrue(localIndices),
};

export const i16x8AnyTrue: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i16x8.any_true',
  replacer: (instruction, fnIndex, localIndices) => anyTrue(localIndices),
};

export const i8x16AnyTrue: IPolyfill = {
  locals: ['i32'],
  match: (instruction) => instruction.name === 'i8x16.any_true',
  replacer: (instruction, fnIndex, localIndices) => anyTrue(localIndices),
};

export const i32x4AllTrue: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.all_true',
  replacer: (instruction, fnIndex, localIndices) => {
    const buf = [];

    for (let i = 0; i < 4; i++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[Math.floor(i / 2)],
        ...(i % 2 === 1 ? [
          op['i64.const'], 0x20,
          op['i64.shr_u'],
        ] : []),
        op['i32.wrap_i64'],
        op['i32.const'], 0x00,
        op['i32.ne'],
        op['i32.and'],
      ]));
    }

    return new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['local.set'], ...localIndices[1],
      op['i32.const'], 0x01,

      ...buf[0], ...buf[1], ...buf[2], ...buf[3],
    ]);
  },
};

export const i16x8AllTrue: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.all_true',
  replacer: (instruction, fnIndex, localIndices) => {
    const buf = [];

    for (let i = 0; i < 8; i++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[Math.floor(i / 4)],
        ...(i % 4 > 0 ? [
          op['i64.const'], 0x10 * (i % 4),
          op['i64.shr_u'],
        ] : []),
        op['i32.wrap_i64'],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        op['i32.const'], 0x00,
        op['i32.ne'],
        op['i32.and'],
      ]));
    }

    return new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['local.set'], ...localIndices[1],
      op['i32.const'], 0x01,

      ...buf[0], ...buf[1], ...buf[2], ...buf[3],
      ...buf[4], ...buf[5], ...buf[6], ...buf[7],
    ]);
  },
};

export const i8x16AllTrue: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.all_true',
  replacer: (instruction, fnIndex, localIndices) => {
    const buf = [];

    for (let i = 0; i < 16; i++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[Math.floor(i / 8)],
        ...(i % 8 > 0 ? [
          op['i64.const'], 0x08 * (i % 8),
          op['i64.shr_u'],
        ] : []),
        op['i32.wrap_i64'],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        op['i32.const'], 0x00,
        op['i32.ne'],
        op['i32.and'],
      ]));
    }

    return new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['local.set'], ...localIndices[1],
      op['i32.const'], 0x01,

      ...buf[0], ...buf[1], ...buf[2], ...buf[3],
      ...buf[4], ...buf[5], ...buf[6], ...buf[7],
      ...buf[8], ...buf[9], ...buf[10], ...buf[11],
      ...buf[12], ...buf[13], ...buf[14], ...buf[15],
    ]);
  },
};
