import IPageSchema from '@/types/page.schema';
import { toUpperCase } from '@/util';
import TypeScriptCodeGenerator, { IConstantOptions, IFunctionOptions } from '@/service/code-generator/typescript';
import IComponentSchema from '@/types/component.schema';
import { ImportType } from '@/types';
import DynamicObject from '@/types/dynamic-object';
import IPropsSchema from '@/types/props.schema';

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
  initialValue: any;
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
    [stateName: string]: IUseStateOptions;
  };
  memoInfo: {
    [memoName: string]: IUseMemoOptions;
  };
  effectInfo: {
    [effectName: string]: IUseEffectOptions;
  };
  callbackInfo: {
    [callbackName: string]: IUseCallbackOptions;
  };
  handlerInfo: {
    [handlerName: string]: IFunctionOptions;
  };
  actionInfo: {
    [handlerName: string]: IFunctionOptions;
  };
  constantInfo: {
    [constantName: string]: IConstantOptions;
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

  generateTSX(opt: ITSXOptions, sentences: string[] = []): string[] {
    const { propsStrArr = [], componentName, children = [] } = opt;
    const startTagStr = `<${componentName}${propsStrArr?.length ? ' ' : ''}${propsStrArr.join(' ')} ${
      children?.length ? '' : '/'
    }>`;
    sentences.push(startTagStr);
    if (children?.length) {
      children?.forEach(child => {
        this.generateTSX(child).forEach(item => {
          sentences.push(item);
        });
      });
      const closeTagStr = `</${componentName}>`;
      sentences.push(closeTagStr);
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

  generateUseState(opt: IUseStateOptions): string {
    const { initialValue, valueType, name } = opt;
    return `const [${name}, set${toUpperCase(name)}] = useState<${valueType === 'array' ? 'any[]' : valueType}>(${
      valueType === 'string' ? `'${initialValue}'` : initialValue
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
      importInfo: {
        react: {
          default: ['React'],
          object: []
        }
      },
      stateInfo: {},
      memoInfo: {},
      callbackInfo: {},
      effectInfo: {},
      constantInfo: {}
    };
    const { child, props, httpService, actions, handlers, name, desc } = this.dsl;
    result.pageName = name;
    // 初始化 tsxInfo，后边在这个 children 里边去遍历填充子节点信息
    this.analysisTemplate(child, props, result);
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

  analysisTemplate(
    template: IComponentSchema,
    props: {
      [key: string]: { [key: string]: IPropsSchema };
    },
    statsInfo: Partial<IDSLStatsInfo>,
  ) {
    const result = statsInfo;
    // 初始化 tsxInfo，后边在这个 children 里边去遍历填充子节点信息
    result.tsxInfo = {
      componentName: template.callingName || template.name,
      propsStrArr: [],
      children: []
    };

    // 广度遍历 components，获取其中的导入信息和 props
    let q: IComponentSchema[] = [template];
    let p: ITSXOptions[] = [result.tsxInfo];
    while (q.length) {
      // 弹出头部的节点
      const node: IComponentSchema | undefined = q.shift();
      if (node) {
        const {
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
          pNode.componentName = callingName || name;
          // 处理当前节点的 props
          if (props[id]) {
            const { propsStrArr, stateInfo, callbackInfo, memoInfo, effectInfo } = this.analysisProps(
              props[id],
              propsRefs,
              id,
              result
            );
            pNode.propsStrArr = propsStrArr;
            // 将每个组件节点的 stateInfo 合并到 result 中，通过命名系统避免 state 重名，callback，memo，effect 亦然
            Object.assign(result.stateInfo as object, stateInfo);
            Object.assign(result.callbackInfo as object, callbackInfo);
            Object.assign(result.memoInfo as object, memoInfo);
            Object.assign(result.effectInfo as object, effectInfo);
            if (result.importInfo) {
              const { object } = result.importInfo.react;
              if (Object.entries(effectInfo).length && !object.includes('useEffect')) {
                object.push('useEffect');
              }
              if (Object.entries(stateInfo).length && !object.includes('useState')) {
                object.push('useState');
              }
              if (Object.entries(memoInfo).length && !object.includes('useMemo')) {
                object.push('useMemo');
              }
              if (Object.entries(callbackInfo).length && !object.includes('useCallback')) {
                object.push('useCallback');
              }
            }
          }
          // 初始化子节点
          if (children) {
            pNode.children = children.map(() => {
              return {
                componentName: '',
                propsStrArr: [],
                children: []
              };
            });
            p = p.concat(pNode.children);
          }
        }

        q = q.concat(children || []);
        //
      } else {
        result.tsxInfo = null;
      }
    }
    return result;
  }

  analysisProps(
    componentPropsDict: DynamicObject,
    propsRefs: string[],
    componentId: string,
    statsInfo: Partial<IDSLStatsInfo>
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
      // 找不到的 ref 跳过
      if (!props) {
        return;
      }
      const { value, valueType, valueSource, isValue, isTemplate, name } = props;
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
          const variableName = this.generateVariableName(componentId, name, 'state');
          propsStrArr.push(
            this.generatePropStrWithVariable({
              name: ref,
              variableName,
              variableType: valueType
            })
          );
          // 变量需要转为 state
          stateInfo[variableName] = {
            name: variableName,
            initialValue: this.tsCodeGenerator.generateObjectStrArr(value).join(' '),
            valueType
          };
        }
      } else if (valueSource === 'handler') {
        // TODO: 生成 useCallback
        const variableName = this.generateVariableName(componentId, name, 'state');
        callbackInfo[variableName] = {
          dependencies: [],
          handlerCallingSentence: `() => { console.log('useCallback ${variableName} works!'); }`
        };
      } else if (valueSource === 'computed') {
        // TODO:  生成 useMemo
        const variableName = this.generateVariableName(componentId, name, 'state');
        memoInfo[variableName] = {
          dependencies: [],
          handlerCallingSentence: `() => { console.log('useMemo ${variableName} works!'); }`
        };
      } else {
        const variableName = this.generateVariableName(componentId, name, 'state');
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
          initialValue: basicValueTypes.includes(valueType)
            ? value
            : this.tsCodeGenerator.generateObjectStrArr(value).join(' '),
          valueType
        };
      }

      // 如果这个属性是 value，那么自动生成 useEffect
      if (isValue) {
        const variableName = this.generateVariableName(componentId, name, 'state');
        // 填充 effectInfo
        effectInfo[variableName] = {
          dependencies: [variableName],
          handlerCallingSentence: `console.log('useEffect ${variableName} works!');`
        };
      }

      if (isTemplate) {
        const { tsxInfo } = this.analysisTemplate(props.value as IComponentSchema, componentPropsDict, statsInfo);
        if (tsxInfo) {
          const variableName = this.generateVariableName(componentId, name, 'constant');
          const variableValue = this.generateTSX(tsxInfo);
          if (valueType === 'object' && statsInfo.constantInfo) {
            statsInfo.constantInfo[variableName] = {
              name: variableName,
              value: variableValue
            };
          }
        }
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

  generateVariableName(componentId: string, propsName: string, prefix: string): string {
    return `${propsName}${toUpperCase(prefix)}Of${toUpperCase(componentId)}`;
  }

  generatePageCode(): string[] {
    let result: string[] = [];
    const {
      pageName = 'index',
      stateInfo,
      effectInfo,
      callbackInfo,
      memoInfo,
      constantInfo,
      importInfo,
      tsxInfo
    } = this.analysisDsl();

    // 生成导入语句
    Object.entries(importInfo).forEach(([importPath, item]) => {
      Object.entries(item).forEach(([importType, importNames]) => {
        result.push(
          this.tsCodeGenerator.generateImportSentence({
            importNames,
            importPath,
            importType: importType as ImportType
          })
        );
      });
    });
    const functionInfo = {
      functionName: toUpperCase(pageName),
      functionParams: [],
      useArrow: false,
      useAsync: false,
      exportType: 'default',
      body: [
        ...Object.values(stateInfo).map(i => this.generateUseState(i)),
        ...Object.values(effectInfo)
          .map(i => this.generateUseEffect(i))
          .flat(2),
        ...Object.values(memoInfo)
          .map(i => this.generateUseMemo(i))
          .flat(2),
        ...Object.values(callbackInfo)
          .map(i => this.generateUseCallback(i))
          .flat(2),
        ...Object.values(constantInfo).map(i => this.tsCodeGenerator.generateAssignment({
          variableName: i.name,
          expressions: i.value
        })).flat(2)
      ]
    };
    if (tsxInfo === null) {
      functionInfo.body.push(`return null;`);
    } else {
      functionInfo.body.push('return (');
      functionInfo.body = functionInfo.body.concat(this.generateTSX(tsxInfo));
      functionInfo.body.push(');');
    }
    result = result.concat(this.tsCodeGenerator.generateFunctionDefinition(functionInfo as IFunctionOptions));

    return result;
  }
}
