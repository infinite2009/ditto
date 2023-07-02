import DynamicObject from '@/types/dynamic-object';
import { typeOf } from '@/util';
import { ImportType } from '@/types';

export interface IImportOptions {
  importNames?: string[];
  importPath: string;
  importType?: ImportType;
  useSemicolon?: boolean;
}

export interface IFunctionOptions {
  functionName: string;
  functionParams: string[];
  useArrow?: boolean;
  useAsync?: boolean;
  bodyGeneratorParams?: any[];
  bodyGenerator?: (...args: any[]) => string[];
}

export interface IFunctionCallOptions {
  args: string[];
  name: string;
}

export interface IAssignmentOptions {
  variableName: string;
  expressions: string[];
  useLet?: boolean;
}

export default class TypeScriptCodeGenerator {
  generateImportSentence(data: IImportOptions) {
    if (!data) {
      throw new Error('no import manifest error');
    }
    const { importType, importNames, importPath, useSemicolon = true } = data;
    if (!importPath) {
      throw new Error('no import path error');
    }

    let importPathPart = `from '${importPath}'`;

    if (useSemicolon) {
      importPathPart += ';';
    }

    switch (importType) {
      case 'object':
        // 无论是字符串还是数组，都可以被检查到
        if (!importNames?.length) {
          throw new Error('no dependencies error');
        }
        return `import { ${importNames.join(', ')} } ${importPathPart}`;
      case '*':
        return `import * as ${importNames} ${importPathPart}`;
      default:
        return `import ${importNames} ${importPathPart}`;
    }
  }

  generateFunctionDefinition(data: IFunctionOptions) {
    const {
      functionParams = [],
      functionName,
      useAsync = false,
      useArrow = false,
      bodyGeneratorParams = [],
      bodyGenerator = () => []
    } = data;
    let sentences = [];
    let signatureSentence = '';
    const functionParamsStr = functionParams.join(', ');
    if (useArrow) {
      signatureSentence = `(${functionParamsStr}) => {`;
    } else {
      if (functionName) {
        signatureSentence = `function ${functionName}(${functionParamsStr}) {`;
      } else {
        signatureSentence = `function (${functionParamsStr}) {`;
      }
    }
    if (useAsync) {
      signatureSentence = `async ${signatureSentence}`;
    }
    sentences.push(signatureSentence);
    const bodySentences = bodyGenerator(...bodyGeneratorParams);
    sentences = sentences.concat(bodySentences);

    sentences.push('}');
    return sentences;
  }

  generateFunctionCall(opt: IFunctionCallOptions): string {
    const { name, args } = opt;
    return `${name}(${args.join(', ')})`;
  }

  generateObjectStrArr(
    data: any,
    spaces = 0,
    indent = 2,
    key = '',
    useComma = true,
    sentences: string[] = []
  ): string[] {
    const type = typeOf(data);
    const spacesPrefix = ''.padStart(spaces, ' ');
    switch (type) {
      case 'object':
        sentences.push(`${spacesPrefix}${key}${key ? ': ' : ''}{`);
        Object.entries(data).forEach(([key, value]) => {
          this.generateObjectStrArr(value, spaces + indent, indent, key).forEach(item => {
            sentences.push(item);
          });
        });
        sentences.push(`${spacesPrefix}},`);
        break;
      case 'array':
        sentences.push(`${spacesPrefix}${key}${key ? ': ' : ''}[`);
        data.forEach((val: any) => {
          this.generateObjectStrArr(val, spaces + indent, indent).forEach(item => {
            sentences.push(item);
          });
        });
        sentences.push(`${spacesPrefix}],`);
        break;
      case 'string':
        sentences.push(spacesPrefix + (key ? `${key}: '${data}'` : `'${data}'`) + (useComma ? ',' : ''));
        break;
      default:
        // 这里假设变量都是驼峰命名，符合语法要求
        sentences.push(spacesPrefix + (key ? `${key}: ${data}` : data) + (useComma ? ',' : ''));
        break;
    }
    return sentences;
  }

  generateAssignment(opt: IAssignmentOptions): string[] {
    const { variableName, expressions, useLet = false } = opt;
    const cp = [...expressions];
    cp[0] = `${useLet ? 'let' : 'const'} ${variableName} = ${cp[0]}`;
    return cp;
  }

  calculateImportPath(packageName: string, importRelativePath = '' ): string {
    let result = `${packageName}`;
    if (importRelativePath && !importRelativePath.startsWith('/')) {
      result += '/';
    }

    if (importRelativePath !== '/') {
      result += importRelativePath;
    }
    return `${result}`;
  }
}
