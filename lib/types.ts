import * as leb from '@thi.ng/leb128';

export interface IType {
  input: string;
  output: string;
}

function getValueType(x) {
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

  throw new Error(`Invalid value type ${x}`);
}

export function getTypes(data, pos): IType[] {
  const types = [];

  const [numberOfTypes, lengthBytes] = leb.decodeULEB128(data, pos);
  pos += lengthBytes;

  for (let i = 0; i < numberOfTypes; i++) {
    const funcTypePrefix = data[pos++];
    if (funcTypePrefix !== 0x60) {
      throw new Error('Malformed WASM file - invalid function type prefix');
    }

    const [numberOfInputTypes, numberOfInputTypesLength] = leb.decodeULEB128(data, pos);
    pos += numberOfInputTypesLength;

    const inputTypes = [];
    for (let j = 0; j < numberOfInputTypes; j++) {
      const valueType = getValueType(data[pos++]);
      inputTypes.push(valueType);
    }

    const [numberOfOutputTypes, numberOfOutputTypesLength] = leb.decodeULEB128(data, pos);
    pos += numberOfOutputTypesLength;

    const outputTypes = [];
    for (let j = 0; j < numberOfOutputTypes; j++) {
      const valueType = getValueType(data[pos++]);
      outputTypes.push(valueType);
    }

    types.push({
      input: inputTypes.join(' '),
      output: outputTypes.join(' '),
    });
  }

  return types;
}
