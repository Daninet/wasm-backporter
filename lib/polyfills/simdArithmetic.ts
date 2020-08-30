/* eslint-disable indent */
/* eslint-disable dot-notation */
import {
  MINUS_ONE, S16_MAX, S8_MAX, U16_MAX, U8_MAX,
} from './util';
import { reverseOpCodes } from '../opcodes';
import type { IPolyfill } from './type';
import { encodeULEB128 } from '../leb128';

const op = reverseOpCodes;

function i64x2Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],
    op['local.get'], ...localIndices[1],
    instruction,
    op['local.get'], ...localIndices[0],
    op['local.get'], ...localIndices[2],
    instruction,
  ]);
}

export const i64x2Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.add',
  replacer: (instruction, fnIndex, localIndices) => (
    i64x2Op(op['i64.add'], localIndices)
  ),
};

export const i64x2Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    i64x2Op(op['i64.sub'], localIndices)
  ),
};

export const i64x2Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    i64x2Op(op['i64.mul'], localIndices)
  ),
};

export const i64x2Neg: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i64x2.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], ...MINUS_ONE,
      op['i64.const'], ...MINUS_ONE,
      ...i64x2Op(op['i64.mul'], localIndices),
    ])
  ),
};

function f64x2Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],
    op['f64.reinterpret_i64'],
    op['local.get'], ...localIndices[1],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.reinterpret_f64'],
    op['local.get'], ...localIndices[0],
    op['f64.reinterpret_i64'],
    op['local.get'], ...localIndices[2],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.reinterpret_f64'],
  ]);
}

export const f64x2Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.add',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.add'], localIndices)
  ),
};

export const f64x2Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.sub'], localIndices)
  ),
};

export const f64x2Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.mul'], localIndices)
  ),
};

export const f64x2Div: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.div',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.div'], localIndices)
  ),
};

export const f64x2Min: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.min',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.min'], localIndices)
  ),
};

export const f64x2Max: IPolyfill = {
  locals: ['i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f64x2.max',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2Op(op['f64.max'], localIndices)
  ),
};

function f64x2OpSingle(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  return new Uint8Array([
    op['local.set'], ...localIndices[0],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.reinterpret_f64'],
    op['local.get'], ...localIndices[0],
    op['f64.reinterpret_i64'],
    instruction,
    op['i64.reinterpret_f64'],
  ]);
}

export const f64x2Neg: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'f64x2.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2OpSingle(op['f64.neg'], localIndices)
  ),
};

export const f64x2Sqrt: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'f64x2.sqrt',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2OpSingle(op['f64.sqrt'], localIndices)
  ),
};

export const f64x2Abs: IPolyfill = {
  locals: ['i64'],
  match: (instruction) => instruction.name === 'f64x2.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    f64x2OpSingle(op['f64.abs'], localIndices)
  ),
};

function i32x4Op(instructions: number[], localIndices: Uint8Array[]): Uint8Array {
  const buf = [];
  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i32.wrap_i64'],
      ...instructions,
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['local.get'], ...localIndices[i + 2],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      ...instructions,
      op['i64.extend_i32_u'],
      op['i64.const'], 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0], ...buf[1],
  ]);
}

export const i32x4Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.add',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op([op['i32.add']], localIndices)
  ),
};

export const i32x4Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op([op['i32.sub']], localIndices)
  ),
};

export const i32x4Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    i32x4Op([op['i32.mul']], localIndices)
  ),
};

export const i32x4Neg: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i32x4.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], ...MINUS_ONE,
      op['i64.const'], ...MINUS_ONE,
      ...i32x4Op([op['i32.mul']], localIndices),
    ])
  ),
};

export const i32x4Abs: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i32x4.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], 0x00,
      op['i64.const'], 0x00,
      ...i32x4Op([
        op['drop'],
        op['local.tee'], ...localIndices[4],
        op['i32.const'], 0x1f,
        op['i32.shr_s'],
        op['local.get'], ...localIndices[4],
        op['i32.xor'],
        op['local.get'], ...localIndices[4],
        op['i32.const'], 0x1f,
        op['i32.shr_s'],
        op['i32.sub'],
      ], localIndices),
    ])
  ),
};

function f32x4Op(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  const buf = [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        ...(j === 1 ? [
          op['i64.const'], 0x20,
          op['i64.shr_u'],
        ] : []),
        op['i32.wrap_i64'],
        op['f32.reinterpret_i32'],
        op['local.get'], ...localIndices[i + 2],
        ...(j === 1 ? [
          op['i64.const'], 0x20,
          op['i64.shr_u'],
        ] : []),
        op['i32.wrap_i64'],
        op['f32.reinterpret_i32'],
        instruction,
        op['i32.reinterpret_f32'],
        op['i64.extend_i32_u'],
      ]));
    }
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
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

