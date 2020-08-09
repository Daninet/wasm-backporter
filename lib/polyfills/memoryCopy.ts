/* eslint-disable indent */
/* eslint-disable dot-notation */
import { reverseOpCodes } from '../opcodes';
import type { IFunctionBody, IPolyfill } from './type';

const op = reverseOpCodes;

const polyfill: IFunctionBody = {
  type: { input: 'i32 i32 i32', output: '' },
  body: new Uint8Array([
    0x00, // zero local groups
    op['block'], 0x40,
      op['local.get'], 0x02,
      op['i32.eqz'],
      op['br_if'], 0x00,
      op['loop'], 0x40,
        op['local.get'], 0x02,
        op['i32.const'], 0x01,
        op['i32.sub'],
        op['local.tee'], 0x02,
        op['local.get'], 0x00,
        op['i32.add'],
        op['local.get'], 0x01,
        op['i32.store8'], 0x00, 0x00,
        op['local.get'], 0x02,
        op['i32.eqz'],
        op['br_if'], 0x01,
        op['br'], 0x00,
      op['end'],
    op['end'],
    op['end'],
  ]),
};

export const memoryCopy: IPolyfill = {
  function: polyfill,
  replacer: (instruction, funcIndex) => {
    if (instruction.name === 'memory.copy') {
      const fnIndexArr = Array.from(funcIndex);
      return new Uint8Array([
        op['call'], ...fnIndexArr,
      ]);
    }
    return null;
  },
};
