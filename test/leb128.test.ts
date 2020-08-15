import { decodeLengthULEB128, decodeULEB128, encodeULEB128 } from '../lib/leb128';
/* global test, expect */

describe('unsigned leb128', () => {
  it('reads ULEB128 numbers', () => {
    expect(decodeULEB128(Buffer.from([0x00]), 0)).toStrictEqual([0, 1]);
    expect(decodeULEB128(Buffer.from([0x01]), 0)).toStrictEqual([1, 1]);
    expect(decodeULEB128(Buffer.from([0x70]), 0)).toStrictEqual([0x70, 1]);
    expect(decodeULEB128(Buffer.from([0x7f]), 0)).toStrictEqual([0x7f, 1]);

    expect(decodeULEB128(Buffer.from([0x80, 0x00]), 0)).toStrictEqual([0, 2]);
    expect(decodeULEB128(Buffer.from([0x81, 0x01]), 0)).toStrictEqual([129, 2]);

    expect(decodeULEB128(Buffer.from([0x80, 0x00]), 1)).toStrictEqual([0, 1]);
    expect(decodeULEB128(Buffer.from([0x81, 0x01]), 1)).toStrictEqual([1, 1]);

    expect(decodeULEB128(Buffer.from([0x98, 0x76, 0x54, 0x32]), 0)).toStrictEqual([0x3b18, 2]);
    expect(decodeULEB128(Buffer.from([0x98, 0x76, 0x54, 0x32]), 3)).toStrictEqual([0x32, 1]);

    expect(decodeULEB128(Buffer.from([
      0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
    ]), 0)).toStrictEqual([0x7630eae7e, 5]);

    expect(decodeULEB128(Buffer.from([
      0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
    ]), 3)).toStrictEqual([0x3b18, 2]);

    expect(decodeULEB128(Buffer.from([
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0d,
    ]), 0)).toStrictEqual([0x1bffffffffffff, 8]);
  });

  it('reads length of ULEB128 numbers', () => {
    expect(decodeLengthULEB128(Buffer.from([0x00]), 0)).toBe(1);
    expect(decodeLengthULEB128(Buffer.from([0x01]), 0)).toBe(1);
    expect(decodeLengthULEB128(Buffer.from([0x70]), 0)).toBe(1);
    expect(decodeLengthULEB128(Buffer.from([0x7f]), 0)).toBe(1);

    expect(decodeLengthULEB128(Buffer.from([0x80, 0x00]), 0)).toBe(2);
    expect(decodeLengthULEB128(Buffer.from([0x81, 0x01]), 0)).toBe(2);

    expect(decodeLengthULEB128(Buffer.from([0x80, 0x00]), 1)).toBe(1);
    expect(decodeLengthULEB128(Buffer.from([0x81, 0x01]), 1)).toBe(1);

    expect(decodeLengthULEB128(Buffer.from([0x98, 0x76, 0x54, 0x32]), 0)).toBe(2);
    expect(decodeLengthULEB128(Buffer.from([0x98, 0x76, 0x54, 0x32]), 3)).toBe(1);

    expect(decodeLengthULEB128(Buffer.from([
      0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
    ]), 0)).toBe(5);

    expect(decodeLengthULEB128(Buffer.from([
      0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
    ]), 3)).toBe(2);

    expect(decodeLengthULEB128(Buffer.from([
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0d,
    ]), 0)).toBe(8);
  });

  it('encodes ULEB128 numbers', () => {
    expect(decodeULEB128(Buffer.from([0x80, 0x00]), 0)).toStrictEqual([0, 2]);
    expect(decodeULEB128(Buffer.from([0x81, 0x01]), 0)).toStrictEqual([129, 2]);

    expect(decodeULEB128(Buffer.from([0x80, 0x00]), 1)).toStrictEqual([0, 1]);
    expect(decodeULEB128(Buffer.from([0x81, 0x01]), 1)).toStrictEqual([1, 1]);

    expect(decodeULEB128(Buffer.from([0x98, 0x76, 0x54, 0x32]), 0)).toStrictEqual([0x3b18, 2]);
    expect(decodeULEB128(Buffer.from([0x98, 0x76, 0x54, 0x32]), 3)).toStrictEqual([0x32, 1]);

    expect(decodeULEB128(Buffer.from([
      0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
    ]), 0)).toStrictEqual([0x7630eae7e, 5]);

    expect(decodeULEB128(Buffer.from([
      0xfe, 0xdc, 0xba, 0x98, 0x76, 0x54, 0x32, 0x10,
    ]), 3)).toStrictEqual([0x3b18, 2]);

    expect(decodeULEB128(Buffer.from([
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0d,
    ]), 0)).toStrictEqual([0x1bffffffffffff, 8]);

    expect(encodeULEB128(0)).toStrictEqual(new Uint8Array([0]));
    expect(encodeULEB128(1)).toStrictEqual(new Uint8Array([1]));
    expect(encodeULEB128(0x70)).toStrictEqual(new Uint8Array([0x70]));
    expect(encodeULEB128(0x7f)).toStrictEqual(new Uint8Array([0x7f]));

    expect(encodeULEB128(129)).toStrictEqual(new Uint8Array([0x81, 0x01]));
    expect(encodeULEB128(0x3b18)).toStrictEqual(new Uint8Array([0x98, 0x76]));

    expect(encodeULEB128(0x7630eae7e)).toStrictEqual(
      new Uint8Array([0xfe, 0xdc, 0xba, 0x98, 0x76]),
    );

    expect(encodeULEB128(0x1bffffffffffff)).toStrictEqual(
      new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x0d]),
    );
  });
});
