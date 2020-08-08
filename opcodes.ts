import * as leb from "@thi.ng/leb128";

const noParameterHandler = (pos) => ({ params: [], pos });
const uintParameter1Handler = (pos, data) => {
  const [result, size] = leb.decodeULEB128(data, pos);
  return { params: [result], pos: pos + size };
}

const uintParameter2Handler = (pos, data) => {
  const [result1, size1] = leb.decodeULEB128(data, pos);
  const [result2, size2] = leb.decodeULEB128(data, pos + size1);
  return { params: [result1, result2], pos: pos + size1 + size2 };
}

const illegalOpHandler = (pos) => {
  throw new Error(`Illegal instruction at pos ${pos}`);
}

const getHandler = (name: string, handler: Function) => {
  return {
    name,
    getPosition: (pos: number, data) => handler(pos, data).pos,
    getParamsAndPosition: handler, // used for debugging
  };
};

export const opcodes = {
  0x00: getHandler('unreachable', noParameterHandler),
  0x01: getHandler('nop', noParameterHandler),

  0x02: getHandler('block', noParameterHandler),
  0x03: getHandler('loop', noParameterHandler),
  0x04: getHandler('if', noParameterHandler),

  0x05: getHandler('else', noParameterHandler),
  0x06: getHandler('illegal 0x06', illegalOpHandler),
  0x07: getHandler('illegal 0x07', illegalOpHandler),
  0x08: getHandler('illegal 0x08', illegalOpHandler),
  0x09: getHandler('illegal 0x09', illegalOpHandler),
  0x0a: getHandler('illegal 0x0a', illegalOpHandler),
  0x0b: getHandler('end', noParameterHandler),

  0x0c: getHandler('br', uintParameter1Handler),
  0x0d: getHandler('br_if', uintParameter1Handler),
  0x0e: getHandler('br_table', uintParameter1Handler),
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
  0x38: getHandler('f32.store - TODO', illegalOpHandler),
  0x39: getHandler('f64.store - TODO', illegalOpHandler),
  0x3a: getHandler('i32.store8', uintParameter2Handler),
  0x3b: getHandler('i32.store16', uintParameter2Handler),
  0x3c: getHandler('i64.store8', uintParameter2Handler),
  0x3d: getHandler('i64.store16', uintParameter2Handler),
  0x3e: getHandler('i64.store32', uintParameter2Handler),

  0x3f: getHandler('memory.size', noParameterHandler),
  0x40: getHandler('memory.grow', noParameterHandler),

  0x41: getHandler('i32.const', uintParameter1Handler),
  0x42: getHandler('i64.const', uintParameter1Handler),
  0x43: getHandler('f32.const - TODO', illegalOpHandler),
  0x44: getHandler('f64.const - TODO', illegalOpHandler),

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

  0x5b: getHandler('f32.eq - TODO', noParameterHandler),
  0x5c: getHandler('f32.ne - TODO', noParameterHandler),
  0x5d: getHandler('f32.lt - TODO', noParameterHandler),
  0x5e: getHandler('f32.gt - TODO', noParameterHandler),
  0x5f: getHandler('f32.le - TODO', noParameterHandler),
  0x60: getHandler('f32.ge - TODO', noParameterHandler),

  0x61: getHandler('f64.eq - TODO', noParameterHandler),
  0x62: getHandler('f64.ne - TODO', noParameterHandler),
  0x63: getHandler('f64.lt - TODO', noParameterHandler),
  0x64: getHandler('f64.gt - TODO', noParameterHandler),
  0x65: getHandler('f64.le - TODO', noParameterHandler),
  0x66: getHandler('f64.ge - TODO', noParameterHandler),

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

  0x8b: getHandler('f32.abs - TODO', illegalOpHandler),
  0x8c: getHandler('f32.neg - TODO', illegalOpHandler),
  0x8d: getHandler('f32.ceil - TODO', illegalOpHandler),
  0x8e: getHandler('f32.floor - TODO', illegalOpHandler),
  0x8f: getHandler('f32.trunc - TODO', illegalOpHandler),
  0x90: getHandler('f32.nearest - TODO', illegalOpHandler),
  0x91: getHandler('f32.sqrt - TODO', illegalOpHandler),
  0x92: getHandler('f32.add - TODO', illegalOpHandler),
  0x93: getHandler('f32.sub - TODO', illegalOpHandler),
  0x94: getHandler('f32.mul - TODO', illegalOpHandler),
  0x95: getHandler('f32.div - TODO', illegalOpHandler),
  0x96: getHandler('f32.min - TODO', illegalOpHandler),
  0x97: getHandler('f32.max - TODO', illegalOpHandler),
  0x98: getHandler('f32.copysign - TODO', illegalOpHandler),

  0x99: getHandler('f64.abs - TODO', illegalOpHandler),
  0x9a: getHandler('f64.neg - TODO', illegalOpHandler),
  0x9b: getHandler('f64.ceil - TODO', illegalOpHandler),
  0x9c: getHandler('f64.floor - TODO', illegalOpHandler),
  0x9d: getHandler('f64.trunc - TODO', illegalOpHandler),
  0x9e: getHandler('f64.nearest - TODO', illegalOpHandler),
  0x9f: getHandler('f64.sqrt - TODO', illegalOpHandler),
  0xa0: getHandler('f64.add - TODO', illegalOpHandler),
  0xa1: getHandler('f64.sub - TODO', illegalOpHandler),
  0xa2: getHandler('f64.mul - TODO', illegalOpHandler),
  0xa3: getHandler('f64.div - TODO', illegalOpHandler),
  0xa4: getHandler('f64.min - TODO', illegalOpHandler),
  0xa5: getHandler('f64.max - TODO', illegalOpHandler),
  0xa6: getHandler('f64.copysign - TODO', illegalOpHandler),

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
  0xb2: getHandler('f32.convert_i32_s - TODO', illegalOpHandler),
  0xb3: getHandler('f32.convert_i32_u - TODO', illegalOpHandler),
  0xb4: getHandler('f32.convert_i64_s - TODO', illegalOpHandler),
  0xb5: getHandler('f32.convert_i64_u - TODO', illegalOpHandler),
  0xb6: getHandler('f32.demote_f64 - TODO', illegalOpHandler),
  0xb7: getHandler('f64.convert_i32_s - TODO', illegalOpHandler),
  0xb8: getHandler('f64.convert_i32_u - TODO', illegalOpHandler),
  0xb9: getHandler('f64.convert_i64_s - TODO', illegalOpHandler),
  0xba: getHandler('f64.convert_i64_u - TODO', illegalOpHandler),
  0xbb: getHandler('f64.promote_f32 - TODO', illegalOpHandler),

  0xbc: getHandler('i32.reinterpret_f32', noParameterHandler),
  0xbd: getHandler('i64.reinterpret_f64', noParameterHandler),
  0xbe: getHandler('f32.reinterpret_i32 - TODO', illegalOpHandler),
  0xbf: getHandler('f64.reinterpret_i64 - TODO', illegalOpHandler),

  0xc0: getHandler('i32.extend8_s', noParameterHandler),
  0xc1: getHandler('i32.extend16_s', noParameterHandler),
  0xc2: getHandler('i64.extend8_s', noParameterHandler),
  0xc3: getHandler('i64.extend16_s', noParameterHandler),
  0xc4: getHandler('i64.extend32_s', noParameterHandler),
};
