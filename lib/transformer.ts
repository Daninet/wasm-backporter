import * as leb from '@thi.ng/leb128';
import { getFunctionBodies, getFunctionSignatures } from './functions';
import { getInstructions } from './instructions';
import { IPolyfill } from './polyfills';
import { getSections } from './sections';
import { getTypes, IType } from './types';

export function disassemble(binary: Uint8Array) {
  const sections = getSections(binary);

  const typeSection = sections.find((section) => section.type === 'type');
  const types = getTypes(binary, typeSection.start);

  const functionSection = sections.find((section) => section.type === 'function');
  const functionSignatures = getFunctionSignatures(binary, functionSection.start);

  const codeSection = sections.find((section) => section.type === 'code');
  const functionBodies = getFunctionBodies(binary, codeSection.start);

  return {
    sections,
    typeSection,
    functionSection,
    codeSection,
    functionBodies,
    functionSignatures,
    types,
  };
}

export function getModifications(
  binary: Uint8Array, disassembly: ReturnType<typeof disassemble>, getReplacement,
) {
  const modifications = [];

  const numberOfFunctions = disassembly.functionBodies.length;
  for (let i = 0; i < numberOfFunctions; i++) {
    const fn = disassembly.functionBodies[i];
    const instructions = getInstructions(binary, fn.bodyStart, fn.bodyEnd);

    for (let j = 0; j < instructions.length; j++) {
      const instruction = instructions[j];
      const replacement = getReplacement(fn, instruction);
      if (replacement !== null) {
        modifications.push({
          replacement,
          functionLengthPos: fn.functionLengthPos,
          functionBodyStart: fn.bodyStart,
          functionBodyEnd: fn.bodyEnd,
          pos: instruction.pos,
          previousLength: instruction.length,
        });
      }
    }
  }

  return modifications;
}

function getFunctionChunks(binary: Uint8Array, modifications: ReturnType<typeof getModifications>) {
  const { functionLengthPos } = modifications[0];
  const [prevFunctionLength, prevFunctionLengthSize] = leb.decodeULEB128(binary, functionLengthPos);

  let functionLength = prevFunctionLength;
  const functionChunks = [
    null, // functionLength
    binary.slice( // between function length and body (locals)
      functionLengthPos + prevFunctionLengthSize,
      modifications[0].functionBodyStart,
    ),
  ];

  let lastWrittenPos = modifications[0].functionBodyStart - 1;

  modifications.forEach((modification) => {
    functionLength += modification.replacement.length - modification.previousLength;
    functionChunks.push(binary.slice(lastWrittenPos + 1, modification.pos));
    functionChunks.push(modification.replacement);
    lastWrittenPos = modification.pos + modification.previousLength - 1;
  });

  if (lastWrittenPos < modifications[0].functionBodyEnd) {
    functionChunks.push(binary.slice(lastWrittenPos + 1, modifications[0].functionBodyEnd + 1));
  }

  functionChunks[0] = Buffer.from(leb.encodeULEB128(functionLength));
  return functionChunks;
}

function getValueTypeCode(x: string) {
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

  throw new Error(`Invalid value type ${x}`);
}

function encodeTypeString(str: string): Buffer {
  const chunks = [];
  const parts = str.split(' ');
  const length = Buffer.from(leb.encodeULEB128(parts.length));
  parts.forEach((part) => {
    chunks.push(getValueTypeCode(part));
  });
  return Buffer.concat([length, Buffer.from(chunks)]);
}

function generateNewTypes(
  disassembly: ReturnType<typeof disassemble>, newTypes: IType[],
) {
  const types = [...disassembly.types];
  const newTypeIndices: number[] = [];
  newTypes.forEach((type) => {
    const findResult = types.findIndex((t) => t.input === type.input && t.output === type.output);
    if (findResult === -1) {
      newTypeIndices.push(types.length);
      types.push(type);
    } else {
      newTypeIndices.push(findResult);
    }
  });

  const output = [
    Buffer.from(leb.encodeULEB128(types.length)),
  ];

  types.forEach((type) => {
    output.push(encodeTypeString(type.input), encodeTypeString(type.output));
  });

  return {
    buffer: Buffer.concat(output),
    newTypeIndices,
  };
}

function generateNewFunctionSignatures(
  disassembly: ReturnType<typeof disassemble>, newSignatures: number[],
) {
  const signatures = [...disassembly.functionSignatures];
  const newSignatureIndices: number[] = [];

  newSignatures.forEach((signature) => {
    newSignatureIndices.push(signatures.length);
    signatures.push(signature);
  });

  const output = [
    Buffer.from(leb.encodeULEB128(signatures.length)),
    ...signatures.map((signature) => Buffer.from(leb.encodeULEB128(signature))),
  ];

  return {
    buffer: Buffer.concat(output),
    newSignatureIndices,
  };
}

export function reassemble(
  binary: Uint8Array, disassembly: ReturnType<typeof disassemble>,
  modifications: ReturnType<typeof getModifications>, newFunctions: IPolyfill[],
) {
  let newSectionLength = disassembly.codeSection.length;

  const newTypes = generateNewTypes(disassembly, newFunctions.map((fn) => fn.type));
  const newFnSignatures = generateNewFunctionSignatures(disassembly, newTypes.newTypeIndices);

  const chunks = [
    binary.slice(0, disassembly.typeSection.sectionLengthPos),
    newTypes.buffer,
    binary.slice(disassembly.typeSection.end + 1, disassembly.functionSection.sectionLengthPos),
    newFnSignatures.buffer,
    binary.slice(disassembly.functionSection.end + 1, disassembly.codeSection.sectionLengthPos),
    null, // code section length
    binary.slice(disassembly.codeSection.start, disassembly.functionBodies[0].functionLengthPos),
  ];

  for (let i = 0; i < disassembly.functionBodies.length; i++) {
    const f = disassembly.functionBodies[i];

    const fm = modifications.filter((m) => m.functionLengthPos === f.functionLengthPos);

    if (fm.length === 0) {
      // can copy the whole function
      chunks.push(binary.slice(f.functionLengthPos, f.bodyEnd + 1));
    } else {
      const oldFunctionLength = fm[0].functionBodyEnd - fm[0].functionLengthPos + 1;
      const newFunctionChunks = getFunctionChunks(binary, fm);

      const newFunctionLength = newFunctionChunks
        .reduce((prev, current) => prev + current.length, 0);

      newSectionLength += newFunctionLength - oldFunctionLength;
      chunks.push(...newFunctionChunks);
    }
  }

  // add new functions
  

  chunks.push(
    binary.slice(disassembly.codeSection.end + 1, binary.length),
  );

  chunks[1] = Buffer.from(leb.encodeULEB128(newSectionLength));

  const buf = Buffer.concat(chunks);
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
}
