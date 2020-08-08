import { opcodes, longOpCodes } from './opcodes';

export function getInstructions(data, start, end) {
  const instructions = [];

  let pos = start;
  while (pos < end) {
    const instructionPosition = pos;
    const opcode = data[pos++];
    let opcodeData = opcodes[opcode];
    if (!opcodeData) {
      // read extra byte
      const opcode2 = data[pos++];
      opcodeData = longOpCodes[opcode * 256 + opcode2];
      if (!opcodeData) {
        // rewind
        pos--;
        throw new Error(`Invalid opcode 0x${opcode.toString(16)} at ${pos - 1}`);
      }
    }

    const action = opcodeData.getParamsAndPosition(pos, data);
    pos = action.pos;

    instructions.push({
      name: opcodeData.name,
      pos: instructionPosition,
      length: pos - instructionPosition, // including all params
      params: action.params,
    });
  }

  return instructions;
}
