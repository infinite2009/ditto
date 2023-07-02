import IPageSchema from '@/types/page.schema';
import { toUpperCase } from '@/util';
import TypeScriptCodeGenerator, { IConstantOptions, IFunctionOptions } from '@/service/code-generator/typescript';
import IComponentSchema from '@/types/component.schema';
import { ImportType } from '@/types';
import DynamicObject from '@/types/dynamic-object';
import { p } from '@tauri-apps/api/path-f8d71c21';

export interface ITSXOptions {
  componentName: string;
  propsStrArr?: string[];
  children?: ITSXOptions[];
}

export interface IPropsOptions {
  name: string;
  variableName?: string;
  value?: string;
  variableType: string;
  variableValueSource?: 'editorInput' | 'httpRequest' | 'calculation';
}

export interface IUseEffectOptions {
  dependencies?: string[];
  handlerCallingSentence: string;
}

export interface IUseStateOptions {
  // 初始值的字符串
  initialValueStr: any;
  valueType: string;
  name: string;
}

export interface IUseMemoOptions {
  dependencies?: string[];
  handlerCallingSentence: string;
}

export interface IUseCallbackOptions {
  dependencies?: string[];
  handlerCallingSentence: string;
}

export interface IUseRefOptions {
  initialValueStr: any;
  valueType: string;
  name: string;
}

export interface IDSLStatsInfo {
  pageName: string;
  importInfo: {
    [importPath: string]: {
      [importType: string]: string[];
    };
  };
  stateInfo: {
    [stateName: string]: IUseStateOptions | null;
  };
  memoInfo: {
    [memoName: string]: IUseMemoOptions | null;
  };
  effectInfo: {
    [effectName: string]: IUseEffectOptions | null;
  };
  callbackInfo: {
    [callbackName: string]: IUseCallbackOptions | null;
  };
  handlerInfo: {
    [handlerName: string]: IFunctionOptions | null;
  };
  actionInfo: {
    [handlerName: string]: IFunctionOptions | null;
  };
  constantInfo: {
    [constantName: string]: IConstantOptions | null;
  };
  tsxInfo: ITSXOptions | null;
}

export default class ReactCodeGenerator {
  constructor(dsl: IPageSchema, tsCodeGenerator: TypeScriptCodeGenerator) {
    this.dsl = dsl;
    this.tsCodeGenerator = tsCodeGenerator;
  }

  dsl: IPageSchema;

  tsCodeGenerator: TypeScriptCodeGenerator;

  generateTSX(opt: ITSXOptions, spaces = 0, indent = 2, sentences: string[] = []): string[] {
    const { propsStrArr = [], componentName, children = [] } = opt;
    const startTagStr = `<${componentName}${propsStrArr?.length ? ' ' : ''}${propsStrArr.join(' ')} ${
      children?.length ? '' : '/'
    }>`;
    const spacesPrefix = ''.padStart(spaces, ' ');
    sentences.push(`${spacesPrefix}${startTagStr}`);
    if (children?.length) {
      children?.forEach(child => {
        this.generateTSX(child, spaces + indent, indent).forEach(item => {
          sentences.push(item);
        });
      });
      const closeTagStr = `</${componentName}>`;
      sentences.push(`${spacesPrefix}${closeTagStr}`);
    }
    return sentences;
  }

  generatePropsStrWithLiteral(opt: IPropsOptions): string {
    const { name, variableType, value } = opt;
    if (variableType === 'string') {
      return `${name}="${value}"`;
    }
    return `${name}={${value}}`;
  }

  generatePropStrWithVariable(opt: IPropsOptions): string {
    const { name, variableName } = opt;
    return `${name}={${variableName}}`;
  }

