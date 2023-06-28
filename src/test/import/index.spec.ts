import { describe, expect, test } from '@jest/globals';
import TypeScriptCodeGenerator, { IImportOptions } from '@/service/code-generator/typescript';

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
