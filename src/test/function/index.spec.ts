import { describe } from '@jest/globals';
import TypeScriptCodeGenerator, { IFunctionOptions } from '@/service/code-generator/typescript';

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
    expect(tsCodeGenerator.generateFunction(data)).toStrictEqual([
      'function testF(a1, a2, a3) {',
      'console.log(123)',
      '}'
    ]);
  });
  // test('generate object string arr: ', () => {
  //   const data = {
  //     a: 1,
  //     b: '2',
  //     c: [10, '33', true],
  //     d: {
  //       test: 'hello world',
  //       arr: [{ id: 1 }, { id: 2 }, { id: 3 }]
  //     }
  //   };
  //   expect(tsCodeGenerator.generateObjectStrArr(data)).toStrictEqual([
  //     '{',
  //     'a: 1',
  //     'b: 2',
  //     '}'
  //   ]);
  // });
});
