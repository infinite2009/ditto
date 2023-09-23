import DynamicObject from '@/types/dynamic-object';
import { typeOf } from '@/util';
import { ImportType } from '@/types';

export interface IImportOptions {
  importNames?: string[];
  importPath: string;
  importType: ImportType;
  useSemicolon?: boolean;
}

export interface IFunctionOptions {
  functionName: string;
  functionParams: string[];
  functionComments?: string[];
  exportType?: 'default' | 'object';
  useArrow?: boolean;
  useAsync?: boolean;
  body?: string[];
}

export interface IConstantOptions {
  name: string;
  value: string[];
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

    if (importNames?.length) {
      switch (importType) {
        case 'object':
          return `import { ${importNames.join(', ')} } ${importPathPart}`;
        case '*':
          return `import * as ${importNames[0]} ${importPathPart}`;
        default:
          return `import ${importNames[0]} ${importPathPart}`;
      }
    }
    return '';
  }

  generateFunctionDefinition(data: IFunctionOptions) {
    const {
      functionParams = [],
      functionName,
      functionComments = [],
      useAsync = false,
      useArrow = false,
      exportType = 'null',
      body = []
    } = data;
    let sentences = [...functionComments];
    let signatureSentence = '';
    const functionParamsStr = functionParams.join(', ');
    if (useArrow) {
      signatureSentence = `(${functionParamsStr}) => {`;
    } else {
      let prefix = '';
      if (exportType === 'default') {
        prefix = 'export default ';
      } else if (exportType === 'object') {
        prefix = 'export ';
      }
      if (functionName) {
        signatureSentence = `${prefix}function ${functionName}(${functionParamsStr}) {`;
      } else {
        signatureSentence = `${prefix}function (${functionParamsStr}) {`;
      }
    }
    if (useAsync) {
      signatureSentence = `async ${signatureSentence}`;
    }
    sentences.push(signatureSentence);
    sentences = sentences.concat(body);

    sentences.push('}');
    return sentences;
  }

  generateFunctionCall(opt: IFunctionCallOptions): string {
    const { name, args } = opt;
    return `${name}(${args.join(', ')})`;
  }

  /**
   * 这个妥协的设计，keyPaths 表示需要调用 callback 特殊处理的函数，如果处理过程中产生副作用，
   * 需要 callback 接受参数来收集这些副作用信息
   * 同时，callback 需要返回生成的代码字符串数组，相当于这部分由 callback 完成接管，生成函数只负责数组拼接
   *
   * @param data
   * @param keyPaths
   * @param callback
   * @param currentKeyPath
   * @param key
   * @param sentences
   */
  generateObjectStrArr(
    data: any,
    keyPaths: { path: string; type: 'object' | 'function' }[] = [],
    callback: (data: any, wrapper: string[], insertIndex: number) => string[] = () => [],
    currentKeyPath = '',
    key = '',
    sentences: string[] = []
  ): string[] {
    const type = typeOf(data);
    const keyPathMatchResult =
      keyPaths.length &&
      keyPaths.find(pathObj => {
        return new RegExp(pathObj.path).test(currentKeyPath);
      });
    switch (type) {
      case 'object':
        if (keyPathMatchResult && !!callback) {
          let wrapper = [`${key}${key ? ': ' : ''}(`, '),'];
          if (keyPathMatchResult.type === 'function') {
            wrapper = [`${key}${key ? ': ' : ''}() => {`, 'return (', ');', '}'];
          }
          const customSentences = callback(data, wrapper, keyPathMatchResult.type === 'object' ? 1 : 2);
          sentences = sentences.concat(customSentences);
        } else {
          sentences.push(`${key}${key ? ': ' : ''}{`);
          Object.entries(data).forEach(([key, value]) => {
            this.generateObjectStrArr(
              value,
              keyPaths,
              callback,
              `${currentKeyPath ? currentKeyPath + '.' : currentKeyPath}${key}`,
              key
            ).forEach(item => {
              sentences.push(item);
            });
          });
          sentences.push(`},`);
        }
        break;
      case 'array':
        sentences.push(`${key}${key ? ': ' : ''}[`);
        data.forEach((val: any, index: number) => {
          this.generateObjectStrArr(val, keyPaths, callback, `${currentKeyPath}[${index}]`).forEach(item => {
            sentences.push(item);
          });
        });
        sentences.push(`],`);
        break;
      case 'string':
        sentences.push((key ? `${key}: '${data}'` : `'${data}'`) + ',');
        break;
      default:
        // 这里假设变量都是驼峰命名，符合语法要求
        sentences.push((key ? `${key}: ${data}` : data) + ',');
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

  calculateImportPath(packageName: string, importRelativePath = ''): string {
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
