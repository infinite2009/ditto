import { describe, expect, test } from '@jest/globals';
import TypeScriptCodeGenerator, { IFunctionOptions, IImportOptions } from '@/service/code-generator/typescript';

describe('import code generator', () => {
  test('object import', () => {
    const testCase = {
      importType: 'object',
      importNames: ['Button', 'Tab', 'Table'],
      importPath: '',
      packageName: 'antd',
      needSemicolon: ';'
    } as unknown as IImportOptions;
    const tsCodeGenerator = new TypeScriptCodeGenerator();
    expect(tsCodeGenerator.generateImportSentence(testCase)).toBe("import { Button, Tab, Table } from 'antd';");
  });

  test('default import', () => {
    const testCase = {
      importType: 'default',
      importNames: 'Component',
      importPath: '',
      packageName: 'antd',
      needSemicolon: ';'
    } as unknown as IImportOptions;
    const tsCodeGenerator = new TypeScriptCodeGenerator();
    expect(tsCodeGenerator.generateImportSentence(testCase)).toBe("import Component from 'antd';");
  });

  test('default import Button', () => {
    const testCase = {
      importType: 'default',
      importNames: 'Button',
      importPath: 'es/button',
      packageName: 'antd',
      needSemicolon: ';'
    } as unknown as IImportOptions;
    const tsCodeGenerator = new TypeScriptCodeGenerator();
    expect(tsCodeGenerator.generateImportSentence(testCase)).toBe("import Button from 'antd/es/button';");
  });

  test('object import Button and Input', () => {
    const testCase = {
      importType: 'object',
      importNames: ['Button', 'Input'],
      importPath: 'es/button',
      packageName: 'antd',
      needSemicolon: ';'
    } as unknown as IImportOptions;
    const tsCodeGenerator = new TypeScriptCodeGenerator();
    expect(tsCodeGenerator.generateImportSentence(testCase)).toBe("import { Button, Input } from 'antd/es/button';");
  });
});

describe('function test', () => {
  const tsCodeGenerator = new TypeScriptCodeGenerator();
  test('generate simple function definition', () => {
    const data = {
      functionName: 'testF',
      functionParams: ['a1', 'a2', 'a3'],
      useArrow: false,
      bodyGeneratorParams: [123],
      bodyGenerator: (...args: any[]) => {
        const [a1] = args;
        return [`console.log(${a1})`];
      }
    } as unknown as IFunctionOptions;
    expect(tsCodeGenerator.generateFunctionDefinition(data)).toStrictEqual([
      'function testF(a1, a2, a3) {',
      'console.log(123)',
      '}'
    ]);
  });
  test('generate object string arr: ', () => {
    const data = {
      a: 1,
      b: '2',
      c: [10, '33', true],
      d: {
        test: 'hello world',
        arr: [{ id: 1 }, { id: 2 }, { id: 3 }]
      }
    };
    expect(tsCodeGenerator.generateObjectStrArr(data)).toStrictEqual([
      '{',
      '  a: 1,',
      "  b: '2',",
      "  c: [",
      '    10,',
      "    '33',",
      '    true,',
      '  ],',
      '  d: {',
      "    test: 'hello world',",
      "    arr: [",
      '      {',
      '        id: 1,',
      '      },',
      '      {',
      '        id: 2,',
      '      },',
      '      {',
      '        id: 3,',
      '      },',
      '    ],',
      '  },',
      '},'
    ]);
  });
});
