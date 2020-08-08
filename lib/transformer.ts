import * as leb from '@thi.ng/leb128';
import { getFunctions } from './functions';
import { getInstructions } from './instructions';
import { getSections } from './sections';

export function disassemble(binary: Uint8Array) {
  const sections = getSections(binary);
  const codeSection = sections.find((section) => section.type === 'code');
  const functions = getFunctions(binary, codeSection.start);

  return {
    sections,
    codeSection,
    functions,
  };
}

export function getModifications(
  binary: Uint8Array, disassembly: ReturnType<typeof disassemble>, getReplacement,
) {
  const modifications = [];

  const numberOfFunctions = disassembly.functions.length;
  for (let i = 0; i < numberOfFunctions; i++) {
    const fn = disassembly.functions[i];
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

export function reassemble(
  binary: Uint8Array, disassembly: ReturnType<typeof disassemble>,
  modifications: ReturnType<typeof getModifications>,
) {
  let newSectionLength = disassembly.codeSection.length;
  const chunks = [
    binary.slice(0, disassembly.codeSection.sectionLengthPos),
    null, // code section length
    binary.slice(disassembly.codeSection.start, disassembly.functions[0].functionLengthPos),
  ];

  for (let i = 0; i < disassembly.functions.length; i++) {
    const f = disassembly.functions[i];

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

  chunks.push(
    binary.slice(disassembly.codeSection.end + 1, binary.length),
  );

  chunks[1] = Buffer.from(leb.encodeULEB128(newSectionLength));

  const buf = Buffer.concat(chunks);
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
}