  generateUseEffect(opt: IUseEffectOptions): string[] {
    const { handlerCallingSentence, dependencies } = opt;
    const result: string[] = [];
    const useEffectHeadStr = 'useEffect(() => {';
    result.push(useEffectHeadStr);
    result.push(handlerCallingSentence);
    const dependenciesStr = this.generateDependenciesSentence(dependencies);
    const tailSentence = `}${dependenciesStr ? ', ' : ''}${dependenciesStr});`;
    result.push(tailSentence);
    return result;
  }

  generateUseState(opt: IUseStateOptions) {
    const { initialValueStr, valueType, name } = opt;
    return `const [${name}, set${toUpperCase(name)}] = useState<${valueType}>(${
      valueType === 'string' ? `'${initialValueStr}'` : initialValueStr
    });`;
  }

  generateUseMemo(opt: IUseMemoOptions) {
    const { handlerCallingSentence, dependencies } = opt;
    const result: string[] = [];
    const useEffectHeadStr = 'useMemo(() => {';
    result.push(useEffectHeadStr);
    result.push(`return ${handlerCallingSentence}`);
    const dependenciesStr = this.generateDependenciesSentence(dependencies);
    const tailSentence = `}${dependenciesStr ? ', ' : ''}${dependenciesStr});`;
    result.push(tailSentence);
    return result;
  }

  generateDependenciesSentence(dependencies: string[] | undefined): string {
    if (!dependencies) {
      return '';
    }
    return `[${dependencies.join(', ')}]`;
  }

  // TODO 半成品，需要 DSL 补充函数类 props 的签名
  generateUseCallback(opt: IUseCallbackOptions) {
    return this.generateUseMemo(opt);
  }

  generateUseRef(opt: IUseRefOptions) {
    const { initialValueStr, valueType, name } = opt;
    return `const ${name}Ref = useRef<${valueType}>(${
      valueType === 'string' ? `'${initialValueStr}'` : initialValueStr
    });`;
  }

  analysisDsl(): IDSLStatsInfo {
    const result: Partial<IDSLStatsInfo> = {
      importInfo: {},
      stateInfo: {},
      memoInfo: {},
      callbackInfo: {},
      effectInfo: {},
      constantInfo: {}
    };
    const { child, props, httpService, actions, handlers, name: pageName, desc: PageDesc } = this.dsl;
    result.pageName = pageName;
    result.tsxInfo = {
      componentName: child.callingName || child.name,
      propsStrArr: [],
      children: []
    };

    // 广度遍历 components，获取其中的导入信息和 props
    let q: IComponentSchema[] = [child];
    let p: ITSXOptions[] = [result.tsxInfo];
    while (q.length) {
      // 弹出头部的节点
      const node: IComponentSchema | undefined = q.shift();
      if (node) {
        const {
          desc,
          callingName,
          importType,
          dependency,
          importRelativePath,
          name,
          propsRefs = [],
          children = [],
          id
        } = node;

        // 提取导入信息
        if (dependency) {
          const importInfoForComponent = this.extractImportInfo(dependency, importType, importRelativePath, name);
          if (importInfoForComponent.importPath && result.importInfo) {
            result.importInfo[importInfoForComponent.importPath] = result.importInfo[
              importInfoForComponent.importPath
            ] || {
              [importInfoForComponent.importType as string]: []
            };
            if (
              !result.importInfo[importInfoForComponent.importPath][
                importInfoForComponent.importType as string
              ]?.includes(name)
            ) {
              result.importInfo[importInfoForComponent.importPath][importInfoForComponent.importType as string]?.push(
                name
              );
            }
          }
        }

        // 提取 props
        const pNode = p.shift();
        if (pNode) {
          const { propsStrArr, stateInfo, callbackInfo, memoInfo, effectInfo } = this.analysisProps(
            this.dsl.props[id],
            propsRefs
          );
          pNode.propsStrArr = propsStrArr;
          // 将每个组件节点的 stateInfo 合并到 result 中，通过命名系统避免 state 重名，callback，memo，effect 亦然
          Object.assign(result.stateInfo as object, stateInfo);
          Object.assign(result.callbackInfo as object, callbackInfo);
          Object.assign(result.memoInfo as object, memoInfo);
          Object.assign(result.effectInfo as object, effectInfo);
        }

        q = q.concat(node.children || []);
        //
      } else {
        result.tsxInfo = null;
      }
    }
    return <IDSLStatsInfo>result;
  }

