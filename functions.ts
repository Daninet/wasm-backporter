import * as leb from "@thi.ng/leb128";

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

export function getFunctions(data, pos) {
  const functions = [];

  let [numberOfFunctions, lengthBytes] = leb.decodeULEB128(data, pos);
  pos += lengthBytes;

  for (let i = 0; i < numberOfFunctions; i++) {
    const functionLengthPos = pos;
    let functionLength;
    [functionLength, lengthBytes] = leb.decodeULEB128(data, pos);
    pos += lengthBytes;
    
    const localsStart = pos;
    const locals = [];
    let localGroupsNumber;
    [localGroupsNumber, lengthBytes] = leb.decodeULEB128(data, pos);
    pos += lengthBytes;

    for (let j = 0; j < localGroupsNumber; j++) {
      let localsNumber;
      [localsNumber, lengthBytes] = leb.decodeULEB128(data, pos);
      pos += lengthBytes;

      if (localsNumber > 0) {
        const localType = data[pos++];
        for (let k = 0; k < localsNumber; k++) {
          locals.push(getLocalType(localType));
        }
      }
    }
    
    const localsLength = pos - localsStart;
    const bodyEnd = pos + functionLength - localsLength - 1;

    functions.push({
      functionLengthPos,
      bodyStart: pos, // body - inclusive
      bodyEnd: bodyEnd, // body - inclusive
      locals,
    });

    pos = bodyEnd + 1;
  }

  return functions;
}
