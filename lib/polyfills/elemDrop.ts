/* eslint-disable indent */
/* eslint-disable dot-notation */
import type { IPolyfill } from './type';

export const elemDrop: IPolyfill = {
  function: null,
  replacer: (instruction) => {
    if (instruction.name === 'elem.drop') {
      return new Uint8Array([]);
    }
    return null;
  },
};
