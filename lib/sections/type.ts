import { decodeULEB128, encodeULEB128 } from '../leb128';
import { BaseSection } from './base';

export interface IType {
  input: string;
  output: string;
}

const valueTypes = {
  0x7f: 'i32',
  0x7e: 'i64',
  0x7d: 'f32',
  0x7c: 'f64',
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

function encodeTypeString(str: string): Buffer {
  if (str === '') {
    return Buffer.from([0x00]);
  }
  const chunks = [];
  const parts = str.trim().split(' ');
  const length = Buffer.from(encodeULEB128(parts.length));
  parts.forEach((part) => {
    chunks.push(getValueCode(part));
  });
  return Buffer.concat([length, Buffer.from(chunks)]);
}

export class TypeSection extends BaseSection {
  private buf: Buffer = null;

  private newChunks: Buffer[] = [];

  private types: IType[] = [];

  constructor(dataWithoutSegmentSize: Buffer) {
    super();
    this.buf = dataWithoutSegmentSize;

    this.readTypes();
  }

  private readTypes() {
    let pos = 0;

    const [numberOfTypes, lengthBytes] = decodeULEB128(this.buf, pos);
    pos += lengthBytes;

    for (let i = 0; i < numberOfTypes; i++) {
      const funcTypePrefix = this.buf[pos++];
      if (funcTypePrefix !== 0x60) {
        throw new Error('Malformed WASM file - invalid function type prefix');
      }

      const [numberOfInputTypes, numberOfInputTypesLength] = decodeULEB128(this.buf, pos);
      pos += numberOfInputTypesLength;

      const inputTypes = [];
      for (let j = 0; j < numberOfInputTypes; j++) {
        const valueType = getValueType(this.buf[pos++]);
        inputTypes.push(valueType);
      }

      const [numberOfOutputTypes, numberOfOutputTypesLength] = decodeULEB128(this.buf, pos);
      pos += numberOfOutputTypesLength;

      const outputTypes = [];
      for (let j = 0; j < numberOfOutputTypes; j++) {
        const valueType = getValueType(this.buf[pos++]);
        outputTypes.push(valueType);
      }

      this.types.push({
        input: inputTypes.join(' '),
        output: outputTypes.join(' '),
      });
    }

    // console.log('types', this.types);
    // trim numberOfTypes
    this.buf = this.buf.slice(lengthBytes);
  }

  add(type: IType): number {
    const findResult = this.types
      .findIndex((t) => t.input === type.input && t.output === type.output);

    if (findResult === -1) {
      this.types.push(type);
      this.newChunks.push(
        Buffer.from([0x60]),
        encodeTypeString(type.input),
        encodeTypeString(type.output),
      );
      return this.types.length - 1;
    }

    return findResult;
  }

  getTypes(): IType[] {
    return this.types;
  }

  export(): Buffer[] {
    const output = [
      Buffer.from([0x01]), // section id
      Buffer.from([]),
      Buffer.from(encodeULEB128(this.types.length)),
      this.buf,
      ...this.newChunks,
    ];

    const segmentLength = output.reduce((prev, curr) => prev + curr.length, -1);
    output[1] = Buffer.from(encodeULEB128(segmentLength));

    return output;
  }
}
