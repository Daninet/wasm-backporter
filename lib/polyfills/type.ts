import { IInstruction, ILocalType } from '../sections/codeFunction';
import { IType } from '../sections/type';

export interface IFunctionBody {
  type: IType;
  body: Uint8Array; // includes local vector + opcodes
}

export interface IPolyfill {
  function?: IFunctionBody;
  locals?: ILocalType[];
  match: (instruction: IInstruction) => boolean;
  replacer: (
    instruction: IInstruction, fnIndex: Uint8Array, localIndices: Uint8Array[]
  ) => Uint8Array;
}
