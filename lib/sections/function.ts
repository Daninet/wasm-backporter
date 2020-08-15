import { decodeULEB128, encodeULEB128 } from '../leb128';
import { BaseSection } from './base';

export class FunctionSection extends BaseSection {
  private buf = null;

  private newChunks: Buffer[] = [];

  private signatures: number[] = [];

  constructor(dataWithoutSegmentSize: Buffer) {
    super();
    this.buf = dataWithoutSegmentSize;

    this.readSignatures();
  }

  private readSignatures() {
    let pos = 0;

    const [numberOfFunctions, lengthBytes] = decodeULEB128(this.buf, pos);
    pos += lengthBytes;

    for (let i = 0; i < numberOfFunctions; i++) {
      const [typeIndex, typeIndexLength] = decodeULEB128(this.buf, pos);
      pos += typeIndexLength;

      this.signatures.push(typeIndex);
    }

    // trim numberOfFunctions
    this.buf = this.buf.slice(lengthBytes);
  }

  add(typeIndex: number): number {
    this.signatures.push(typeIndex);
    this.newChunks.push(Buffer.from(encodeULEB128(typeIndex)));

    return this.signatures.length - 1;
  }

  export(): Buffer[] {
    const output = [
      Buffer.from([0x03]), // section id
      Buffer.from([]),
      Buffer.from(encodeULEB128(this.signatures.length)),
      this.buf,
      ...this.newChunks,
    ];

    const segmentLength = output.reduce((prev, curr) => prev + curr.length, -1);
    output[1] = Buffer.from(encodeULEB128(segmentLength));

    return output;
  }
}
