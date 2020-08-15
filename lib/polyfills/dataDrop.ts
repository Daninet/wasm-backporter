/* eslint-disable indent */
/* eslint-disable dot-notation */
import { IPolyfill } from './type';

export const dataDrop: IPolyfill = {
  match: (instruction) => instruction.name === 'data.drop',
  replacer: () => new Uint8Array([]),
};
