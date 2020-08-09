import * as leb from '@thi.ng/leb128';
import { longOpCodes, opcodes } from '../opcodes';
import { BaseSection } from './base';

export interface IInstruction {
  name: string;
  pos: number;
  length: number;
  params: number[];
}

function getLocalType(x) {
  switch (x) {
    case 0x7f:
      return 'i32';
    case 0x7e:
      return 'i64';
    case 0x7d:
      return 'f32';
    case 0x7c:
      return 'f64';
  }

  throw new Error(`Invalid local type ${x}`);
}

export class CodeFunction extends BaseSection {
  private buf = null;

  // private typeIndex: number = -1;

  private locals: string[] = [];

  private bodyStart: number = -1;

  private signatures: number[] = [];

  private instructions: IInstruction[] = [];

  constructor(dataWithoutSegmentSize: Buffer) {
    super();
    this.buf = dataWithoutSegmentSize;

    this.readFunction();
    this.readInstructions();
  }

  private readFunction() {
    let pos = 0;

    const [localsGroupNumber, localsGroupNumberBytes] = leb.decodeULEB128(this.buf, pos);
    pos += localsGroupNumberBytes;
    for (let i = 0; i < localsGroupNumber; i++) {
      const [localsCount, localsCountBytes] = leb.decodeULEB128(this.buf, pos);
      pos += localsCountBytes;
      const localType = this.buf[pos++];

      for (let k = 0; k < localsCount; k++) {
        this.locals.push(getLocalType(localType));
      }
    }

    this.bodyStart = pos;
  }

  private readInstructions() {
    let pos = this.bodyStart;

    while (pos < this.buf.length) {
      const instructionPosition = pos;
      const opcode = this.buf[pos++];
      let opcodeData = opcodes[opcode];
      if (!opcodeData) {
        // read extra byte
        const opcode2 = this.buf[pos++];
        opcodeData = longOpCodes[opcode * 256 + opcode2];
        if (!opcodeData) {
          // rewind
          pos--;
          throw new Error(`Invalid opcode 0x${opcode.toString(16)} at ${pos - 1}`);
        }
      }

      const action = opcodeData.getParamsAndPosition(pos, this.buf);
      pos = action.pos;

      this.instructions.push({
        name: opcodeData.name,
        pos: instructionPosition,
        length: pos - instructionPosition, // including all params
        params: action.params,
      });
    }
  }

  export(): Buffer[] {
    const output = [
      Buffer.from([]),
      this.buf.slice(0, this.bodyStart),
      this.buf.slice(this.bodyStart), // modified instructions
    ];

    const segmentLength = output.reduce((prev, curr) => prev + curr.length, 0);
    output[0] = Buffer.from(leb.encodeULEB128(segmentLength));

    return output;
  }
}
