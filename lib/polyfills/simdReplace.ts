/* eslint-disable indent */
/* eslint-disable dot-notation */
import {
  EXCLUDE16, EXCLUDE32, EXCLUDE8, U16_MAX, U32_MAX, U8_MAX,
} from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i64x2ReplaceLane: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.replace_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    if (instruction.params[0] === 0) {
      return new Uint8Array([
        op['local.set'], ...localIndices[0],
        op['local.set'], ...localIndices[1],
        op['drop'],
        op['local.get'], ...localIndices[0],
        op['local.get'], ...localIndices[1],
      ]);
    }

    return new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['drop'],
      op['local.get'], ...localIndices[0],
    ]);
  },
};

export const i32x4ReplaceLane: IPolyfill = {
  locals: ['i32', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.replace_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    const lane = instruction.params[0];
    return new Uint8Array([
      op['local.set'], ...localIndices[0],

      ...(lane < 2 ? [
        op['local.set'], ...localIndices[1],
      ] : []),

      op['i64.const'], ...EXCLUDE32[lane % 2],
      op['i64.and'],
      op['local.get'], ...localIndices[0],
      op['i32.const'], ...U32_MAX,
      op['i32.and'],
      op['i64.extend_i32_u'],

      ...(lane % 2 !== 0 ? [
        op['i64.const'], 0x20,
        op['i64.shl'],
      ] : []),

      op['i64.or'],

      ...(lane < 2 ? [
        op['local.get'], ...localIndices[1],
      ] : []),
    ]);
  },
};

export const i16x8ReplaceLane: IPolyfill = {
  locals: ['i32', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.replace_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    const lane = instruction.params[0];
    return new Uint8Array([
      op['local.set'], ...localIndices[0],

      ...(lane < 4 ? [
        op['local.set'], ...localIndices[1],
      ] : []),

      op['i64.const'], ...EXCLUDE16[lane % 4],
      op['i64.and'],
      op['local.get'], ...localIndices[0],
      op['i32.const'], ...U16_MAX,
      op['i32.and'],
      op['i64.extend_i32_u'],

      ...(lane % 4 !== 0 ? [
        op['i64.const'], ((lane % 4) * 0x10),
        op['i64.shl'],
      ] : []),

      op['i64.or'],

      ...(lane < 4 ? [
        op['local.get'], ...localIndices[1],
      ] : []),
    ]);
  },
};

export const i8x16ReplaceLane: IPolyfill = {
  locals: ['i32', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.replace_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    const lane = instruction.params[0];
    return new Uint8Array([
      op['local.set'], ...localIndices[0],

      ...(lane < 8 ? [
        op['local.set'], ...localIndices[1],
      ] : []),

      op['i64.const'], ...EXCLUDE8[lane % 8],
      op['i64.and'],
      op['local.get'], ...localIndices[0],
      op['i32.const'], ...U8_MAX,
      op['i32.and'],
      op['i64.extend_i32_u'],

      ...(lane % 8 !== 0 ? [
        op['i64.const'], ((lane % 8) * 0x08),
        op['i64.shl'],
      ] : []),

      op['i64.or'],

      ...(lane < 8 ? [
        op['local.get'], ...localIndices[1],
      ] : []),
    ]);
  },
};
