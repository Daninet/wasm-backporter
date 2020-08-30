/* eslint-disable indent */
/* eslint-disable dot-notation */
import { encodeULEB128 } from '../leb128';
import { U8_MAX } from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';

const op = reverseOpCodes;

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
