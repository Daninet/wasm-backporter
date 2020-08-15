import { DEBUG } from './config';
import { decodeULEB128, decodeLengthULEB128 } from './leb128';

type IOpCodeHandlerDebugResponse = { params?: number[]; pos: number; };
type IOpCodeHandlerResponse = IOpCodeHandlerDebugResponse | number;

type IOpCodeHandler = (pos: number, data: Buffer) => IOpCodeHandlerResponse;

export interface IOpCode {
  name: string;
  getPosition: IOpCodeHandler;
}

const noParameterHandler: IOpCodeHandler = DEBUG
  ? (pos: number) => ({ params: [], pos })
  : (pos: number) => pos;

const oneByteHandler: IOpCodeHandler = DEBUG
  ? (pos, data) => ({
    params: [data[pos]],
    pos: pos + 1,
  })
  : (pos) => pos + 1;

const uintParameter1Handler: IOpCodeHandler = DEBUG
  ? (pos, data) => {
    const [result, size] = decodeULEB128(data, pos);
    return { params: [result], pos: pos + size };
  }
  : (pos, data) => pos + decodeLengthULEB128(data, pos);

const uintParameter2Handler: IOpCodeHandler = DEBUG
  ? (pos, data) => {
    const [result1, size1] = decodeULEB128(data, pos);
    const [result2, size2] = decodeULEB128(data, pos + size1);
    return { params: [result1, result2], pos: pos + size1 + size2 };
  }
  : (pos, data) => {
    let size = decodeLengthULEB128(data, pos);
    size += decodeLengthULEB128(data, pos + size);
    return pos + size;
  };

const brTableHandler: IOpCodeHandler = DEBUG
  ? (pos, data) => {
    const [vectorSize, vectorSizeBytes] = decodeULEB128(data, pos);
    pos += vectorSizeBytes;

    const params = [];
    for (let i = 0; i < vectorSize; i++) {
      const [item, itemBytes] = decodeULEB128(data, pos);
      pos += itemBytes;
      params.push(item);
    }

    const [label, labelBytes] = decodeULEB128(data, pos);
    pos += labelBytes;
    params.push(label);
    return { params, pos };
  }
  : (pos, data) => {
    const [vectorSize, vectorSizeBytes] = decodeULEB128(data, pos);
    pos += vectorSizeBytes;

    for (let i = 0; i < vectorSize; i++) {
      pos += decodeLengthULEB128(data, pos);
    }

    pos += decodeLengthULEB128(data, pos);
    return pos;
  };

const f32Handler: IOpCodeHandler = DEBUG
  ? (pos) => ({ params: [], pos: pos + 4 })
  : (pos) => ({ pos: pos + 4 });

const f64Handler: IOpCodeHandler = DEBUG
  ? (pos) => ({ params: [], pos: pos + 8 })
  : (pos) => ({ pos: pos + 8 });

const simd16Bytes: IOpCodeHandler = DEBUG
  ? (pos, data) => ({
    params: Array.from(data.subarray(pos, pos + 16)),
    pos: pos + 16,
  })
  : (pos) => pos + 16;

const illegalOpHandler: IOpCodeHandler = (pos) => {
  throw new Error(`Illegal instruction at pos ${pos}`);
};

const getHandler = (name: string, handler: IOpCodeHandler): IOpCode => ({
  name,
  getPosition: (pos, data) => handler(pos, data),
});

