/* eslint-disable indent */
/* eslint-disable dot-notation */
// import * as leb from '@thi.ng/leb128';
import { reverseOpCodes } from './opcodes';
import { IInstructionReplacerWithFunction } from './sections/codeFunction';
import { IType } from './sections/type';

// console.log('cx', Buffer.from(leb.encodeULEB128(1024)));
// console.log('dx', leb.decodeULEB128(Buffer.from([0x80, 0x08, 0x80, 0x80, 0x00])));
const op = reverseOpCodes;

export interface IFunctionBody {
  type: IType;
  body: Uint8Array; // includes local vector + opcodes
}

const memoryFillPolyfill: IFunctionBody = {
  type: { input: 'i32 i32 i32', output: '' },
  body: new Uint8Array([
    0x00, // zero local groups
    op['block'], 0x40,
      op['local.get'], 0x02,
      op['i32.eqz'],
      op['br_if'], 0x00,
      op['local.get'], 0x02,
      op['i32.const'], 0x01,
      op['i32.sub'],
      op['local.set'], 0x02,
      op['loop'], 0x40,
        op['local.get'], 0x02,
        op['local.get'], 0x01,
        op['i32.store8'], 0x00, 0x00,
        op['local.get'], 0x02,
        op['i32.const'], 0x7f,
        op['i32.add'],
        op['local.tee'], 0x02,
        op['i32.const'], 0x7f,
        op['i32.gt_s'],
        op['br_if'], 0x00,
      op['end'],
    op['end'],
    op['end'],
  ]),
};

export interface IPolyfill {
  function: IFunctionBody;
  replacer: IInstructionReplacerWithFunction;
}

export const memoryFill: IPolyfill = {
  function: memoryFillPolyfill,
  replacer: (instruction, funcIndex) => {
    if (instruction.name === 'memory.fill') {
      const fnIndexArr = Array.from(funcIndex);
      console.log('filling');
      return new Uint8Array([
        op['call'], ...fnIndexArr,
      ]);
    }
    return null;
  },
};
