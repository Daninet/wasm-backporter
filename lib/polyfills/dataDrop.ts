/* eslint-disable indent */
/* eslint-disable dot-notation */
import type { IPolyfill } from './type';

export const dataDrop: IPolyfill = {
  function: null,
  replacer: (instruction) => {
    if (instruction.name === 'data.drop') {
      return new Uint8Array([]);
    }
    return null;
  },
};
