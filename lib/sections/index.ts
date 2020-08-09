import * as leb from '@thi.ng/leb128';
import { CodeSection } from './code';
import { FunctionSection } from './function';
import { CopySection } from './copy';
import { TypeSection } from './type';
import { BaseSection } from './base';
import { IFunctionBody } from '../polyfills';
import { IInstruction, IInstructionReplacer, IInstructionReplacerWithFunction } from './codeFunction';

interface ISection {
  category: string;
  type: string;
  absStart: number; // including section type and length
  start: number; // without section type and length
  end: number;
}

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

// specify which sections need transformations and which can be just copied
const sectionCategory = [
  'copy',
  'type',
  'copy',
  'function',

  'copy',
  'copy',
  'copy',
  'copy',

  'copy',
  'copy',
  'code',
  'copy',
];

function readSection(data, pos): ISection {
  const absStart = pos;
  const sectionType = data[pos++];
  const [sectionLength, lengthBytes] = leb.decodeULEB128(data, pos);
  const start = pos + lengthBytes;
  return {
    category: sectionCategory[sectionType],
    type: sectionTypes[sectionType],
    absStart,
    start, // inclusive
    end: start + sectionLength - 1, // inclusive
  };
}

export function getSections(data): ISection[] {
  let pos = 8; // start after file signature
  const sections = [
    {
      category: 'copy', type: 'header', absStart: 0, start: 0, end: 7,
    },
  ];

  while (pos < data.length) {
    const section = readSection(data, pos);
    sections.push(section);
    pos = section.end + 1;
  }

  return sections;
}

export function createSections(wasm: Buffer) {
  const sections = getSections(wasm);

  const mergedSections: ISection[] = [];
  sections.forEach((section) => {
    if (mergedSections.length === 0) {
      mergedSections.push(section);
      return;
    }

    const lastItem = mergedSections[mergedSections.length - 1];
    if (section.category !== lastItem.category) {
      mergedSections.push(section);
      return;
    }

    lastItem.end = section.end;
  });

  console.log('mergedSections', mergedSections);

  const sectionHandlers: BaseSection[] = [];
  let typeSection: TypeSection = null;
  let functionSection: FunctionSection = null;
  let codeSection: CodeSection = null;
  mergedSections.forEach((section) => {
    if (section.category === 'copy') {
      sectionHandlers.push(new CopySection(wasm.slice(section.absStart, section.end + 1)));
      return;
    }

    if (section.category === 'type') {
      typeSection = new TypeSection(wasm.slice(section.start, section.end + 1));
      sectionHandlers.push(typeSection);
      return;
    }

    if (section.category === 'function') {
      functionSection = new FunctionSection(wasm.slice(section.start, section.end + 1));
      sectionHandlers.push(functionSection);
      return;
    }

    if (section.category === 'code') {
      codeSection = new CodeSection(wasm.slice(section.start, section.end + 1));
      sectionHandlers.push(codeSection);
    }
  });

  console.log('mergedSections', sectionHandlers);

  const exportHandler = () => {
    const output: Buffer[] = [];
    sectionHandlers.forEach((s) => {
      output.push(...s.export());
    });
    console.log('exports', output);
    return Buffer.concat(output);
  };

  const addFunction = (fn: IFunctionBody): Uint8Array => {
    const typeIndex = typeSection.add(fn.type);
    const funcIndex = functionSection.add(typeIndex);
    codeSection.add(fn.body);
    return leb.encodeULEB128(funcIndex);
  };

  const setInstructionReplacer =
    (replacer: IInstructionReplacerWithFunction, fnIndex: Uint8Array) => {
      codeSection.setInstructionReplacer(
        (instruction: IInstruction) => replacer(instruction, fnIndex),
      );
    };

  return {
    export: exportHandler,
    addFunction,
    setInstructionReplacer,
    handlers: sectionHandlers,
  };
}
