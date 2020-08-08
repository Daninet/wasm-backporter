import * as leb from "@thi.ng/leb128";

const sectionTypes = [
  'custom',
  'type',
  'import',
  'function',
  'table',
  'memory',
  'global',
  'export',
  'start',
  'element',
  'code',
  'data',
];


function readSection(data, pos) {
  const sectionType = data[pos++];
  const sectionLengthPos = pos;
  const [sectionLength, lengthBytes] = leb.decodeULEB128(data, pos);
  const start = pos + lengthBytes;
  return {
    type: sectionTypes[sectionType],
    sectionLengthPos,
    start, // inclusive
    end: start + sectionLength - 1,  // inclusive
    length: sectionLength,
  };
}

export function getSections(data) {
  let pos = 8; // start after file signature
  const sections = [
    { type: 'header', sectionLengthPos: 0, start: 0, end: 7, length: 8 },
  ];

  while (pos < data.length) {
    const section = readSection(data, pos);
    sections.push(section);
    pos = section.end + 1;
  }

  return sections;
}