  extractImportInfo(
    dependency: string,
    importType: ImportType | undefined,
    importRelativePath: string | undefined,
    name: string
  ): { importName: string; importPath?: string; importType?: ImportType } {
    const result: { importName: string; importPath?: string; importType?: ImportType } = {
      importName: name,
      importType
    };
    if (importType === undefined) {
      if (importRelativePath) {
        result.importType = 'default';
      } else {
        result.importType = 'object';
      }
    }
    result.importPath = this.tsCodeGenerator.calculateImportPath(dependency, importRelativePath);
    return result;
  }

  analysisProps(
    componentPropsDict: DynamicObject,
    propsRefs: string[]
  ): {
    propsStrArr: string[];
    stateInfo: { [stateName: string]: IUseStateOptions };
    callbackInfo: { [callbackName: string]: IUseCallbackOptions };
    memoInfo: { [memoName: string]: IUseMemoOptions };
    effectInfo: { [effectName: string]: IUseEffectOptions };
  } {
    const propsStrArr: string[] = [];
    const stateInfo: { [key: string]: IUseStateOptions } = {};
    const memoInfo: { [key: string]: IUseMemoOptions } = {};
    const callbackInfo: { [key: string]: IUseCallbackOptions } = {};
    const effectInfo: { [key: string]: IUseEffectOptions } = {};
    propsRefs.forEach(ref => {
      const props = componentPropsDict[ref];
      const { value, valueType, valueSource, isValue } = props;
      const basicValueTypes = ['string', 'number', 'boolean'];
      // 基础类型固定值走字面，其他情况走变量（常量、state、memo、callback）
      if (valueSource === 'editorInput') {
        if (basicValueTypes.includes(valueType)) {
          propsStrArr.push(
            this.generatePropsStrWithLiteral({
              name: ref,
              value,
              variableType: valueType
            })
          );
        } else {
          // TODO: 待实现
          const variableName = 'mockVariableName';
          propsStrArr.push(
            this.generatePropStrWithVariable({
              name: ref,
              variableName,
              variableType: valueType
            })
          );
        }
      } else if (valueSource === 'handler') {
        // TODO: 生成 useCallback
        const variableName = this.generateVariableName();
        callbackInfo[variableName] = {
          dependencies: [],
          handlerCallingSentence: `() => { console.log('useCallback ${variableName} works!'); }`
        };
      } else if (valueSource === 'computed') {
        // TODO:  生成 useMemo
        const variableName = this.generateVariableName();
        memoInfo[variableName] = {
          dependencies: [],
          handlerCallingSentence: `() => { console.log('useMemo ${variableName} works!'); }`
        };
      } else {
        // TODO: 待实现
        const variableName = this.generateVariableName();
        propsStrArr.push(
          this.generatePropStrWithVariable({
            name: ref,
            variableName,
            variableType: valueType
          })
        );
        // 使用状态的变量
        stateInfo[variableName] = {
          name: variableName,
          // TODO: 之后在开发初值生成方法
          initialValueStr: 'null',
          valueType
        };
      }

      // 如果这个属性是 value，那么自动生成 useEffect
      if (isValue) {
        const variableName = this.generateVariableName();
        effectInfo[variableName] = {
          dependencies: [],
          handlerCallingSentence: `() => { console.log('useMemo ${variableName} works!'); }`
        };
      }
    });
    return {
      propsStrArr,
      stateInfo,
      callbackInfo,
      memoInfo,
      effectInfo
    };
  }

  generateVariableName() {
    return 'mockVariableName';
  }
}
