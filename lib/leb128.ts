/* eslint-disable no-constant-condition */
/* eslint-disable no-bitwise */
export function decodeLengthULEB128(buf: Buffer, offset: number): number {
  let d = 0;
  while (true) {
    const val = buf[offset + d];
    if ((val & 128) === 0) break;
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
    result += (val & 127) * mul;
    mul *= 128;
    if ((val & 128) === 0) break;
    d++;
  }
  return [result, d + 1];
}

const encodeBuf = new Uint8Array(10);
export function encodeULEB128(number: number): Uint8Array {
  let lower4 = number & 0xFFFFFFF; // last 28 bits
  let high4 = (number / 0x10000000) >> 0; // first 28 bits

  let steps = 0;
  do {
    let byte = lower4 & 127;
    lower4 >>= 7;
    if (lower4 !== 0 || high4 !== 0) {
      byte |= 128;
    }
    encodeBuf[steps++] = byte;
  } while (lower4 > 0);

  while (high4 !== 0) {
    let byte = high4 & 127;
    high4 >>= 7;
    if (high4 !== 0) {
      byte |= 128;
    }
    encodeBuf[steps++] = byte;
  }

  return encodeBuf.slice(0, steps);
}
