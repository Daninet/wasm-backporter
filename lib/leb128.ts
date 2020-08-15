/* eslint-disable no-constant-condition */
/* eslint-disable no-bitwise */
import * as leb from '@thi.ng/leb128';
enum Mask { LOWER_7 = 0b01111111, UPPER_1 = 0b10000000 }

export function decodeLengthULEB128(buf: Buffer, offset: number): number {
  let d = 0;
  while (true) {
    const val = buf[offset + d];
    if ((val & Mask.UPPER_1) === 0) break;
    d++;
  }

  return d + 1;
}

export function decodeULEB128(buf: Buffer, offset: number): [number, number] {
  let result = 0;
  let mul = 1;
  let d = 0;
  while (true) {
    const val = buf[offset + d];
    result += (val & Mask.LOWER_7) * mul;
    mul *= 128;
    if ((val & Mask.UPPER_1) === 0) break;
    d++;
  }
  return [result, d + 1];
}

const encodeBuf = new Uint8Array(8);
export function encodeULEB128(number: number): Uint8Array {
  let lower4 = number & 0xFFFFFFF; // last 28 bits
  let high4 = (number / 0x10000000) >> 0; // first 28 bits

  let steps = 0;
  do {
    let byte = lower4 & Mask.LOWER_7;
    lower4 >>= 7;
    if (lower4 !== 0 || high4 !== 0) {
      byte |= Mask.UPPER_1;
    }
    encodeBuf[steps++] = byte;
  } while (lower4 > 0);

  while (high4 !== 0) {
    let byte = high4 & Mask.LOWER_7;
    high4 >>= 7;
    if (high4 !== 0) {
      byte |= Mask.UPPER_1;
    }
    encodeBuf[steps++] = byte;
  }

  return encodeBuf.slice(0, steps);
}

console.time('xxx');
for(let i = 0; i < 10000000; i++){
  encodeULEB128(13);
  encodeULEB128(42);
  encodeULEB128(12353452533);
}
console.timeEnd('xxx');

console.time('xxx2');
for(let i = 0; i < 10000000; i++){
  leb.encodeULEB128(13);
  leb.encodeULEB128(42);
  leb.encodeULEB128(12353452533);
}
console.timeEnd('xxx2');

const buf = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFE]);
console.log(decodeULEB128(buf, 4));
console.log(leb.decodeULEB128(buf, 4));

console.log(decodeULEB128(buf, 0));
console.log(leb.decodeULEB128(buf, 0));

console.time('dec');
for(let i = 0; i < 10000000; i++){
  decodeULEB128(buf, 3);
  decodeULEB128(buf, 3);
  decodeULEB128(buf, 3);
}
console.timeEnd('dec');

console.time('dec2');
for(let i = 0; i < 10000000; i++){
  leb.decodeULEB128(buf, 3);
  leb.decodeULEB128(buf, 3);
  leb.decodeULEB128(buf, 3);
}
console.timeEnd('dec2');