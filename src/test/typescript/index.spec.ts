import { describe, expect, test } from '@jest/globals';
import TypeScriptCodeGenerator, {
  IAssignmentOptions,
  IFunctionOptions,
  IImportOptions
} from '@/service/code-generator/typescript';

describe('import code generator', () => {
  test('object import', () => {
    const testCase = {
      importType: 'object',
      importNames: ['Button', 'Tab', 'Table'],
      importPath: 'antd',
      needSemicolon: ';'
    } as unknown as IImportOptions;
    const tsCodeGenerator = new TypeScriptCodeGenerator();
    expect(tsCodeGenerator.generateImportSentence(testCase)).toBe("import { Button, Tab, Table } from 'antd';");
  });

  test('default import', () => {
    const testCase = {
      importType: 'default',
      importNames: 'Component',
      importPath: 'antd',
      needSemicolon: ';'
    } as unknown as IImportOptions;
    const tsCodeGenerator = new TypeScriptCodeGenerator();
    expect(tsCodeGenerator.generateImportSentence(testCase)).toBe("import Component from 'antd';");
  });

  test('default import Button', () => {
    const testCase = {
      importType: 'default',
      importNames: 'Button',
      importPath: 'antd/es/button',
      needSemicolon: ';'
    } as unknown as IImportOptions;
    const tsCodeGenerator = new TypeScriptCodeGenerator();
    expect(tsCodeGenerator.generateImportSentence(testCase)).toBe("import Button from 'antd/es/button';");
  });

  test('object import Button and Input', () => {
    const testCase = {
      importType: 'object',
      importNames: ['Button', 'Input'],
      importPath: 'antd/es',
      needSemicolon: ';'
    } as unknown as IImportOptions;
    const tsCodeGenerator = new TypeScriptCodeGenerator();
    expect(tsCodeGenerator.generateImportSentence(testCase)).toBe("import { Button, Input } from 'antd/es';");
  });
});

describe('function test', () => {
  const tsCodeGenerator = new TypeScriptCodeGenerator();
  test('generate simple function definition', () => {
    const data = {
      functionName: 'testF',
      functionParams: ['a1', 'a2', 'a3'],
      useArrow: false,
      body: ['console.log(123)']
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
      'a: 1,',
      "b: '2',",
      'c: [',
      '10,',
      "'33',",
      'true,',
      '],',
      'd: {',
      "test: 'hello world',",
      'arr: [',
      '{',
      'id: 1,',
      '},',
      '{',
      'id: 2,',
      '},',
      '{',
      'id: 3,',
      '},',
      '],',
      '},',
      '},'
    ]);
  });
  test('test function call', () => {
    const opt = {
      args: ['data', 'state1', 'props1'],
      name: 'handleChanging'
    };
    expect(tsCodeGenerator.generateFunctionCall(opt)).toBe('handleChanging(data, state1, props1)');
  });

  test('test assignment', () => {
    const opt: IAssignmentOptions = {
      variableName: 'someData',
      expressions: [
        '{',
        '  a: 1,',
        "  b: '2',",
        '  c: [',
        '    10,',
        "    '33',",
        '    true,',
        '  ],',
        '  d: {',
        "    test: 'hello world',",
        '    arr: [',
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
      ]
    };
    expect(tsCodeGenerator.generateAssignment(opt)).toStrictEqual([
      'const someData = {',
      '  a: 1,',
      "  b: '2',",
      '  c: [',
      '    10,',
      "    '33',",
      '    true,',
      '  ],',
      '  d: {',
      "    test: 'hello world',",
      '    arr: [',
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

  test('should generate import path', () => {
    expect(tsCodeGenerator.calculateImportPath('antd')).toBe('antd');
  });

  test('should generate import with path', () => {
    expect(tsCodeGenerator.calculateImportPath('antd', 'es/Button')).toBe('antd/es/Button');
  });

  test('should generate import with slash path', () => {
    expect(tsCodeGenerator.calculateImportPath('antd', '/es/Button')).toBe('antd/es/Button');
  });

  test('should generate import slash', () => {
    expect(tsCodeGenerator.calculateImportPath('antd', '/')).toBe('antd');
  });
});