export const f32x4Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.add',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.add'], localIndices)
  ),
};

export const f32x4Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.sub'], localIndices)
  ),
};

export const f32x4Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.mul'], localIndices)
  ),
};

export const f32x4Div: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.div',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.div'], localIndices)
  ),
};

export const f32x4Min: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.min',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.min'], localIndices)
  ),
};

export const f32x4Max: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.max',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4Op(op['f32.max'], localIndices)
  ),
};

function f32x4OpSingle(instruction: number, localIndices: Uint8Array[]): Uint8Array {
  const buf = [];

  for (let i = 0; i < 2; i++) {
    buf.push(new Uint8Array([
      op['local.get'], ...localIndices[i],
      op['i32.wrap_i64'],
      op['f32.reinterpret_i32'],
      instruction,
      op['i32.reinterpret_f32'],
      op['i64.extend_i32_u'],

      op['local.get'], ...localIndices[i],
      op['i64.const'], 0x20,
      op['i64.shr_u'],
      op['i32.wrap_i64'],
      op['f32.reinterpret_i32'],
      instruction,
      op['i32.reinterpret_f32'],
      op['i64.extend_i32_u'],

      op['i64.const'], 0x20,
      op['i64.shl'],
      op['i64.or'],
    ]));
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    ...buf[0], ...buf[1],
  ]);
}

export const f32x4Neg: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4OpSingle(op['f32.neg'], localIndices)
  ),
};

export const f32x4Sqrt: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.sqrt',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4OpSingle(op['f32.sqrt'], localIndices)
  ),
};

export const f32x4Abs: IPolyfill = {
  locals: ['i64', 'i64'],
  match: (instruction) => instruction.name === 'f32x4.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    f32x4OpSingle(op['f32.abs'], localIndices)
  ),
};

function i16x8Op(instructions: number[], localIndices: Uint8Array[]): Uint8Array {
  const buf = [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 4; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        op['i64.const'], encodeULEB128(j * 0x10),
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        op['local.get'], ...localIndices[i + 2],
        op['i64.const'], encodeULEB128(j * 0x10),
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        ...instructions,
        op['i32.const'], ...U16_MAX,
        op['i32.and'],
        op['i64.extend_i32_u'],
        op['i64.const'], encodeULEB128(j * 0x10),
        op['i64.shl'],
        op['i64.or'],
      ]));
    }
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    op['i64.const'], 0,
    ...buf[0], ...buf[1], ...buf[2], ...buf[3],

    op['i64.const'], 0,
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],
  ]);
}

export const i16x8Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.add',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([op['i32.add']], localIndices)
  ),
};

export const i16x8AddSaturateU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.add_saturate_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
      op['i32.add'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...U16_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...U16_MAX,
      op['i32.le_u'],
      op['select'],
    ], localIndices)
  ),
};

export const i16x8AddSaturateS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.add_saturate_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
      op['local.set'], ...localIndices[4],
      op['i32.extend16_s'],
      op['local.get'], ...localIndices[4],
      op['i32.extend16_s'],
      op['i32.add'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...S16_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...S16_MAX,
      op['i32.le_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i16x8Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([op['i32.sub']], localIndices)
  ),
};

export const i16x8SubSaturateU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.sub_saturate_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
      op['i32.sub'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], 0x00,
      op['local.get'], ...localIndices[4],
      op['i32.const'], 0x00,
      op['i32.ge_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i16x8SubSaturateS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.sub_saturate_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
      op['local.set'], ...localIndices[4],
      op['i32.extend16_s'],
      op['local.get'], ...localIndices[4],
      op['i32.extend16_s'],
      op['i32.sub'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...S16_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...S16_MAX,
      op['i32.le_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i16x8Mul: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.mul',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([op['i32.mul']], localIndices)
  ),
};

export const i16x8Neg: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], ...MINUS_ONE,
      op['i64.const'], ...MINUS_ONE,
      ...i16x8Op([op['i32.mul']], localIndices),
    ])
  ),
};

export const i16x8Abs: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i16x8.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], 0x00,
      op['i64.const'], 0x00,
      ...i16x8Op([
        op['drop'],
        op['i32.extend16_s'],
        op['local.tee'], ...localIndices[4],
        op['i32.const'], 0x0f,
        op['i32.shr_s'],
        op['local.get'], ...localIndices[4],
        op['i32.xor'],
        op['local.get'], ...localIndices[4],
        op['i32.const'], 0x0f,
        op['i32.shr_s'],
        op['i32.sub'],
      ], localIndices),
    ])
  ),
};

