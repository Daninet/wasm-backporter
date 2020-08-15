/* eslint-disable indent */
/* eslint-disable dot-notation */
import { U16_MAX } from '.';
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

export const i16x8ExtractLaneU: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'i16x8.extract_lane_u',
  replacer: (instruction, fnIndex, localIndices) => {
    let body: Uint8Array = null;
    switch (instruction.params[0]) {
      case 0:
      case 4:
        body = new Uint8Array([
          op['i32.wrap_i64'],
          op['i64.const'], 0x20,
          op['i32.shl'],
        ]);
        break;
      case 1:
      case 5:
        body = new Uint8Array([
          op['i32.wrap_i64'],
          op['i64.const'], ...U16_MAX,
          op['i64.and'],
        ]);
        break;
      case 2:
      case 6:
        body = new Uint8Array([
          op['i64.const'], 0x20,
          op['i64.shr_u'],
          op['i32.wrap_i64'],
          op['i64.const'], 0x20,
          op['i32.shl'],
        ]);
        break;
      case 3:
      case 7:
        body = new Uint8Array([
          op['i64.const'], 0x20,
          op['i64.shr_u'],
          op['i32.wrap_i64'],
          op['i64.const'], ...U16_MAX,
          op['i64.and'],
        ]);
        break;
    }

    if (instruction.params[0] < 4) {
      return new Uint8Array([
        op['drop'],
        ...body,
      ]);
    }

    return new Uint8Array([
      op['local.set'], ...localIndices[0],
      op['drop'],
      op['local.get'], ...localIndices[0],
      ...body,
    ]);
  },
};
