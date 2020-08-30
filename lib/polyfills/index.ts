import {
  f64x2Add, f64x2Sub, f64x2Mul,
  f64x2Div, f64x2Sqrt, f64x2Neg, f64x2Abs,
  f64x2Min, f64x2Max,
  f32x4Add, f32x4Sub, f32x4Mul,
  f32x4Div, f32x4Sqrt, f32x4Neg, f32x4Abs,
  f32x4Min, f32x4Max,
  i64x2Add, i64x2Mul, i64x2Neg, i64x2Sub,
  i32x4Add, i32x4Mul, i32x4Sub, i32x4Neg, i32x4Abs,
  i16x8Add, i16x8AddSaturateU, i16x8AddSaturateS,
  i16x8Sub, i16x8SubSaturateU, i16x8SubSaturateS,
  i16x8Mul, i16x8Neg, i16x8Abs, i16x8AvgrU,
  i8x16Add, i8x16AddSaturateU, i8x16AddSaturateS,
  i8x16Sub, i8x16SubSaturateU, i8x16SubSaturateS,
  i8x16Neg, i8x16Abs, i8x16AvgrU,
} from './simdArithmetic';

import {
  i8x16Shl, i8x16ShrS, i8x16ShrU,
  i16x8Shl, i16x8ShrS, i16x8ShrU,
  i32x4Shl, i32x4ShrS, i32x4ShrU,
  i64x2Shl, i64x2ShrS, i64x2ShrU,
  v128And, v128AndNot, v128Not, v128Or, v128Xor,
} from './simdBitwise';

import {
  f64x2Eq, f64x2Ne,
  f64x2Lt, f64x2Le,
  f64x2Gt, f64x2Ge,
  f32x4Eq, f32x4Ne,
  f32x4Lt, f32x4Le,
  f32x4Gt, f32x4Ge,
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
  v128Load, v128Const,
  v16x8LoadSplat, v32x4LoadSplat,
  v64x2LoadSplat, v8x16LoadSplat,
  i64x2Load32x2U, i64x2Load32x2S,
  i32x4Load16x4U, i32x4Load16x4S,
  i16x8Load8x8U, i16x8Load8x8S,
} from './simdLoad';

import {
  i16x8Splat, i32x4Splat, i64x2Splat, i8x16Splat,
  f32x4Splat, f64x2Splat,
} from './simdSplat';

import { v128Store } from './simdStore';

import { memoryFill } from './memoryFill';
import { memoryCopy } from './memoryCopy';
import { dataDrop } from './dataDrop';
import { elemDrop } from './elemDrop';
import {
  i32x4MaxS, i32x4MaxU, i32x4MinS, i32x4MinU,
  i16x8MinS, i16x8MinU, i16x8MaxS, i16x8MaxU,
  i8x16MinS, i8x16MinU, i8x16MaxS, i8x16MaxU,
} from './simdMinMax';
import {
  i32x4ReplaceLane, i64x2ReplaceLane, i16x8ReplaceLane, i8x16ReplaceLane,
} from './simdReplace';
import { i32x4Bitmask } from './simdBitmask';
import {
  i32x4AnyTrue, i16x8AnyTrue, i8x16AnyTrue,
  i32x4AllTrue, i16x8AllTrue, i8x16AllTrue,
} from './simdBoolean';
import {
  i32x4WidenHighi16x8U, i32x4WidenHighi16x8S,
  i32x4WidenLowi16x8U, i32x4WidenLowi16x8S,
  i16x8WidenHighi8x16U, i16x8WidenHighi8x16S,
  i16x8WidenLowi8x16U, i16x8WidenLowi8x16S,
} from './simdWiden';

export const polyfills = [
  memoryFill, dataDrop, elemDrop, memoryCopy,
  i64x2ExtractLane, i32x4ExtractLane,
  i16x8ExtractLaneU, i16x8ExtractLaneS,
  i8x16ExtractLaneU, i8x16ExtractLaneS,
  i64x2ReplaceLane, i32x4ReplaceLane,
  i16x8ReplaceLane, i8x16ReplaceLane,
  v128Load, v128Store, v128Const,
  f64x2Add, f64x2Sub, f64x2Mul,
  f64x2Div, f64x2Sqrt, f64x2Neg, f64x2Abs,
  f64x2Min, f64x2Max,
  f32x4Add, f32x4Sub, f32x4Mul,
  f32x4Div, f32x4Sqrt, f32x4Neg, f32x4Abs,
  f32x4Min, f32x4Max,
  i64x2Add, i64x2Sub, i64x2Mul, i64x2Neg,
  i32x4Add, i32x4Sub, i32x4Mul, i32x4Neg, i32x4Abs,
  i16x8Add, i16x8AddSaturateU, i16x8AddSaturateS,
  i16x8Sub, i16x8SubSaturateU, i16x8SubSaturateS,
  i16x8Mul, i16x8Neg, i16x8Abs, i16x8AvgrU,
  i8x16Add, i8x16AddSaturateU, i8x16AddSaturateS,
  i8x16Sub, i8x16SubSaturateU, i8x16SubSaturateS,
  i8x16Neg, i8x16Abs, i8x16AvgrU,
  i32x4MinS, i32x4MinU, i32x4MaxS, i32x4MaxU,
  i16x8MinS, i16x8MinU, i16x8MaxS, i16x8MaxU,
  i8x16MinS, i8x16MinU, i8x16MaxS, i8x16MaxU,
  i32x4AnyTrue, i16x8AnyTrue, i8x16AnyTrue,
  i32x4AllTrue, i16x8AllTrue, i8x16AllTrue,
  v128Not, v128And, v128AndNot, v128Or, v128Xor,
  i64x2Shl, i64x2ShrU, i64x2ShrS,
  i32x4Shl, i32x4ShrU, i32x4ShrS,
  i16x8Shl, i16x8ShrU, i16x8ShrS,
  i8x16Shl, i8x16ShrU, i8x16ShrS,
  i64x2Splat, i32x4Splat, i16x8Splat, i8x16Splat,
  f32x4Splat, f64x2Splat,
  f64x2Eq, f64x2Ne,
  f64x2Lt, f64x2Le,
  f64x2Gt, f64x2Ge,
  f32x4Eq, f32x4Ne,
  f32x4Lt, f32x4Le,
  f32x4Gt, f32x4Ge,
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
  i64x2Load32x2U, i64x2Load32x2S, i32x4Load16x4U, i32x4Load16x4S,
  i16x8Load8x8U, i16x8Load8x8S,
  i32x4Bitmask,
  i32x4WidenHighi16x8U, i32x4WidenHighi16x8S,
  i32x4WidenLowi16x8U, i32x4WidenLowi16x8S,
  i16x8WidenHighi8x16U, i16x8WidenHighi8x16S,
  i16x8WidenLowi8x16U, i16x8WidenLowi8x16S,
];
