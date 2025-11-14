import { typeOf } from '@/util';
import { ImportType } from '@/types';
import { TemplateKeyPathsReg } from '@/types/props.schema';

// props忽略代码生成的变量名前缀
export const IGNORE_GENERATE_CODE_PREFIX = '_ignoreCode';

export interface IImportOptions {
  importNames?: string[];
  importPath: string;
  importType: ImportType;
  useSemicolon?: boolean;
}

export interface IFunctionOptions {
  args: string[];
  body?: string[];
  comments?: string;
  exportStr?: 'export default' | 'export' | '';
  functionName: string;
  useArrow?: boolean;
  useAsync?: boolean;
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
  expressions: string[];
  useLet?: boolean;
  variableName: string;
}

export default class TypeScriptCodeGenerator {
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

  generateAssignment(opt: IAssignmentOptions): string[] {
    const { variableName, expressions, useLet = false } = opt;
    const cp = [...expressions];
    cp[0] = `${useLet ? 'let' : 'const'} ${variableName} = ${cp[0]}`;
    return cp;
  }

  generateFunctionCall(opt: IFunctionCallOptions): string {
    const { name, args } = opt;
    return `${name}(${args.join(', ')})`;
  }

  generateFunctionDefinition({
    functionName = '',
    args = [],
    body = [],
    extraComments = 'TODO(Voltron)：请实现该函数, Voltron 暂时无法为你生成它',
    comments = '',
    exportStr = '',
    useAsync = false,
    useArrow = false
  }) {
    const argsStr = args.map(arg => `${arg}: any`);
    const head = useArrow ? `(${argsStr.join(', ')}) =>` : `function ${functionName}(${argsStr.join(', ')})`;
    return `${exportStr} ${useAsync ? 'async' : ''} ${head} {
    ${extraComments ? `/** \n    ${extraComments} \n */` : ''}
    ${comments ? `// ${comments}` : comments}
    ${body.join('\n')}
  }\n`;
  }

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

  /**
   * 这个妥协的设计，keyPaths 表示需要调用 callback 特殊处理的函数，如果处理过程中产生副作用，
   * 需要 callback 接受参数来收集这些副作用信息
   * 同时，callback 需要返回生成的代码字符串数组，相当于这部分由 callback 完成接管，生成函数只负责数组拼接
   * 这个函数的实现有点糟糕，一是函数签名设计不合理，参数太多了；二是有巧合式编程
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
    keyPaths: TemplateKeyPathsReg[] = [],
    callback: (
      data: any,
      wrapper: string[],
      insertIndex: number,
      keyPathMatchResult?: TemplateKeyPathsReg
    ) => string[] = () => [],
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
        // 使用自定义代码片段渲染
        if (data?._type === 'customGenerateCode' && Array.isArray(data?._value)) {
          sentences = data?._value;
        } else if (keyPathMatchResult && !!callback) {
          let wrapper = [`${key}${key ? ': ' : ''}(`, '),'];
          if (keyPathMatchResult.type === 'function') {
            wrapper = [`${key}${key ? ': ' : ''}(...args: any[]) => {`, 'return (', ');', '}'];
          }
          const customSentences = callback(data, wrapper, keyPathMatchResult.type === 'object' ? 1 : 2);
          sentences = sentences.concat(customSentences);
        } else {
          sentences.push(`${key}${key ? ': ' : ''}{`);
          Object.entries(data).forEach(([key, value], index) => {
            if (!key.startsWith(IGNORE_GENERATE_CODE_PREFIX)) {
              this.generateObjectStrArr(
                value,
                keyPaths,
                callback,
                `${currentKeyPath ? currentKeyPath + '.' : currentKeyPath}${key}`,
                key
              ).forEach(item => {
                sentences.push(item);
              });
              const keyCount = Object.keys(data).length;
              if (index < keyCount - 1 && !sentences[sentences.length - 1].endsWith(',')) {
                // 每个元素后加上一个逗号，最后一个除外
                sentences[sentences.length - 1] += ',';
              }
            }
          });

          // sentences.push(`}${key ? ',' : ''}`);
          sentences.push(`}`);
        }
        break;
      case 'array':
        if (keyPathMatchResult && !!callback) {
          if (keyPathMatchResult.type === 'function' && keyPathMatchResult.repeatType === 'table') {
            const wrapper = [`${key}${key ? ': ' : ''}(...args: any[]) => {`, 'return (', ');', '}'];
            const customSentences = callback(data, wrapper, 2, keyPathMatchResult);
            sentences = sentences.concat(customSentences);
          }
        } else {
          sentences.push(`${key}${key ? ': ' : ''}[`);
          data.forEach((val: any, index: number) => {
            this.generateObjectStrArr(val, keyPaths, callback, `${currentKeyPath}[${index}]`).forEach(item => {
              sentences.push(item);
            });
            if (index < data.length - 1) {
              // 每个元素后加上一个逗号，最后一个除外
              sentences[sentences.length - 1] += ',';
            }
          });
          // if (key) {
          //   sentences.push('],');
          // } else {
          sentences.push(']');
          // }
        }
        break;
      case 'string':
        if (key) {
          sentences.push(`${key}: '${data}'`);
        } else {
          sentences.push(`'${data}'`);
        }
        break;
      default:
        // 这里假设变量都是驼峰命名，符合语法要求
        if (key) {
          sentences.push(`${key}: ${data}`);
        } else {
          sentences.push(`${data}`);
        }
        break;
    }
    return sentences;
  }
}
