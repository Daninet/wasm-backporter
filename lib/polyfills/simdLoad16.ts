/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U8_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import { i16x8Splat } from './simdSplat';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

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
