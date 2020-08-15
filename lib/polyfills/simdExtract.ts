/* eslint-disable indent */
/* eslint-disable dot-notation */
import { encodeULEB128 } from '../leb128';
import { U16_MAX, U8_MAX } from '.';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

export const i64x2ExtractLane: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i64x2.extract_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    if (instruction.params[0] === 0) {
      return new Uint8Array([
        op['drop'],
      ]);
    }

    return new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['drop'],
      op['local.get'], ...localIndices[0],
    ]);
  },
};

export const i32x4ExtractLane: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i32x4.extract_lane',
  replacer: (instruction, fnIndex, localIndices) => {
    switch (instruction.params[0]) {
      case 0:
        return new Uint8Array([
          op['drop'],
          op['i32.wrap_i64'],
        ]);
      case 1:
        return new Uint8Array([
          op['drop'],
          op['i64.const'], 0x20,
          op['i64.shr_u'],
          op['i32.wrap_i64'],
        ]);
      case 2:
        return new Uint8Array([
          op['local.set'], ...localIndices[0],
          op['drop'],
          op['local.get'], ...localIndices[0],
          op['i32.wrap_i64'],
        ]);
      default:
        return new Uint8Array([
          op['local.set'], ...localIndices[0],
          op['drop'],
          op['local.get'], ...localIndices[0],
          op['i64.const'], 0x20,
          op['i64.shr_u'],
          op['i32.wrap_i64'],
        ]);
    }
  },
};

function i16x8ExtractLane(lane: number, localIndices: Uint8Array[], signed: boolean) {
  let body: Uint8Array = null;
  const signExtension = signed ? [op['i32.extend16_s']] : [];

  switch (lane) {
    case 0:
    case 4:
      body = new Uint8Array([
        op['i32.wrap_i64'],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
      ]);
      break;
    case 1:
    case 5:
      body = new Uint8Array([
        op['i32.wrap_i64'],
        op['i32.const'], 0x10,
        op['i32.shr_u'],
      ]);
      break;
    case 2:
    case 6:
      body = new Uint8Array([
        op['i64.const'], 0x20,
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
      ]);
      break;
    case 3:
    case 7:
      body = new Uint8Array([
        op['i64.const'], 0x30,
        op['i64.shr_u'],
        op['i32.wrap_i64'],
      ]);
      break;
  }

  if (lane < 4) {
    return new Uint8Array([
      op['drop'],
      ...body,
      ...signExtension,
    ]);
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[0],
    op['drop'],
    op['local.get'], ...localIndices[0],
    ...body,
    ...signExtension,
  ]);
}

export const i16x8ExtractLaneU: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i16x8.extract_lane_u',
  replacer: (
    instruction, fnIndex, localIndices,
  ) => i16x8ExtractLane(instruction.params[0], localIndices, false),
};

export const i16x8ExtractLaneS: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i16x8.extract_lane_s',
  replacer: (
    instruction, fnIndex, localIndices,
  ) => i16x8ExtractLane(instruction.params[0], localIndices, true),
};

function i8x16ExtractLane(lane: number, localIndices: Uint8Array[], signed: boolean) {
  const signExtension = signed ? [op['i32.extend8_s']] : [];

  const body = new Uint8Array([
    op['i64.const'], ...encodeULEB128(lane * 8),
    op['i64.shr_u'],
    op['i32.wrap_i64'],
    op['i32.const'], ...U8_MAX,
    op['i32.and'],
  ]);

  if (lane < 8) {
    return new Uint8Array([
      op['drop'],
      ...body,
      ...signExtension,
    ]);
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[0],
    op['drop'],
    op['local.get'], ...localIndices[0],
    ...body,
    ...signExtension,
  ]);
}

export const i8x16ExtractLaneU: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i8x16.extract_lane_u',
  replacer: (
    instruction, fnIndex, localIndices,
  ) => i8x16ExtractLane(instruction.params[0], localIndices, false),
};

export const i8x16ExtractLaneS: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i8x16.extract_lane_s',
  replacer: (
    instruction, fnIndex, localIndices,
  ) => i8x16ExtractLane(instruction.params[0], localIndices, true),
};
