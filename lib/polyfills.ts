/* eslint-disable dot-notation */
// import * as leb from '@thi.ng/leb128';
import { reverseOpCodes } from './opcodes';
import { IType } from './types';

// console.log('cx', Buffer.from(leb.encodeULEB128(1024)));
// console.log('dx', leb.decodeULEB128(Buffer.from([0x80, 0x08, 0x80, 0x80, 0x00])));
const op = reverseOpCodes;

export interface IPolyfill {
  type: IType;
  body: Uint8Array;
}

export const memoryFill: IPolyfill = {
  type: { input: 'i32 i32 i32', output: '' },
  body: new Uint8Array([
    op['block'], 0x40,
    op['local.get'], 0x02,
    op['i32.const'], 0x01,
    op['i32.lt_s'],
    op['br_if'], 0x00,
    op['local.get'], 0x00,
    op['i32.const'], 0x80, 0x88, 0x80, 0x80, 0x00,
    op['i32.add'],
    op['local.get'], 0x01,
    op['i32.store8'], 0x00, 0x00,
    op['end'],
    op['end'],
  ]),
};
