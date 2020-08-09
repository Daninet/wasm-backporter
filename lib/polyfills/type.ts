import { IInstructionReplacerWithFunction } from '../sections/codeFunction';
import { IType } from '../sections/type';

export interface IFunctionBody {
  type: IType;
  body: Uint8Array; // includes local vector + opcodes
}

export interface IPolyfill {
  function: IFunctionBody;
  replacer: IInstructionReplacerWithFunction;
}
