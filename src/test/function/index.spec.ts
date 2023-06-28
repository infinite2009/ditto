import { describe } from '@jest/globals';
import TypeScriptCodeGenerator, { IFunctionOptions } from '@/service/code-generator/typescript';

describe('function test', () => {
  test('generate simple function definition', () => {
    const tsCodeGenerator = new TypeScriptCodeGenerator();
    const data = {
      functionName: 'testF',
      functionParams: ['a1', 'a2', 'a3'],
      useArrow: false,
      bodyGeneratorParams: [123],
      bodyGenerator: (...args: any[]) => { const [a1] = args; return [`console.log(${a1})`]; }
    } as unknown as IFunctionOptions;
    expect(tsCodeGenerator.generateFunction(data)).toStrictEqual([
      'function testF(a1, a2, a3) {',
      'console.log(123)',
      '}'
    ])
  });
});
