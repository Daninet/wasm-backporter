/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U16_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import { i32x4Splat } from './simdSplat';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

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
