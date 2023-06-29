import DynamicObject from '@/types/dynamic-object';
import { typeOf } from '@/util';

export interface IImportOptions {
  importNames?: string[] | string;
  packageName: string;
  importPath?: string;
  importType?: 'default' | 'object' | '*';
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

export default class TypeScriptCodeGenerator {
  generateImportSentence(data: IImportOptions) {
    if (!data) {
      throw new Error('no import manifest error');
    }
    const { importType, importNames, importPath = '', packageName, useSemicolon = true } = data;
    if (!packageName) {
      throw new Error('no package name error');
    }

    let importPathPart = `from '${packageName}`;

    if (importPath && !importPath.startsWith('/')) {
      importPathPart += '/';
    }

    if (importPath !== '/') {
      importPathPart += importPath;
    }

    importPathPart += "'";

    if (useSemicolon) {
      importPathPart += ';';
    }

    switch (importType) {
      case 'object':
        // 无论是字符串还是数组，都可以被检查到
        if (!importNames?.length) {
          throw new Error('no dependencies error');
        }
        return `import { ${typeof importNames === 'string' ? importNames : importNames.join(', ')} } ${importPathPart}`;
      case '*':
        return `import * as ${importNames} ${importPathPart}`;
      default:
        return `import ${importNames} ${importPathPart}`;
    }
  }

  generateFunction(data: IFunctionOptions) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateObjectStrArr(data: any, key = '', useComma = true, sentences: string[] = []): string[] {
    const type = typeOf(data);
    switch (type) {
      case 'object':
        sentences.push(`${key}${key ? ': ' : ''}{`);
        Object.entries(data).forEach(([key, value]) => {
          this.generateObjectStrArr(value, key).forEach(item => {
            sentences.push(item);
          });
          sentences.push('},');
        });
        break;
      case 'array':
        sentences.push(`${key}${key ? ': ' : ''}[`);
        this.generateObjectStrArr(data).forEach(item => {
          sentences.push(item);
        });
        sentences.push(']');
        break;
      case 'string':
        if (key) {
          sentences.push(`${key}: '${data}'`);
        }
        break;
      default:
        // 这里假设变量都是驼峰命名，符合语法要求
        if (key) {
          sentences.push(`${key}: {${data}}`);
        }
        break;
    }
    return sentences;
  }
}
