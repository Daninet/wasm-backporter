import {
  i64x2Add, i64x2Mul, i64x2Neg, i64x2Sub,
  i32x4Add, i32x4Mul, i32x4Sub,
} from './simdArithmetic';

import {
  i8x16Shl, i8x16ShrS, i8x16ShrU,
  i16x8Shl, i16x8ShrS, i16x8ShrU,
  i32x4Shl, i32x4ShrS, i32x4ShrU,
  i64x2Shl, i64x2ShrS, i64x2ShrU,
  v128And, v128AndNot, v128Not, v128Or, v128Xor,
} from './simdBitwise';

import {
  i32x4Eq, i32x4GeS, i32x4GeU, i32x4GtS,
  i32x4GtU, i32x4LeS, i32x4LeU, i32x4LtS,
  i32x4LtU, i32x4Ne,
  i16x8Eq, i16x8GeS, i16x8GeU, i16x8GtS,
  i16x8GtU, i16x8LeS, i16x8LeU, i16x8LtS,
  i16x8LtU, i16x8Ne,
  i8x16Eq, i8x16Ne,
  i8x16LtS, i8x16LtU, i8x16LeS, i8x16LeU,
  i8x16GtU, i8x16GtS, i8x16GeU, i8x16GeS,
} from './simdCompare';

import {
  i8x16ExtractLaneS, i8x16ExtractLaneU,
  i16x8ExtractLaneS, i16x8ExtractLaneU,
  i32x4ExtractLane,
  i64x2ExtractLane,
} from './simdExtract';

import {
  v128Load, v16x8LoadSplat, v32x4LoadSplat, v64x2LoadSplat, v8x16LoadSplat,
} from './simdLoad';

import {
  i16x8Splat, i32x4Splat, i64x2Splat, i8x16Splat,
} from './simdSplat';

import { v128Store } from './simdStore';

import { memoryFill } from './memoryFill';
import { memoryCopy } from './memoryCopy';
import { dataDrop } from './dataDrop';
import { elemDrop } from './elemDrop';

export const polyfills = [
  memoryFill, dataDrop, elemDrop, memoryCopy,
  i64x2ExtractLane, i32x4ExtractLane,
  i16x8ExtractLaneU, i16x8ExtractLaneS,
  i8x16ExtractLaneU, i8x16ExtractLaneS,
  v128Load, v128Store,
  i64x2Add, i64x2Sub, i64x2Mul, i64x2Neg,
  i32x4Add, i32x4Sub, i32x4Mul,
  v128Not, v128And, v128AndNot, v128Or, v128Xor,
  i64x2Shl, i64x2ShrU, i64x2ShrS,
  i32x4Shl, i32x4ShrU, i32x4ShrS,
  i16x8Shl, i16x8ShrU, i16x8ShrS,
  i8x16Shl, i8x16ShrU, i8x16ShrS,
  i64x2Splat, i32x4Splat, i16x8Splat, i8x16Splat,
  i32x4Eq, i32x4Ne,
  i32x4LtS, i32x4LtU, i32x4LeS, i32x4LeU,
  i32x4GtU, i32x4GtS, i32x4GeU, i32x4GeS,
  i16x8Eq, i16x8Ne,
  i16x8LtS, i16x8LtU, i16x8LeS, i16x8LeU,
  i16x8GtU, i16x8GtS, i16x8GeU, i16x8GeS,
  i8x16Eq, i8x16Ne,
  i8x16LtS, i8x16LtU, i8x16LeS, i8x16LeU,
  i8x16GtU, i8x16GtS, i8x16GeU, i8x16GeS,
  v64x2LoadSplat, v32x4LoadSplat, v16x8LoadSplat, v8x16LoadSplat,
];
