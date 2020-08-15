import { decodeULEB128, encodeULEB128 } from '../leb128';
import { BaseSection } from './base';
import { CodeFunction, IInstructionReplacer } from './codeFunction';
import { IType } from './type';

export class CodeSection extends BaseSection {
  private functions: CodeFunction[] = [];

  private types: IType[] = null;

  constructor(dataWithoutSegmentSize: Buffer, types: IType[]) {
    super();
    this.types = types;
    this.readSection(dataWithoutSegmentSize);
  }

  private readSection(buf) {
    let pos = 0;

    const [numberOfFunctions, lengthBytes] = decodeULEB128(buf, pos);
    pos += lengthBytes;
    // console.log('numberOfFunctions', numberOfFunctions);

    for (let i = 0; i < numberOfFunctions; i++) {
      const [functionLength, functionLengthBytes] = decodeULEB128(buf, pos);
      // console.log('functionLength', functionLength);
      pos += functionLengthBytes;

      this.functions.push(
        new CodeFunction(buf.slice(pos, pos + functionLength), this.types[i]),
      );
      pos += functionLength;
    }
  }

  // body includes local vector + opcodes
  add(fnBody: Uint8Array, type: IType): void {
    this.types.push(type);
    this.functions.push(new CodeFunction(Buffer.from(fnBody), type));
  }

  setInstructionReplacer(replacer: IInstructionReplacer): void {
    this.functions.forEach((fn) => fn.setInstructionReplacer(replacer));
  }

  export(): Buffer[] {
    const output = [
      Buffer.from([0x0a]), // section id
      Buffer.from([]),
      Buffer.from(encodeULEB128(this.functions.length)),
    ];

    for (let i = 0; i < this.functions.length; i++) {
      output.push(...this.functions[i].export());
    }

    const segmentLength = output.reduce((prev, curr) => prev + curr.length, -1);
    output[1] = Buffer.from(encodeULEB128(segmentLength));

    return output;
  }
}