export const opcodes = {
  0x00: getHandler('unreachable', noParameterHandler),
  0x01: getHandler('nop', noParameterHandler),

  0x02: getHandler('block', uintParameter1Handler),
  0x03: getHandler('loop', uintParameter1Handler),
  0x04: getHandler('if', uintParameter1Handler),

  0x05: getHandler('else', noParameterHandler),
  0x06: getHandler('illegal 0x06', illegalOpHandler),
  0x07: getHandler('illegal 0x07', illegalOpHandler),
  0x08: getHandler('illegal 0x08', illegalOpHandler),
  0x09: getHandler('illegal 0x09', illegalOpHandler),
  0x0a: getHandler('illegal 0x0a', illegalOpHandler),
  0x0b: getHandler('end', noParameterHandler),

  0x0c: getHandler('br', uintParameter1Handler),
  0x0d: getHandler('br_if', uintParameter1Handler),
  0x0e: getHandler('br_table', brTableHandler),
  0x0f: getHandler('return', noParameterHandler),

  0x10: getHandler('call', uintParameter1Handler),
  0x11: getHandler('call_indirect', uintParameter2Handler),

  0x12: getHandler('illegal 0x12', illegalOpHandler),
  0x13: getHandler('illegal 0x13', illegalOpHandler),
  0x14: getHandler('illegal 0x14', illegalOpHandler),
  0x15: getHandler('illegal 0x15', illegalOpHandler),
  0x16: getHandler('illegal 0x16', illegalOpHandler),
  0x17: getHandler('illegal 0x17', illegalOpHandler),
  0x18: getHandler('illegal 0x18', illegalOpHandler),
  0x19: getHandler('illegal 0x19', illegalOpHandler),

  0x1a: getHandler('drop', noParameterHandler),
  0x1b: getHandler('select', noParameterHandler),

  0x1c: getHandler('illegal 0x1c', illegalOpHandler),
  0x1d: getHandler('illegal 0x1d', illegalOpHandler),
  0x1e: getHandler('illegal 0x1e', illegalOpHandler),
  0x1f: getHandler('illegal 0x1f', illegalOpHandler),

  0x20: getHandler('local.get', uintParameter1Handler),
  0x21: getHandler('local.set', uintParameter1Handler),
  0x22: getHandler('local.tee', uintParameter1Handler),
  0x23: getHandler('global.get', uintParameter1Handler),
  0x24: getHandler('global.set', uintParameter1Handler),

  0x25: getHandler('illegal 0x25', illegalOpHandler),
  0x26: getHandler('illegal 0x26', illegalOpHandler),
  0x27: getHandler('illegal 0x27', illegalOpHandler),

  0x28: getHandler('i32.load', uintParameter2Handler),
  0x29: getHandler('i64.load', uintParameter2Handler),
  0x2a: getHandler('f32.load', uintParameter2Handler),
  0x2b: getHandler('f64.load', uintParameter2Handler),
  0x2c: getHandler('i32.load8_s', uintParameter2Handler),
  0x2d: getHandler('i32.load8_u', uintParameter2Handler),
  0x2e: getHandler('i32.load16_s', uintParameter2Handler),
  0x2f: getHandler('i32.load16_u', uintParameter2Handler),
  0x30: getHandler('i64.load8_s', uintParameter2Handler),
  0x31: getHandler('i64.load8_u', uintParameter2Handler),
  0x32: getHandler('i64.load16_s', uintParameter2Handler),
  0x33: getHandler('i64.load16_u', uintParameter2Handler),
  0x34: getHandler('i64.load32_s', uintParameter2Handler),
  0x35: getHandler('i64.load32_u', uintParameter2Handler),

  0x36: getHandler('i32.store', uintParameter2Handler),
  0x37: getHandler('i64.store', uintParameter2Handler),
  0x38: getHandler('f32.store', uintParameter2Handler),
  0x39: getHandler('f64.store', uintParameter2Handler),
  0x3a: getHandler('i32.store8', uintParameter2Handler),
  0x3b: getHandler('i32.store16', uintParameter2Handler),
  0x3c: getHandler('i64.store8', uintParameter2Handler),
  0x3d: getHandler('i64.store16', uintParameter2Handler),
  0x3e: getHandler('i64.store32', uintParameter2Handler),

  0x3f: getHandler('memory.size', uintParameter1Handler),
  0x40: getHandler('memory.grow', uintParameter1Handler),

  0x41: getHandler('i32.const', uintParameter1Handler),
  0x42: getHandler('i64.const', uintParameter1Handler),
  0x43: getHandler('f32.const', f32Handler),
  0x44: getHandler('f64.const', f64Handler),

  0x45: getHandler('i32.eqz', noParameterHandler),
  0x46: getHandler('i32.eq', noParameterHandler),
  0x47: getHandler('i32.ne', noParameterHandler),
  0x48: getHandler('i32.lt_s', noParameterHandler),
  0x49: getHandler('i32.lt_u', noParameterHandler),
  0x4a: getHandler('i32.gt_s', noParameterHandler),
  0x4b: getHandler('i32.gt_u', noParameterHandler),
  0x4c: getHandler('i32.le_s', noParameterHandler),
  0x4d: getHandler('i32.le_u', noParameterHandler),
  0x4e: getHandler('i32.ge_s', noParameterHandler),
  0x4f: getHandler('i32.ge_u', noParameterHandler),

  0x50: getHandler('i64.eqz', noParameterHandler),
  0x51: getHandler('i64.eq', noParameterHandler),
  0x52: getHandler('i64.ne', noParameterHandler),
  0x53: getHandler('i64.lt_s', noParameterHandler),
  0x54: getHandler('i64.lt_u', noParameterHandler),
  0x55: getHandler('i64.gt_s', noParameterHandler),
  0x56: getHandler('i64.gt_u', noParameterHandler),
  0x57: getHandler('i64.le_s', noParameterHandler),
  0x58: getHandler('i64.le_u', noParameterHandler),
  0x59: getHandler('i64.ge_s', noParameterHandler),
  0x5a: getHandler('i64.ge_u', noParameterHandler),

  0x5b: getHandler('f32.eq', noParameterHandler),
  0x5c: getHandler('f32.ne', noParameterHandler),
  0x5d: getHandler('f32.lt', noParameterHandler),
  0x5e: getHandler('f32.gt', noParameterHandler),
  0x5f: getHandler('f32.le', noParameterHandler),
  0x60: getHandler('f32.ge', noParameterHandler),

  0x61: getHandler('f64.eq', noParameterHandler),
  0x62: getHandler('f64.ne', noParameterHandler),
  0x63: getHandler('f64.lt', noParameterHandler),
  0x64: getHandler('f64.gt', noParameterHandler),
  0x65: getHandler('f64.le', noParameterHandler),
  0x66: getHandler('f64.ge', noParameterHandler),

  0x67: getHandler('i32.clz', noParameterHandler),
  0x68: getHandler('i32.ctz', noParameterHandler),
  0x69: getHandler('i32.popcnt', noParameterHandler),
  0x6a: getHandler('i32.add', noParameterHandler),
  0x6b: getHandler('i32.sub', noParameterHandler),
  0x6c: getHandler('i32.mul', noParameterHandler),
  0x6d: getHandler('i32.div_s', noParameterHandler),
  0x6e: getHandler('i32.div_u', noParameterHandler),
  0x6f: getHandler('i32.rem_s', noParameterHandler),
  0x70: getHandler('i32.rem_u', noParameterHandler),
  0x71: getHandler('i32.and', noParameterHandler),
  0x72: getHandler('i32.or', noParameterHandler),
  0x73: getHandler('i32.xor', noParameterHandler),
  0x74: getHandler('i32.shl', noParameterHandler),
  0x75: getHandler('i32.shr_s', noParameterHandler),
  0x76: getHandler('i32.shr_u', noParameterHandler),
  0x77: getHandler('i32.rotl', noParameterHandler),
  0x78: getHandler('i32.rotr', noParameterHandler),

  0x79: getHandler('i64.clz', noParameterHandler),
  0x7a: getHandler('i64.ctz', noParameterHandler),
  0x7b: getHandler('i64.popcnt', noParameterHandler),
  0x7c: getHandler('i64.add', noParameterHandler),
  0x7d: getHandler('i64.sub', noParameterHandler),
  0x7e: getHandler('i64.mul', noParameterHandler),
  0x7f: getHandler('i64.div_s', noParameterHandler),
  0x80: getHandler('i64.div_u', noParameterHandler),
  0x81: getHandler('i64.rem_s', noParameterHandler),
  0x82: getHandler('i64.rem_u', noParameterHandler),
  0x83: getHandler('i64.and', noParameterHandler),
  0x84: getHandler('i64.or', noParameterHandler),
  0x85: getHandler('i64.xor', noParameterHandler),
  0x86: getHandler('i64.shl', noParameterHandler),
  0x87: getHandler('i64.shr_s', noParameterHandler),
  0x88: getHandler('i64.shr_u', noParameterHandler),
  0x89: getHandler('i64.rotl', noParameterHandler),
  0x8a: getHandler('i64.rotr', noParameterHandler),

  0x8b: getHandler('f32.abs', noParameterHandler),
  0x8c: getHandler('f32.neg', noParameterHandler),
  0x8d: getHandler('f32.ceil', noParameterHandler),
  0x8e: getHandler('f32.floor', noParameterHandler),
  0x8f: getHandler('f32.trunc', noParameterHandler),
  0x90: getHandler('f32.nearest', noParameterHandler),
  0x91: getHandler('f32.sqrt', noParameterHandler),
  0x92: getHandler('f32.add', noParameterHandler),
  0x93: getHandler('f32.sub', noParameterHandler),
  0x94: getHandler('f32.mul', noParameterHandler),
  0x95: getHandler('f32.div', noParameterHandler),
  0x96: getHandler('f32.min', noParameterHandler),
  0x97: getHandler('f32.max', noParameterHandler),
  0x98: getHandler('f32.copysign', noParameterHandler),

  0x99: getHandler('f64.abs', noParameterHandler),
  0x9a: getHandler('f64.neg', noParameterHandler),
  0x9b: getHandler('f64.ceil', noParameterHandler),
  0x9c: getHandler('f64.floor', noParameterHandler),
  0x9d: getHandler('f64.trunc', noParameterHandler),
  0x9e: getHandler('f64.nearest', noParameterHandler),
  0x9f: getHandler('f64.sqrt', noParameterHandler),
  0xa0: getHandler('f64.add', noParameterHandler),
  0xa1: getHandler('f64.sub', noParameterHandler),
  0xa2: getHandler('f64.mul', noParameterHandler),
  0xa3: getHandler('f64.div', noParameterHandler),
  0xa4: getHandler('f64.min', noParameterHandler),
  0xa5: getHandler('f64.max', noParameterHandler),
  0xa6: getHandler('f64.copysign', noParameterHandler),

  0xa7: getHandler('i32.wrap_i64', noParameterHandler),
  0xa8: getHandler('i32.trunc_f32_s', noParameterHandler),
  0xa9: getHandler('i32.trunc_f32_u', noParameterHandler),
  0xaa: getHandler('i32.trunc_f64_s', noParameterHandler),
  0xab: getHandler('i32.trunc_f64_u', noParameterHandler),
  0xac: getHandler('i64.extend_i32_s', noParameterHandler),
  0xad: getHandler('i64.extend_i32_u', noParameterHandler),
  0xae: getHandler('i64.trunc_f32_s', noParameterHandler),
  0xaf: getHandler('i64.trunc_f32_u', noParameterHandler),
  0xb0: getHandler('i64.trunc_f64_s', noParameterHandler),
  0xb1: getHandler('i64.trunc_f64_u', noParameterHandler),
  0xb2: getHandler('f32.convert_i32_s', noParameterHandler),
  0xb3: getHandler('f32.convert_i32_u', noParameterHandler),
  0xb4: getHandler('f32.convert_i64_s', noParameterHandler),
  0xb5: getHandler('f32.convert_i64_u', noParameterHandler),
  0xb6: getHandler('f32.demote_f64', noParameterHandler),
  0xb7: getHandler('f64.convert_i32_s', noParameterHandler),
  0xb8: getHandler('f64.convert_i32_u', noParameterHandler),
  0xb9: getHandler('f64.convert_i64_s', noParameterHandler),
  0xba: getHandler('f64.convert_i64_u', noParameterHandler),
  0xbb: getHandler('f64.promote_f32', noParameterHandler),

  0xbc: getHandler('i32.reinterpret_f32', noParameterHandler),
  0xbd: getHandler('i64.reinterpret_f64', noParameterHandler),
  0xbe: getHandler('f32.reinterpret_i32', noParameterHandler),
  0xbf: getHandler('f64.reinterpret_i64', noParameterHandler),

  0xc0: getHandler('i32.extend8_s', noParameterHandler),
  0xc1: getHandler('i32.extend16_s', noParameterHandler),
  0xc2: getHandler('i64.extend8_s', noParameterHandler),
  0xc3: getHandler('i64.extend16_s', noParameterHandler),
  0xc4: getHandler('i64.extend32_s', noParameterHandler),
};

