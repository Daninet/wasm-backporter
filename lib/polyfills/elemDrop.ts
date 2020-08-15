/* eslint-disable indent */
/* eslint-disable dot-notation */
import type { IPolyfill } from './type';

export const elemDrop: IPolyfill = {
  match: (instruction) => instruction.name === 'elem.drop',
  replacer: () => new Uint8Array([]),
};
