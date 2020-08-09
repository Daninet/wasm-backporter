import * as leb from '@thi.ng/leb128';
import { longOpCodes, opcodes } from '../opcodes';
import { BaseSection } from './base';

export interface IInstruction {
  name: string;
  pos: number;
  length: number;
  params: number[];
}

export type IInstructionReplacer = (instruction: IInstruction) => Uint8Array;
export type IInstructionReplacerWithFunction =
  (instruction: IInstruction, fn: Uint8Array) => Uint8Array;

export interface IModification {
  replacement: Uint8Array;
  pos: number;
  previousLength: number;
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

  private instructionReplacer: Function = null;

  private modifications: IModification[] = [];

  private instructions: IInstruction[] = [];

  constructor(dataWithoutSegmentSize: Buffer) {
    super();
    this.buf = dataWithoutSegmentSize;
    // console.log('buf', this.buf);

    this.readFunction();
    this.readInstructions();
  }

  private readFunction() {
    let pos = 0;

    const [localsGroupNumber, localsGroupNumberBytes] = leb.decodeULEB128(this.buf, pos);
    pos += localsGroupNumberBytes;
    // console.log('localsGroupNumber', localsGroupNumber);
    for (let i = 0; i < localsGroupNumber; i++) {
      const [localsCount, localsCountBytes] = leb.decodeULEB128(this.buf, pos);
      pos += localsCountBytes;
      const localType = this.buf[pos++];
      // console.log('localsCount', localsCount, localType);

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
        pos: instructionPosition - this.bodyStart, // relative to start
        length: pos - instructionPosition, // including all params
        params: action.params,
      });
    }
  }

  private getModifications() {
    for (let j = 0; j < this.instructions.length; j++) {
      const instruction = this.instructions[j];
      const replacement = this.instructionReplacer(instruction);
      if (replacement !== null) {
        this.modifications.push({
          replacement,
          pos: instruction.pos,
          previousLength: instruction.length,
        });
      }
    }
  }

  private getModifiedInstructions(): Buffer[] {
    const buf = this.buf.slice(this.bodyStart);
    if (this.modifications.length === 0) {
      return [buf];
    }

    const chunks: Buffer[] = [];

    let lastWrittenPos = -1;

    this.modifications.forEach((modification) => {
      chunks.push(
        buf.slice(lastWrittenPos + 1, modification.pos),
        Buffer.from(modification.replacement),
      );
      lastWrittenPos = modification.pos + modification.previousLength - 1;
    });

    if (lastWrittenPos < buf.length - 1) {
      chunks.push(buf.slice(lastWrittenPos + 1, buf.length));
    }

    return chunks;
  }

  setInstructionReplacer(replacer: IInstructionReplacer): void {
    this.instructionReplacer = replacer;
  }

  export(): Buffer[] {
    this.getModifications();

    const output = [
      Buffer.from([]),
      this.buf.slice(0, this.bodyStart), // locals
      ...this.getModifiedInstructions(),
    ];

    const segmentLength = output.reduce((prev, curr) => prev + curr.length, 0);
    output[0] = Buffer.from(leb.encodeULEB128(segmentLength));

    return output;
  }
}