const reverseMap = {};
Object.keys(opcodes).forEach((opcode) => {
  const { name } = opcodes[opcode];
  if (name.includes(' ')) return;
  reverseMap[name] = parseInt(opcode, 10);
});
export const reverseOpCodes = reverseMap;

export const longOpCodes = {
  // Non-trapping float-to-int conversions
  0xfc00: getHandler('i32.trunc_sat_f32_s', noParameterHandler),
  0xfc01: getHandler('i32.trunc_sat_f32_u', noParameterHandler),
  0xfc02: getHandler('i32.trunc_sat_f64_s', noParameterHandler),
  0xfc03: getHandler('i32.trunc_sat_f64_u', noParameterHandler),
  0xfc04: getHandler('i64.trunc_sat_f32_s', noParameterHandler),
  0xfc05: getHandler('i64.trunc_sat_f32_u', noParameterHandler),
  0xfc06: getHandler('i64.trunc_sat_f64_s', noParameterHandler),
  0xfc07: getHandler('i64.trunc_sat_f64_u', noParameterHandler),

  // Bulk memory
  0xfc08: getHandler('memory.init - TODO', illegalOpHandler),
  0xfc09: getHandler('data.drop', uintParameter1Handler),
  0xfc0a: getHandler('memory.copy', uintParameter2Handler),
  0xfc0b: getHandler('memory.fill', uintParameter1Handler),
  0xfc0c: getHandler('table.init - TODO', illegalOpHandler),
  0xfc0d: getHandler('elem.drop', uintParameter1Handler),
  0xfc0e: getHandler('table.copy - TODO', illegalOpHandler),

  // SIMD
  0xfd00: getHandler('v128.load', uintParameter2Handler),
  0xfd01: getHandler('i16x8.load8x8_s', uintParameter2Handler),
  0xfd02: getHandler('i16x8.load8x8_u', uintParameter2Handler),
  0xfd03: getHandler('i32x4.load16x4_s', uintParameter2Handler),
  0xfd04: getHandler('i32x4.load16x4_u', uintParameter2Handler),
  0xfd05: getHandler('i64x2.load32x2_s', uintParameter2Handler),
  0xfd06: getHandler('i64x2.load32x2_u', uintParameter2Handler),
  0xfd07: getHandler('v8x16.load_splat', uintParameter2Handler),
  0xfd08: getHandler('v16x8.load_splat', uintParameter2Handler),
  0xfd09: getHandler('v32x4.load_splat', uintParameter2Handler),
  0xfd0a: getHandler('v64x2.load_splat', uintParameter2Handler),
  0xfd0b: getHandler('v128.store', uintParameter2Handler),
  0xfd0c: getHandler('v128.const', simd16Bytes),
  0xfd0d: getHandler('v8x16.shuffle', simd16Bytes),
  0xfd0e: getHandler('v8x16.swizzle', noParameterHandler),
  0xfd0f: getHandler('i8x16.splat', noParameterHandler),
  0xfd10: getHandler('i16x8.splat', noParameterHandler),
  0xfd11: getHandler('i32x4.splat', noParameterHandler),
  0xfd12: getHandler('i64x2.splat', noParameterHandler),
  0xfd13: getHandler('f32x4.splat', noParameterHandler),
  0xfd14: getHandler('f64x2.splat', noParameterHandler),
  0xfd15: getHandler('i8x16.extract_lane_s', oneByteHandler),
  0xfd16: getHandler('i8x16.extract_lane_u', oneByteHandler),
  0xfd17: getHandler('i8x16.replace_lane', oneByteHandler),
  0xfd18: getHandler('i16x8.extract_lane_s', oneByteHandler),
  0xfd19: getHandler('i16x8.extract_lane_u', oneByteHandler),
  0xfd1a: getHandler('i16x8.replace_lane', oneByteHandler),
  0xfd1b: getHandler('i32x4.extract_lane', oneByteHandler),
  0xfd1c: getHandler('i32x4.replace_lane', oneByteHandler),
  0xfd1d: getHandler('i64x2.extract_lane', oneByteHandler),
  0xfd1e: getHandler('i64x2.replace_lane', oneByteHandler),
  0xfd1f: getHandler('f32x4.extract_lane', oneByteHandler),
  0xfd20: getHandler('f32x4.replace_lane', oneByteHandler),
  0xfd21: getHandler('f64x2.extract_lane', oneByteHandler),
  0xfd22: getHandler('f64x2.replace_lane', oneByteHandler),
  0xfd23: getHandler('i8x16.eq', noParameterHandler),
  0xfd24: getHandler('i8x16.ne', noParameterHandler),
  0xfd25: getHandler('i8x16.lt_s', noParameterHandler),
  0xfd26: getHandler('i8x16.lt_u', noParameterHandler),
  0xfd27: getHandler('i8x16.gt_s', noParameterHandler),
  0xfd28: getHandler('i8x16.gt_u', noParameterHandler),
  0xfd29: getHandler('i8x16.le_s', noParameterHandler),
  0xfd2a: getHandler('i8x16.le_u', noParameterHandler),
  0xfd2b: getHandler('i8x16.ge_s', noParameterHandler),
  0xfd2c: getHandler('i8x16.ge_u', noParameterHandler),
  0xfd2d: getHandler('i16x8.eq', noParameterHandler),
  0xfd2e: getHandler('i16x8.ne', noParameterHandler),
  0xfd2f: getHandler('i16x8.lt_s', noParameterHandler),
  0xfd30: getHandler('i16x8.lt_u', noParameterHandler),
  0xfd31: getHandler('i16x8.gt_s', noParameterHandler),
  0xfd32: getHandler('i16x8.gt_u', noParameterHandler),
  0xfd33: getHandler('i16x8.le_s', noParameterHandler),
  0xfd34: getHandler('i16x8.le_u', noParameterHandler),
  0xfd35: getHandler('i16x8.ge_s', noParameterHandler),
  0xfd36: getHandler('i16x8.ge_u', noParameterHandler),
  0xfd37: getHandler('i32x4.eq', noParameterHandler),
  0xfd38: getHandler('i32x4.ne', noParameterHandler),
  0xfd39: getHandler('i32x4.lt_s', noParameterHandler),
  0xfd3a: getHandler('i32x4.lt_u', noParameterHandler),
  0xfd3b: getHandler('i32x4.gt_s', noParameterHandler),
  0xfd3c: getHandler('i32x4.gt_u', noParameterHandler),
  0xfd3d: getHandler('i32x4.le_s', noParameterHandler),
  0xfd3e: getHandler('i32x4.le_u', noParameterHandler),
  0xfd3f: getHandler('i32x4.ge_s', noParameterHandler),
  0xfd40: getHandler('i32x4.ge_u', noParameterHandler),
  0xfd41: getHandler('f32x4.eq', noParameterHandler),
  0xfd42: getHandler('f32x4.ne', noParameterHandler),
  0xfd43: getHandler('f32x4.lt', noParameterHandler),
  0xfd44: getHandler('f32x4.gt', noParameterHandler),
  0xfd45: getHandler('f32x4.le', noParameterHandler),
  0xfd46: getHandler('f32x4.ge', noParameterHandler),
  0xfd47: getHandler('f64x2.eq', noParameterHandler),
  0xfd48: getHandler('f64x2.ne', noParameterHandler),
  0xfd49: getHandler('f64x2.lt', noParameterHandler),
  0xfd4a: getHandler('f64x2.gt', noParameterHandler),
  0xfd4b: getHandler('f64x2.le', noParameterHandler),
  0xfd4c: getHandler('f64x2.ge', noParameterHandler),
  0xfd4d: getHandler('v128.not', noParameterHandler),
  0xfd4e: getHandler('v128.and', noParameterHandler),
  0xfd4f: getHandler('v128.andnot', noParameterHandler),
  0xfd50: getHandler('v128.or', noParameterHandler),
  0xfd51: getHandler('v128.xor', noParameterHandler),
  0xfd52: getHandler('v128.bitselect', noParameterHandler),
  0xfd60: getHandler('i8x16.abs', noParameterHandler),
  0xfd61: getHandler('i8x16.neg', noParameterHandler),
  0xfd62: getHandler('i8x16.any_true', noParameterHandler),
  0xfd63: getHandler('i8x16.all_true', noParameterHandler),
  0xfd64: getHandler('i8x16.bitmask', noParameterHandler),
  0xfd65: getHandler('i8x16.narrow_i16x8_s', noParameterHandler),
  0xfd66: getHandler('i8x16.narrow_i16x8_u', noParameterHandler),
  0xfd6b: getHandler('i8x16.shl', noParameterHandler),
  0xfd6c: getHandler('i8x16.shr_s', noParameterHandler),
  0xfd6d: getHandler('i8x16.shr_u', noParameterHandler),
  0xfd6e: getHandler('i8x16.add', noParameterHandler),
  0xfd6f: getHandler('i8x16.add_saturate_s', noParameterHandler),
  0xfd70: getHandler('i8x16.add_saturate_u', noParameterHandler),
  0xfd71: getHandler('i8x16.sub', noParameterHandler),
  0xfd72: getHandler('i8x16.sub_saturate_s', noParameterHandler),
  0xfd73: getHandler('i8x16.sub_saturate_u', noParameterHandler),
  0xfd76: getHandler('i8x16.min_s', noParameterHandler),
  0xfd77: getHandler('i8x16.min_u', noParameterHandler),
  0xfd78: getHandler('i8x16.max_s', noParameterHandler),
  0xfd79: getHandler('i8x16.max_u', noParameterHandler),
  0xfd7b: getHandler('i8x16.avgr_u', noParameterHandler),
  0xfd80: getHandler('i16x8.abs', noParameterHandler),
  0xfd81: getHandler('i16x8.neg', noParameterHandler),
  0xfd82: getHandler('i16x8.any_true', noParameterHandler),
  0xfd83: getHandler('i16x8.all_true', noParameterHandler),
  0xfd84: getHandler('i16x8.bitmask', noParameterHandler),
  0xfd85: getHandler('i16x8.narrow_i32x4_s', noParameterHandler),
  0xfd86: getHandler('i16x8.narrow_i32x4_u', noParameterHandler),
  0xfd87: getHandler('i16x8.widen_low_i8x16_s', noParameterHandler),
  0xfd88: getHandler('i16x8.widen_high_i8x16_s', noParameterHandler),
  0xfd89: getHandler('i16x8.widen_low_i8x16_u', noParameterHandler),
  0xfd8a: getHandler('i16x8.widen_high_i8x16_u', noParameterHandler),
  0xfd8b: getHandler('i16x8.shl', noParameterHandler),
  0xfd8c: getHandler('i16x8.shr_s', noParameterHandler),
  0xfd8d: getHandler('i16x8.shr_u', noParameterHandler),
  0xfd8e: getHandler('i16x8.add', noParameterHandler),
  0xfd8f: getHandler('i16x8.add_saturate_s', noParameterHandler),
  0xfd90: getHandler('i16x8.add_saturate_u', noParameterHandler),
  0xfd91: getHandler('i16x8.sub', noParameterHandler),
  0xfd92: getHandler('i16x8.sub_saturate_s', noParameterHandler),
  0xfd93: getHandler('i16x8.sub_saturate_u', noParameterHandler),
  0xfd95: getHandler('i16x8.mul', noParameterHandler),
  0xfd96: getHandler('i16x8.min_s', noParameterHandler),
  0xfd97: getHandler('i16x8.min_u', noParameterHandler),
  0xfd98: getHandler('i16x8.max_s', noParameterHandler),
  0xfd99: getHandler('i16x8.max_u', noParameterHandler),
  0xfd9b: getHandler('i16x8.avgr_u', noParameterHandler),
  0xfda0: getHandler('i32x4.abs', noParameterHandler),
  0xfda1: getHandler('i32x4.neg', noParameterHandler),
  0xfda2: getHandler('i32x4.any_true', noParameterHandler),
  0xfda3: getHandler('i32x4.all_true', noParameterHandler),
  0xfda4: getHandler('i32x4.bitmask', noParameterHandler),
  0xfda7: getHandler('i32x4.widen_low_i16x8_s', noParameterHandler),
  0xfda8: getHandler('i32x4.widen_high_i16x8_s', noParameterHandler),
  0xfda9: getHandler('i32x4.widen_low_i16x8_u', noParameterHandler),
  0xfdaa: getHandler('i32x4.widen_high_i16x8_u', noParameterHandler),
  0xfdab: getHandler('i32x4.shl', noParameterHandler),
  0xfdac: getHandler('i32x4.shr_s', noParameterHandler),
  0xfdad: getHandler('i32x4.shr_u', noParameterHandler),
  0xfdae: getHandler('i32x4.add', noParameterHandler),
  0xfdb1: getHandler('i32x4.sub', noParameterHandler),
  0xfdb5: getHandler('i32x4.mul', noParameterHandler),
  0xfdb6: getHandler('i32x4.min_s', noParameterHandler),
  0xfdb7: getHandler('i32x4.min_u', noParameterHandler),
  0xfdb8: getHandler('i32x4.max_s', noParameterHandler),
  0xfdb9: getHandler('i32x4.max_u', noParameterHandler),
  0xfdc1: getHandler('i64x2.neg', noParameterHandler),
  0xfdcb: getHandler('i64x2.shl', noParameterHandler),
  0xfdcc: getHandler('i64x2.shr_s', noParameterHandler),
  0xfdcd: getHandler('i64x2.shr_u', noParameterHandler),
  0xfdce: getHandler('i64x2.add', noParameterHandler),
  0xfdd1: getHandler('i64x2.sub', noParameterHandler),
  0xfdd5: getHandler('i64x2.mul', noParameterHandler),
  0xfde0: getHandler('f32x4.abs', noParameterHandler),
  0xfde1: getHandler('f32x4.neg', noParameterHandler),
  0xfde3: getHandler('f32x4.sqrt', noParameterHandler),
  0xfde4: getHandler('f32x4.add', noParameterHandler),
  0xfde5: getHandler('f32x4.sub', noParameterHandler),
  0xfde6: getHandler('f32x4.mul', noParameterHandler),
  0xfde7: getHandler('f32x4.div', noParameterHandler),
  0xfde8: getHandler('f32x4.min', noParameterHandler),
  0xfde9: getHandler('f32x4.max', noParameterHandler),
  0xfdec: getHandler('f64x2.abs', noParameterHandler),
  0xfded: getHandler('f64x2.neg', noParameterHandler),
  0xfdef: getHandler('f64x2.sqrt', noParameterHandler),
  0xfdf0: getHandler('f64x2.add', noParameterHandler),
  0xfdf1: getHandler('f64x2.sub', noParameterHandler),
  0xfdf2: getHandler('f64x2.mul', noParameterHandler),
  0xfdf3: getHandler('f64x2.div', noParameterHandler),
  0xfdf4: getHandler('f64x2.min', noParameterHandler),
  0xfdf5: getHandler('f64x2.max', noParameterHandler),
  0xfdf8: getHandler('i32x4.trunc_sat_f32x4_s', noParameterHandler),
  0xfdf9: getHandler('i32x4.trunc_sat_f32x4_u', noParameterHandler),
  0xfdfa: getHandler('f32x4.convert_i32x4_s', noParameterHandler),
  0xfdfb: getHandler('f32x4.convert_i32x4_u', noParameterHandler),
};

export interface IOpCodeResult {
  code: number;
  name: string;
  pos: number;
  nextPos: number;
  params?: number[]; // only when in DEBUG mode
}

export function readOpCode(buf: Buffer, pos: number): IOpCodeResult {
  const startPosition = pos;
  const opcode = buf[pos++];
  let fullOpcode = opcode;
  let opcodeData: IOpCode = opcodes[opcode];
  if (!opcodeData) {
    // read extra byte
    const opcode2 = buf[pos++];
    fullOpcode = opcode * 256 + opcode2;
    opcodeData = longOpCodes[fullOpcode];
    if (!opcodeData) {
      // rewind
      pos--;
      throw new Error(`Invalid opcode 0x${opcode.toString(16)} at ${pos - 1}`);
    }
  }

  const opExecValue = opcodeData.getPosition(pos, buf);

  return {
    name: opcodeData.name,
    code: fullOpcode,
    pos: startPosition,
    nextPos: DEBUG ? (opExecValue as IOpCodeHandlerDebugResponse).pos : opExecValue as number,
    params: DEBUG ? (opExecValue as IOpCodeHandlerDebugResponse).params : null,
  };
}
