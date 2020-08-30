export const U8_MAX = new Uint8Array([0xFF, 0x01]);
export const S8_MAX = new Uint8Array([0xFF, 0x00]);
export const U16_MAX = new Uint8Array([0xFF, 0xFF, 0x03]);
export const S16_MAX = new Uint8Array([0xFF, 0xFF, 0x01]);
export const U32_MAX = new Uint8Array([0x7F]);
export const S32_MAX = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0x07]);
export const U64_MAX = U32_MAX;
export const MINUS_ONE = U64_MAX;

export const F32_MINUS_ONE = new Uint8Array([0x00, 0x00, 0x80, 0xBF]);
export const F64_MINUS_ONE = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0xBF]);

// ----- EXCLUDE 32 bit values -----
// 0000 0000 FFFF FFFF
export const EXCLUDE32_0 = new Uint8Array([0x80, 0x80, 0x80, 0x80, 0x70]);

// FFFF FFFF 0000 0000
export const EXCLUDE32_1 = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0x0F]);

export const EXCLUDE32 = [
  EXCLUDE32_0, EXCLUDE32_1,
];

// ----- EXCLUDE 16 bit values -----
// 0000 FFFF FFFF FFFF
export const EXCLUDE16_0 = new Uint8Array([0x80, 0x80, 0x7C]);

// FFFF 0000 FFFF FFFF
export const EXCLUDE16_1 = new Uint8Array([0xFF, 0xFF, 0x83, 0x80, 0x70]);

// FFFF FFFF 0000 FFFF
export const EXCLUDE16_2 = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0x8F, 0x80, 0x40]);

// FFFF FFFF FFFF 0000
export const EXCLUDE16_3 = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x3F]);

export const EXCLUDE16 = [
  EXCLUDE16_0, EXCLUDE16_1, EXCLUDE16_2, EXCLUDE16_3,
];

// ----- EXCLUDE 8 bit values -----
// 00FF FFFF FFFF FFFF
export const EXCLUDE8_0 = new Uint8Array([0x80, 0x7E]);

// FF00 FFFF FFFF FFFF
export const EXCLUDE8_1 = new Uint8Array([0xFF, 0x81, 0x7C]);

// FFFF 00FF FFFF FFFF
export const EXCLUDE8_2 = new Uint8Array([0xFF, 0xFF, 0x83, 0x78]);

// FFFF FF00 FFFF FFFF
export const EXCLUDE8_3 = new Uint8Array([0xFF, 0xFF, 0xFF, 0x87, 0x70]);

// FFFF FFFF 00FF FFFF
export const EXCLUDE8_4 = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0x8F, 0x60]);

// FFFF FFFF FF00 FFFF
export const EXCLUDE8_5 = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x9F, 0x40]);

// FFFF FFFF FFFF 00FF
export const EXCLUDE8_6 = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xBF, 0x80, 0x7F]);

// FFFF FFFF FFFF FF00
export const EXCLUDE8_7 = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00]);

export const EXCLUDE8 = [
  EXCLUDE8_0, EXCLUDE8_1, EXCLUDE8_2, EXCLUDE8_3,
  EXCLUDE8_4, EXCLUDE8_5, EXCLUDE8_6, EXCLUDE8_7,
];