export const i16x8AvgrU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i16x8.avgr_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i16x8Op([
      op['i32.add'],
      op['i32.const'], 0x01,
      op['i32.add'],
      op['i32.const'], 0x01,
      op['i32.shr_u'],
    ], localIndices)
  ),
};

function i8x16Op(instructions: number[], localIndices: Uint8Array[]): Uint8Array {
  const buf = [];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 8; j++) {
      buf.push(new Uint8Array([
        op['local.get'], ...localIndices[i],
        op['i64.const'], encodeULEB128(j * 0x08),
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        op['local.get'], ...localIndices[i + 2],
        op['i64.const'], encodeULEB128(j * 0x08),
        op['i64.shr_u'],
        op['i32.wrap_i64'],
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        ...instructions,
        op['i32.const'], ...U8_MAX,
        op['i32.and'],
        op['i64.extend_i32_u'],
        op['i64.const'], encodeULEB128(j * 0x08),
        op['i64.shl'],
        op['i64.or'],
      ]));
    }
  }

  return new Uint8Array([
    op['local.set'], ...localIndices[3],
    op['local.set'], ...localIndices[2],
    op['local.set'], ...localIndices[1],
    op['local.set'], ...localIndices[0],

    op['i64.const'], 0,
    ...buf[0], ...buf[1], ...buf[2], ...buf[3],
    ...buf[4], ...buf[5], ...buf[6], ...buf[7],

    op['i64.const'], 0,
    ...buf[8], ...buf[9], ...buf[10], ...buf[11],
    ...buf[12], ...buf[13], ...buf[14], ...buf[15],
  ]);
}

export const i8x16Add: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.add',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([op['i32.add']], localIndices)
  ),
};

export const i8x16AddSaturateU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.add_saturate_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['i32.add'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...U8_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...U8_MAX,
      op['i32.le_u'],
      op['select'],
    ], localIndices)
  ),
};

export const i8x16AddSaturateS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.add_saturate_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['local.set'], ...localIndices[4],
      op['i32.extend8_s'],
      op['local.get'], ...localIndices[4],
      op['i32.extend8_s'],
      op['i32.add'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...S8_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...S8_MAX,
      op['i32.le_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i8x16Sub: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.sub',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([op['i32.sub']], localIndices)
  ),
};

export const i8x16SubSaturateU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.sub_saturate_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['i32.sub'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], 0x00,
      op['local.get'], ...localIndices[4],
      op['i32.const'], 0x00,
      op['i32.ge_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i8x16SubSaturateS: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.sub_saturate_s',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['local.set'], ...localIndices[4],
      op['i32.extend8_s'],
      op['local.get'], ...localIndices[4],
      op['i32.extend8_s'],
      op['i32.sub'],
      op['local.tee'], ...localIndices[4],
      op['i32.const'], ...S8_MAX,
      op['local.get'], ...localIndices[4],
      op['i32.const'], ...S8_MAX,
      op['i32.le_s'],
      op['select'],
    ], localIndices)
  ),
};

export const i8x16AvgrU: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.avgr_u',
  replacer: (instruction, fnIndex, localIndices) => (
    i8x16Op([
      op['i32.add'],
      op['i32.const'], 0x01,
      op['i32.add'],
      op['i32.const'], 0x01,
      op['i32.shr_u'],
    ], localIndices)
  ),
};

export const i8x16Neg: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64'],
  match: (instruction) => instruction.name === 'i8x16.neg',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], ...MINUS_ONE,
      op['i64.const'], ...MINUS_ONE,
      ...i8x16Op([op['i32.mul']], localIndices),
    ])
  ),
};

export const i8x16Abs: IPolyfill = {
  locals: ['i64', 'i64', 'i64', 'i64', 'i32'],
  match: (instruction) => instruction.name === 'i8x16.abs',
  replacer: (instruction, fnIndex, localIndices) => (
    new Uint8Array([
      op['i64.const'], 0x00,
      op['i64.const'], 0x00,
      ...i8x16Op([
        op['drop'],
        op['i32.extend8_s'],
        op['local.tee'], ...localIndices[4],
        op['i32.const'], 0x07,
        op['i32.shr_s'],
        op['local.get'], ...localIndices[4],
        op['i32.xor'],
        op['local.get'], ...localIndices[4],
        op['i32.const'], 0x07,
        op['i32.shr_s'],
        op['i32.sub'],
      ], localIndices),
    ])
  ),
};
