import * as leb from '@thi.ng/leb128';
import { BaseSection } from './base';
import { CodeFunction, IInstructionReplacer } from './codeFunction';

export class CodeSection extends BaseSection {
  private functions: CodeFunction[] = [];

  constructor(dataWithoutSegmentSize: Buffer) {
    super();
    this.readSection(dataWithoutSegmentSize);
  }

  private readSection(buf) {
    let pos = 0;

    const [numberOfFunctions, lengthBytes] = leb.decodeULEB128(buf, pos);
    pos += lengthBytes;
    // console.log('numberOfFunctions', numberOfFunctions);

    for (let i = 0; i < numberOfFunctions; i++) {
      const [functionLength, functionLengthBytes] = leb.decodeULEB128(buf, pos);
      // console.log('functionLength', functionLength);
      pos += functionLengthBytes;

      this.functions.push(new CodeFunction(buf.slice(pos, pos + functionLength)));
      pos += functionLength;
    }
  }

  // body includes local vector + opcodes
  add(fnBody: Uint8Array): void {
    this.functions.push(new CodeFunction(Buffer.from(fnBody)));
  }

  setInstructionReplacer(replacer: IInstructionReplacer): void {
    this.functions.forEach((fn) => fn.setInstructionReplacer(replacer));
  }

  export(): Buffer[] {
    const output = [
      Buffer.from([0x0a]), // section id
      Buffer.from([]),
      Buffer.from(leb.encodeULEB128(this.functions.length)),
    ];

    for (let i = 0; i < this.functions.length; i++) {
      output.push(...this.functions[i].export());
    }

    const segmentLength = output.reduce((prev, curr) => prev + curr.length, -1);
    output[1] = Buffer.from(leb.encodeULEB128(segmentLength));

    return output;
  }
}
