import { DEBUG } from '../config';
import { decodeULEB128, encodeULEB128 } from '../leb128';
import { readOpCode } from '../opcodes';
import { BaseSection } from './base';
import { IType } from './type';

export type ILocalType = 'i32' | 'i64' | 'f32' | 'f64';

export interface IInstruction {
  name: string;
  pos: number;
  length: number;
  params: number[];
}

export interface IInstructionReplacerResult {
  getReplacement: (locals: Buffer[]) => Uint8Array;
  locals: ILocalType[];
}

export type IInstructionReplacer = (instruction: IInstruction) => IInstructionReplacerResult;

export type IInstructionReplacerWithFunction =
  (
    instruction: IInstruction, fnIndex?: Uint8Array, localIndices?: Uint8Array[]
  ) => IInstructionReplacerResult;

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

function getLocalCode(x) {
  switch (x) {
    case 'i32':
      return 0x7f;
    case 'i64':
      return 0x7e;
    case 'f32':
      return 0x7d;
    case 'f64':
      return 0x7c;
  }

  throw new Error(`Invalid local type ${x}`);
}

export class CodeFunction extends BaseSection {
  private buf = null;

  private originalLocalsGroupNumber: number = -1;

  private locals: string[] = [];

  private newLocalChunks: Buffer[] = [];

  private bodyStart: number = -1;

  private instructionReplacer: IInstructionReplacer = null;

  private modifications: IModification[] = [];

  private instructions: IInstruction[] = [];

  private type: IType = null;

  constructor(dataWithoutSegmentSize: Buffer, type: IType) {
    super();
    this.buf = dataWithoutSegmentSize;
    this.type = type;

    this.readFunction();
    this.readInstructions();
  }

  private readFunction() {
    let pos = 0;

    const [localsGroupNumber, localsGroupNumberBytes] = decodeULEB128(this.buf, pos);
    pos += localsGroupNumberBytes;

    for (let i = 0; i < localsGroupNumber; i++) {
      const [localsCount, localsCountBytes] = decodeULEB128(this.buf, pos);
      pos += localsCountBytes;
      const localType = this.buf[pos++];
      getLocalType(localType);
    }

    // trim localGroupNumber
    this.originalLocalsGroupNumber = localsGroupNumber;
    this.buf = this.buf.slice(localsGroupNumberBytes);
    this.bodyStart = pos - localsGroupNumberBytes;
  }

  private readInstructions() {
    let pos = this.bodyStart;

    while (pos < this.buf.length) {
      const opcode = readOpCode(this.buf, pos);
      pos = opcode.nextPos;

      // MVP opcodes don't need storage
      if (DEBUG || opcode.code >= 0xc0) {
        this.instructions.push({
          name: opcode.name,
          pos: opcode.pos - this.bodyStart, // relative to start
          length: pos - opcode.pos, // including all params
          params: opcode.params,
        });
      }
    }
  }

  private getModifications() {
    for (let i = 0; i < this.instructions.length; i++) {
      const instruction = this.instructions[i];
      const result = this.instructionReplacer(instruction);
      if (result) {
        const locals = result.locals?.map((local) => this.addLocal(local));
        this.modifications.push({
          replacement: result.getReplacement(locals),
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

  // TODO reuse locals
  private addLocal(localType: ILocalType): Buffer {
    const newLength = this.locals.push(localType);
    this.newLocalChunks.push(
      Buffer.from([0x01, getLocalCode(localType)]),
    );

    const index = this.type.input.length + this.originalLocalsGroupNumber + newLength - 1;
    return Buffer.from(encodeULEB128(index));
  }

  export(): Buffer[] {
    this.getModifications();

    const output = [
      Buffer.from([]),
      Buffer.from(encodeULEB128(this.originalLocalsGroupNumber + this.locals.length)),
      this.buf.slice(0, this.bodyStart), // original locals
      ...this.newLocalChunks, // new locals
      ...this.getModifiedInstructions(),
    ];

    const segmentLength = output.reduce((prev, curr) => prev + curr.length, 0);
    output[0] = Buffer.from(encodeULEB128(segmentLength));

    return output;
  }
}
