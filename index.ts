import fs from 'fs';
import * as leb from '@thi.ng/leb128';
import { getFunctions } from './functions';
import { getInstructions } from './instructions';
import { getSections } from './sections';
const data = fs.readFileSync('./demo/argon2.wasm');
// const data = fs.readFileSync('./main/main.wasm');

const sections = getSections(data);
console.log('sections', sections);

const codeSection = sections.find(section => section.type === 'code');

const functions = getFunctions(data, codeSection.start);

const getReplacement = (func, instruction) => {
  if (instruction.params[0] === 52) {
    return Buffer.from([0x41, 0x35, 0x41, 0x36, 0x6a]);
  }
  if (instruction.name === 'i32.eq') {
    return Buffer.from([0x41, 0x35, 0x6a, 0x46]);
  }
  return null;
}

const modifications = [];

for (const func of functions) {
  console.log('Function', func);
  console.log('Instructions');
  const instructions = getInstructions(data, func.bodyStart, func.bodyEnd);
  console.log(instructions);
  for (const instruction of instructions) {
    const replacement = getReplacement(func, instruction);
    if (replacement !== null) {
      modifications.push({
        replacement,
        functionLengthPos: func.functionLengthPos,
        functionBodyStart: func.bodyStart,
        functionBodyEnd: func.bodyEnd,
        pos: instruction.pos,
        previousLength: instruction.length,
      });
    }
  }
}

// Reassembly

function getFunctionChunks(modifications) {
  const { functionLengthPos } = modifications[0];
  const [prevFunctionLength, prevFunctionLengthSize] = leb.decodeULEB128(data, functionLengthPos);

  let functionLength = prevFunctionLength;
  const functionChunks = [
    null, // functionLength
    data.slice( // between function length and body (locals)
      functionLengthPos + prevFunctionLengthSize,
      modifications[0].functionBodyStart,
    ),
  ];

  let lastWrittenPos = modifications[0].functionBodyStart - 1;

  for (const modification of modifications) {
    functionLength += modification.replacement.length - modification.previousLength;
    functionChunks.push(data.slice(lastWrittenPos + 1, modification.pos));
    functionChunks.push(modification.replacement);
    lastWrittenPos = modification.pos + modification.previousLength - 1;
  }

  if (lastWrittenPos < modifications[0].functionBodyEnd) {
    functionChunks.push(data.slice(lastWrittenPos + 1, modifications[0].functionBodyEnd + 1));
  }

  functionChunks[0] = Buffer.from(leb.encodeULEB128(functionLength));
  return functionChunks;
}

let newSectionLength = codeSection.length;
const chunks = [
  data.slice(0, codeSection.sectionLengthPos),
  null, // code section length
  data.slice(codeSection.start, functions[0].functionLengthPos),
];

for (let i = 0; i < functions.length; i++) {
  const f = functions[i];

  const fm = modifications.filter(m => m.functionLengthPos === f.functionLengthPos);

  if (fm.length === 0) {
    // can copy the whole function
    chunks.push(data.slice(f.functionLengthPos, f.bodyEnd + 1));
  } else {
    const oldFunctionLength = fm[0].functionBodyEnd - fm[0].functionLengthPos + 1;
    console.log('fm', fm, oldFunctionLength);
    const newFunctionChunks = getFunctionChunks(fm);
    const newFunctionLength = newFunctionChunks.reduce((prev, current) => prev + current.length, 0);
    newSectionLength += newFunctionLength - oldFunctionLength;
    console.log('newFunctionChunks', newFunctionChunks, newFunctionLength);
    chunks.push(...newFunctionChunks);
  }
}

chunks.push(
  data.slice(codeSection.end + 1, data.length),
);

chunks[1] = Buffer.from(leb.encodeULEB128(newSectionLength));

const output = Buffer.concat(chunks);
console.log('compare', Buffer.compare(data, output) === 0);
console.log(data);
console.log(output);

console.log('validate', WebAssembly.validate(output));
