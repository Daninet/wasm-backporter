import { readOpCode } from '../opcodes';
import { decodeULEB128, encodeULEB128 } from '../leb128';
import { BaseSection } from './base';

export interface IGlobal {
  mutable: boolean;
  type: string;
  instructions?: Uint8Array;
}

const valueTypes = {
  0x7f: 'i32',
  0x7e: 'i64',
  0x7d: 'f32',
  0x7c: 'f64',
};

const mutableTypes = {
  0x00: false,
  0x01: true,
};

const reverseValueTypes = {
  i32: 0x7f,
  i64: 0x7e,
  f32: 0x7d,
  f64: 0x7c,
};

function getValueType(x: number): string {
  if (!valueTypes[x]) {
    throw new Error(`Invalid value type ${x}`);
  }
  return valueTypes[x];
}

function getValueCode(x: string): number {
  if (!reverseValueTypes[x]) {
    throw new Error(`Invalid value code ${x}`);
  }
  return reverseValueTypes[x];
}

export class GlobalSection extends BaseSection {
  private buf: Buffer = null;

  private newChunks: Buffer[] = [];

  private originalGlobalsCount: number = 0;

  private newGlobals: IGlobal[] = [];

  constructor(dataWithoutSegmentSize: Buffer) {
    super();
    this.buf = dataWithoutSegmentSize;

    this.readGlobals();
  }

  private readGlobals() {
    const [numberOfGlobals, lengthBytes] = decodeULEB128(this.buf, 0);
    this.originalGlobalsCount = numberOfGlobals;

    // DO NOT DELETE YET - needed if there are special instructions in initializer

    // for (let i = 0; i < numberOfGlobals; i++) {
    //   const type = getValueType(this.buf[pos++]);

    //   const mutable = this.buf[pos++];
    //   if (mutable > 0x01) {
    //     throw new Error('Malformed WASM file - invalid global mutability');
    //   }

    //   this.globals.push({
    //     mutable: mutable === 0x01,
    //     type,
    //   });

    //   pos = this.readExpression(pos);
    // }

    // console.log('globals', this.globals);
    // trim numberOfTypes
    this.buf = this.buf.slice(lengthBytes);
  }

  // DO NOT DELETE YET - needed if there are special instructions in initializer

  // optional function (debug mode)
  // private readExpression(pos) {
  //   let level = 1;

  //   const instructions = [];

  //   do {
  //     const opCode = readOpCode(this.buf, pos);
  //     switch (opCode.name) {
  //       case 'end':
  //         level--;
  //         break;
  //       case 'block':
  //       case 'loop':
  //       case 'if':
  //         level++;
  //         break;
  //     }
  //     pos = opCode.nextPos;
  //     instructions.push(opCode);
  //   } while (level > 0);

  //   this.globals[this.globals.length - 1].instructions = instructions;
  //   return pos;
  // }

  add(global: IGlobal): number {
    this.newGlobals.push(global);
    this.newChunks.push(
      Buffer.from([
        getValueCode(global.type),
        global.mutable ? 0x01 : 0x00,
      ]),
      Buffer.from(global.instructions),
    );
    return this.newGlobals.length - 1;
  }

  export(): Buffer[] {
    const output = [
      Buffer.from([0x06]), // section id
      Buffer.from([]),
      Buffer.from(encodeULEB128(this.originalGlobalsCount + this.newGlobals.length)),
      this.buf,
      ...this.newChunks,
    ];

    const segmentLength = output.reduce((prev, curr) => prev + curr.length, -1);
    output[1] = Buffer.from(encodeULEB128(segmentLength));

    return output;
  }
}
