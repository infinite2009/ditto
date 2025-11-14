import IPageSchema from '@/types/page.schema';
import { generateHttpRequestFunctionName, toPascal, toProgressive, typeOf } from '@/util';
import TypeScriptCodeGenerator, { IConstantOptions, IFunctionOptions } from '@/service/code-generator/typescript';
import IComponentSchema from '@/types/component.schema';
import { ComponentId, ImportType, PropsId } from '@/types';
import IPropsSchema from '@/types/props.schema';
import ComponentSchemaRef from '@/types/component-schema-ref';
import ActionType from '@/types/action-type';
import { HttpActionOption, PageDirectionOption, StateTransitionOption } from '@/types/action.schema';
import { GenerateOptions } from '../file';
import { merge } from 'lodash';

export interface ITSXOptions {
  children?: ITSXOptions[];
  componentId: ComponentId;
  componentName?: string;
  propsStrArr?: string[];
  text?: string;
}

export interface IPropsOptions {
  name: string;
  value?: string | undefined | number | boolean;
  variableName?: string;
  variableType?: string;
  variableValueSource?: 'editorInput' | 'httpRequest' | 'calculation';
}

export interface IUseEffectOptions {
  dependencies?: string[];
  handlerCallingSentence: string;
}

export interface IUseStateOptions {
  // 初始值的字符串
  initialValue: any;
  name: string;
  valueType: string;
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
  name: string;
  valueType: string;
}

export interface IImportInfo {
  [importPath: string]: {
    [importType: string]: string[];
  };
}

export interface IDSLStatsInfo {
  actionInfo: {
    [handlerName: string]: IFunctionOptions;
  };
  callbackInfo: {
    [callbackName: string]: IUseCallbackOptions;
  };
  constantInfo: {
    [constantName: string]: IConstantOptions;
  };
  effectInfo: {
    [effectName: string]: IUseEffectOptions;
  };
  handlerInfo: {
    [handlerName: string]: IFunctionOptions;
  };
  importInfo: IImportInfo;
  memoInfo: {
    [memoName: string]: IUseMemoOptions;
  };
  pageName: string;
  stateInfo: {
    [stateName: string]: IUseStateOptions;
  };
  tsxInfo: ITSXOptions | null;

  [key: string]: any;
}

type stateName = string;
type stateSetterName = string;

export default class ReactCodeGenerator {
  // 组件可见性字典，它的值是指定组件的可见性 state
  componentVisibilityDict: Record<ComponentId, stateName> = {};
  dsl: IPageSchema;
  dslStatsInfo: IDSLStatsInfo;
  generationOpts: GenerateOptions = { useStore: true };
  // 存储每个 prop 对应的 handler 函数名
  handler: Record<ComponentId, Record<PropsId, string>> = {};
  tsCodeGenerator: TypeScriptCodeGenerator;

  constructor(dsl: IPageSchema, tsCodeGenerator: TypeScriptCodeGenerator, opts?: GenerateOptions) {
    this.dsl = dsl;
    this.tsCodeGenerator = tsCodeGenerator;
    this.dslStatsInfo = this.analysisDsl();
    merge(this.generationOpts, opts);
  }

  analysisDsl(): IDSLStatsInfo {
    const { child, props, name } = this.dsl;
    // 初始化 tsxInfo，后边在这个 children 里边去遍历填充子节点信息
    const result = this.analysisTemplate(child, props);
    result.pageName = name;
    return <IDSLStatsInfo>result;
  }

  analysisProps(
    propsDict: { [key: ComponentId]: { [key: string]: IPropsSchema } },
    component: IComponentSchema
  ): {
    importInfo: {
      [importPath: string]: {
        [importType: string]: string[];
      };
    };
    propsStrArr: string[];
    stateInfo: { [stateName: string]: IUseStateOptions };
    callbackInfo: { [callbackName: string]: IUseCallbackOptions };
    memoInfo: { [memoName: string]: IUseMemoOptions };
    effectInfo: { [effectName: string]: IUseEffectOptions };
    handlerInfo: { [handlerName: string]: IFunctionOptions };
    constantInfo: { [constantName: string]: IConstantOptions };
  } {
    // TODO 暂时改为 any，跑通后再修改为真实类型
    const result: any = {
      importInfo: {},
      propsStrArr: [],
      stateInfo: {},
      memoInfo: {},
      callbackInfo: {},
      effectInfo: {},
      constantInfo: {},
      handlerInfo: {}
    };

    const { id: componentId, propsRefs } = component;

    const componentPropsDict = propsDict[componentId];

    propsRefs.forEach(ref => {
      const props = componentPropsDict[ref];
      // 找不到的 ref 跳过
      if (!props) {
        return;
      }

      const { value, valueSource, valueType: originalValueType, isValue, templateKeyPathsReg = [], name } = props;

      // 解决 valueType 是数字，但是 value 本身不是数字的问题，一般是 css 样式问题，但是如果 value 取不到值，则使用组件属性配置的类型
      const valueType =
        value === undefined
          ? typeOf(originalValueType) === 'array'
            ? originalValueType[0]
            : (originalValueType as string)
          : typeOf(value);

      const basicValueTypes = ['string', 'number', 'boolean', 'undefined', 'null'];
      // 基础类型固定值走字面，其他情况走变量（常量、state、memo、callback）
      if (valueSource === 'editorInput') {
        if (basicValueTypes.includes(valueType)) {
          result.propsStrArr.push(
            this.generatePropsStrWithLiteral({
              name: ref,
              value: value as any,
              variableType: valueType
            })
          );
        } else {
          if (templateKeyPathsReg.length) {
            const variableName = this.generateVariableName(componentId, name, 'const');
            result.propsStrArr.push(
              this.generatePropAssignmentExpWithVariable({
                name: ref,
                variableName
              })
            );

            // 模板使用嵌套
            if (result.constantInfo) {
              result.constantInfo[variableName] = {
                name: variableName,
                value: this.tsCodeGenerator.generateObjectStrArr(
                  value,
                  templateKeyPathsReg,
                  (
                    val: ComponentSchemaRef | ComponentSchemaRef[],
                    wrapper: string[] = [],
                    insertIndex = 0,
                    keyPathMatchResult
                  ) => {
                    const tsxInfoArr = [];
                    const componentRefArr = // 渲染render函数，不需要遍历数组，取第一项即可
                      (
                        keyPathMatchResult?.repeatType === 'table' ? (val[0] ? [val[0]] : []) : [val]
                      ) as ComponentSchemaRef[];
                    componentRefArr.forEach(item => {
                      const templateInfo = this.analysisTemplate(item, propsDict);
                      if (!templateInfo) {
                        return [];
                      }
                      const { tsxInfo, importInfo, effectInfo, constantInfo, memoInfo, callbackInfo, stateInfo } =
                        templateInfo;
                      // 合并统计分析
                      Object.assign(result.stateInfo as object, stateInfo);
                      Object.assign(result.callbackInfo as object, callbackInfo);
                      Object.assign(result.memoInfo as object, memoInfo);
                      Object.assign(result.effectInfo as object, effectInfo);
                      Object.assign(result.constantInfo as object, constantInfo);
                      if (importInfo) {
                        // 合并 hooks
                        const { object } = importInfo.react;
                        if (
                          result.effectInfo &&
                          Object.entries(result.effectInfo).length &&
                          !object.includes('useEffect')
                        ) {
                          object.push('useEffect');
                        }
                        if (
                          result.stateInfo &&
                          Object.entries(result.stateInfo).length &&
                          !object.includes('useState')
                        ) {
                          object.push('useState');
                        }
                        if (result.memoInfo && Object.entries(result.memoInfo).length && !object.includes('useMemo')) {
                          object.push('useMemo');
                        }
                        if (
                          result.callbackInfo &&
                          Object.entries(result.callbackInfo).length &&
                          !object.includes('useCallback')
                        ) {
                          object.push('useCallback');
                        }
                        this.mergeImportInfo(result.importInfo, importInfo);
                      }

                      if (tsxInfo) {
                        tsxInfoArr.push(tsxInfo);
                      }
                    });

                    if (tsxInfoArr.length === 1) {
                      const tsxSentences = this.generateTSX(tsxInfoArr[0]);
                      // 这里如果存在 wrapper ，则按照插入索引的位置，插入 tsx 代码
                      if (wrapper.length) {
                        const cp = [...wrapper];
                        cp.splice(insertIndex, 0, ...tsxSentences);
                        return cp;
                      }
                      return tsxSentences;
                    } else if (tsxInfoArr.length > 1) {
                      const tsxSentences = tsxInfoArr.map(tsxInfo => {
                        return this.generateTSX(tsxInfo).join('');
                      });
                      if (wrapper.length) {
                        const cp = [...wrapper];
                        const sentence = `[${tsxSentences.join(',')}][args[2]]`;
                        cp.splice(insertIndex, 0, sentence);
                        return cp;
                      }
                    }
                    return [];
                  }
                )
              };
            }
          } else {
            if (this.useLiteralAssignment(value, valueType)) {
              result.propsStrArr.push(
                this.generatePropsStrWithLiteral({
                  name: ref,
                  value: this.tsCodeGenerator.generateObjectStrArr(value).join(' '),
                  variableType: valueType
                })
              );
            } else {
              const variableName = this.generateVariableName(componentId, name, 'state');
              result.propsStrArr.push(
                this.generatePropAssignmentExpWithVariable({
                  name: ref,
                  variableName
                })
              );
              // 变量需要转为 state
              if (result.stateInfo) {
                result.stateInfo[variableName] = {
                  name: variableName,
                  initialValue: basicValueTypes.includes(valueType)
                    ? value
                    : this.tsCodeGenerator.generateObjectStrArr(value).join(' '),
                  valueType: valueType
                };
              }
            }
          }
        }
      } else if (valueSource === 'handler') {
        if (props.value) {
          const handlerInfo = this.generateHandlerInfo(props.value, componentId, ref);
          // 添加 props 赋值
          result.propsStrArr.push(
            this.generatePropAssignmentExpWithVariable({
              name: ref,
              variableName: handlerInfo.functionName
            })
          );
          result.handlerInfo[handlerInfo.functionName] = handlerInfo;
        }
      } else if (valueSource === 'computed') {
        // TODO:  生成 useMemo
        const variableName = this.generateVariableName(componentId, name, 'state');
        if (result.memoInfo) {
          result.memoInfo[variableName] = {
            dependencies: [],
            handlerCallingSentence: `() => { console.log('useMemo ${variableName} works!'); }`
          };
        }
      } else if (valueSource === 'state' && value) {
        // 当值的来源是 state 的时候，value 就是变量名，不需要自动生成了
        const variableName = value;
        result.propsStrArr.push(
          this.generatePropAssignmentExpWithVariable({
            name: ref,
            variableName
          })
        );
        // 使用状态的变量
        if (result.stateInfo) {
          const varInfo = this.dsl.variableDict[variableName];
          result.stateInfo[variableName] = {
            name: variableName,
            initialValue: varInfo.initialValue,
            valueType: varInfo.type
          };
        }
      } else {
        const variableName = this.generateVariableName(componentId, name, 'state');
        result.propsStrArr.push(
          this.generatePropAssignmentExpWithVariable({
            name: ref,
            variableName
          })
        );
        // 使用状态的变量
        if (result.stateInfo) {
          result.stateInfo[variableName] = {
            name: variableName,
            initialValue: basicValueTypes.includes(valueType)
              ? value
              : this.tsCodeGenerator.generateObjectStrArr(value).join(' '),
            valueType: valueType
          };
        }
      }

      // 如果这个属性是 value，那么自动生成 useEffect
      if (isValue) {
        const variableName = this.generateVariableName(componentId, name, 'state');
        // 填充 effectInfo
        if (result.effectInfo) {
          result.effectInfo[variableName] = {
            dependencies: [variableName],
            handlerCallingSentence: `console.log('useEffect ${variableName} works!');`
          };
        }
      }
    });
    // 加上 key
    result.propsStrArr.unshift(this.generatePropsStrWithLiteral({
      name: 'key',
      value: componentId,
      variableType: 'string'
    }));
    return result;
  }

  analysisTemplate(
    templateRef: ComponentSchemaRef,
    propsDict: {
      [key: ComponentId]: { [key: string]: IPropsSchema };
    }
  ) {
    const { componentIndexes, businessReplacement = {} } = this.dsl;
    // 如果是可替换节点，就替换为业务组件，如果替换组件不存在，使用原组件作为 backup
    const template =
      templateRef.replacement?.type === 'module' && businessReplacement[templateRef.replacement?.ref]
        ? businessReplacement[templateRef.replacement?.ref]
        : componentIndexes[templateRef.current];
    if (!template) {
      return null;
    }
    const result: Partial<IDSLStatsInfo> = {
      importInfo: {
        react: {
          default: ['React'],
          object: []
        }
      },
      stateInfo: {},
      memoInfo: {},
      handlerInfo: {},
      callbackInfo: {},
      effectInfo: {},
      constantInfo: {},
      tsxInfo: {
        componentName: template.callingName || template.name,
        componentId: templateRef.replacement?.type === 'module' ? templateRef.replacement?.ref : templateRef.current,
        propsStrArr: [],
        children: []
      }
    };
    // 初始化 tsxInfo，后边在这个 children 里边去遍历填充子节点信息

    // 广度遍历 components，获取其中的导入信息和 props
    let q: ComponentSchemaRef[] = [templateRef];
    let p: ITSXOptions[] = [result.tsxInfo as ITSXOptions];
    while (q.length) {
      // 弹出头部的节点
      const nodeRef: ComponentSchemaRef = q.shift() as ComponentSchemaRef;
      if (nodeRef) {
        const node =
          nodeRef.replacement?.type === 'module' && businessReplacement[nodeRef.replacement?.ref]
            ? businessReplacement[nodeRef.replacement?.ref]
            : componentIndexes[nodeRef.current];
        const pNode = p.shift();

        if (nodeRef.isText) {
          if (pNode) {
            pNode.text = nodeRef.current;
          }
        } else {
          const {
            callingName,
            importType,
            dependency,
            importRelativePath,
            name,
            children = [],
            id,
            noImport,
            importName
          } = node as IComponentSchema;
          // 提取导入信息，如果是 html 元素 或者是声明了不需要导入语句的
          if (dependency && dependency !== 'html' && !noImport) {
            const finalImportName = importName || name;
            const importInfoForComponent = this.extractImportInfo(
              dependency,
              importType,
              importRelativePath,
              finalImportName
            );
            if (importInfoForComponent.importPath && result.importInfo) {
              result.importInfo[importInfoForComponent.importPath] = result.importInfo[
                importInfoForComponent.importPath
              ] || {
                [importInfoForComponent.importType as string]: []
              };
              if (
                !result.importInfo[importInfoForComponent.importPath][
                  importInfoForComponent.importType as string
                ]?.includes(finalImportName)
              ) {
                result.importInfo[importInfoForComponent.importPath][importInfoForComponent.importType as string]?.push(
                  finalImportName
                );
              }
            }
          }

          // 提取 props
          if (pNode) {
            pNode.componentName = callingName || name;
            // 处理当前节点的 props
            if (propsDict[id]) {
              const {
                importInfo,
                propsStrArr,
                stateInfo,
                callbackInfo,
                memoInfo,
                effectInfo,
                constantInfo,
                handlerInfo
              } = this.analysisProps(propsDict, node as IComponentSchema);
              pNode.propsStrArr = propsStrArr;
              // 将每个组件节点的 stateInfo 合并到 result 中，通过命名系统避免 state 重名，callback，memo，effect 亦然
              Object.assign(result.stateInfo as object, stateInfo);
              Object.assign(result.callbackInfo as object, callbackInfo);
              Object.assign(result.memoInfo as object, memoInfo);
              Object.assign(result.effectInfo as object, effectInfo);
              Object.assign(result.constantInfo as object, constantInfo);
              Object.assign(result.handlerInfo as object, handlerInfo);
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
                // 合并导入信息
                this.mergeImportInfo(result.importInfo, importInfo);
              }
            }
            // 初始化子节点
            pNode.children = children.map(item => {
              return {
                componentName: '',
                componentId: item.replacement?.type === 'module' ? item.replacement?.ref : item.current,
                propsStrArr: [],
                children: []
              };
            });
            p = p.concat(pNode.children);
          }

          q = q.concat(children || []);
        }
      } else {
        result.tsxInfo = null;
      }
    }
    return result;
  }

  extractImportInfo(
    dependency: string,
    importType: ImportType | undefined,
    importRelativePath: string | undefined,
    importName: string
  ): { importName: string; importPath?: string; importType?: ImportType } {
    const result: { importName: string; importPath?: string; importType?: ImportType } = {
      importName,
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

  generateDependenciesSentence(dependencies: string[] | undefined): string {
    if (!dependencies) {
      return '';
    }
    return `[${dependencies.join(', ')}]`;
  }

  generatePageCode(): string {
    let result: string[] = [];
    const {
      pageName = 'Index',
      stateInfo,
      effectInfo,
      callbackInfo,
      memoInfo,
      constantInfo,
      importInfo,
      handlerInfo,
      tsxInfo
    } = this.dslStatsInfo;

    if (this.generationOpts?.simple) {
      return this.generateTSX(tsxInfo).join('\n');
    }

    // 生成导入语句
    Object.entries(importInfo).forEach(([importPath, item]) => {
      Object.entries(item).forEach(([importType, importNames]) => {
        const importSentence = this.tsCodeGenerator.generateImportSentence({
          importNames,
          importPath,
          importType: importType as ImportType
        });
        if (importSentence) {
          result.push(importSentence);
        }
      });
    });

    // 如果是使用 store 的模式
    const storeName = 'userPageStore';
    if (this.generationOpts.useStore) {
      result.push(`import ${storeName} from './store';`);
    }

    const { useStore } = this.generationOpts;
    const functionInfo = {
      functionName: toPascal(pageName),
      args: [],
      extraComments: '本代码由 Voltron 自动生成，不要修改',
      useArrow: false,
      useAsync: false,
      exportStr: 'export default',
      body: [
        ...(useStore
          ? [
              `const { ${Object.values(stateInfo)
                .map(state => `${state.name}, `)
                .join('')}${Object.values(handlerInfo)
                .map(handler => `${handler.functionName}, `)
                .join('')} } = ${storeName}();`
            ]
          : Object.values(stateInfo).map(i => this.generateUseState(i))),
        ...Object.values(effectInfo)
          .map(i => this.generateUseEffect(i))
          .flat(2),
        ...Object.values(memoInfo)
          .map(i => this.generateUseMemo(i))
          .flat(2),
        ...Object.values(callbackInfo)
          .map(i => this.generateUseCallback(i))
          .flat(2),
        ...Object.values(constantInfo)
          .map(i =>
            this.tsCodeGenerator.generateAssignment({
              variableName: i.name,
              expressions: i.value
            })
          )
          .flat(2),
        ...(useStore
          ? []
          : Object.values(handlerInfo)
              .map(i => this.tsCodeGenerator.generateFunctionDefinition(i))
              .flat(2))
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
    return result.join('\n');
  }

  generatePropAssignmentExpWithVariable(opt: IPropsOptions): string {
    const { name, variableName } = opt;
    return `${name}={${variableName}}`;
  }

  generatePropsStrWithLiteral(opt: IPropsOptions): string {
    const { name, variableType, value } = opt;
    // 如果 value 的值是 undefined，则直接忽略这个值
    if (value === undefined) {
      return '';
    }
    if (variableType === 'string') {
      return `${name}="${value}"`;
    }
    if (variableType === 'boolean' && value === true) {
      return `${name}`;
    }
    return `${name}={${value}}`;
  }

  generateStoreCode() {
    const { stateInfo, handlerInfo, pageName = 'Index' } = this.dslStatsInfo;
    this.tsCodeGenerator.generateFunctionDefinition({
      functionName: '',
      body: [],
      extraComments: 'TODO(Voltron)：如有更多业务逻辑，请扩展',
      exportStr: 'export default'
    });

    const storeTypeName = `${'Index'}Store`;

    const stateNames = Object.values(stateInfo).map(state => state.name);

    const keyValueTpl1 = Object.values(stateInfo).map(state => {
      return `${state.name}: ${state.initialValue}`;
    });

    const keyValueTpl2 = Object.values(stateInfo).map(state => {
      return `set${toPascal(state.name)}: (${state.name}: ${state.valueType}) => set(() => ({ ${state.name} }))`;
    });

    const storeCreationTpl = `const innerStore = create<${storeTypeName}>((set) => ({
      ${keyValueTpl1.join(',\n')},
      ${keyValueTpl2.join(',\n')}
    }));`;

    const fnNames = Object.values(handlerInfo).map(fn => fn.functionName);

    const fnDefs = Object.values(handlerInfo).map(fn => {
      return [`function ${fn.functionName}() {`, ...fn.body, '}'].join('\n');
    });

    const storeDestruction = `const { ${Object.values(stateInfo)
      .map(state => state.name)
      .join(', ')}, ${Object.values(stateInfo).map(state => `set${toPascal(state.name)}`)} } = innerStore();`;

    const hooks = [
      `function use${toPascal('index')}Store() {`,
      storeDestruction,
      ...fnDefs,
      `return { ${stateNames.join(',\n')}, ${fnNames.join(',\n')} };`,
      `}`
    ];

    const typeTpl = [
      `type ${storeTypeName} = {`,
      ...Object.values(stateInfo).map(state => {
        return `${state.name}: ${state.valueType};`;
      }),
      ...Object.values(stateInfo).map(state => {
        return `set${toPascal(state.name)}: (${state.name}: ${state.valueType}) => void;`;
      }),
      `};`
    ];

    const result = [
      "import { create } from 'zustand';",
      ...typeTpl,
      storeCreationTpl,
      // '// block',
      // ...Object.values(handlerInfo)
      //   .map(i => this.tsCodeGenerator.generateFunctionDefinition(i))
      //   .flat(2),
      // '// block',
      ...hooks,
      `export default use${toPascal('index')}Store;`
    ];
    return result.join('');
  }

  generateTSX(opt: ITSXOptions, sentences: string[] = []): string[] {
    // 如果 text 字段是真值（可能为空字符串，所以这里判断非undefined），说明这个节点本身是纯文本
    if (opt.text !== undefined) {
      return [opt.text];
    }
    const { propsStrArr = [], componentId, componentName, children = [] } = opt as unknown as ITSXOptions;
    // TODO: 这里适配可见性问题
    const startTagStr = `<${componentName}${propsStrArr?.length ? ' ' : ''}${propsStrArr.join(' ')} ${
      children?.length ? '' : '/'
    }>`;

    const visibilityState = this.componentVisibilityDict[componentId];
    if (visibilityState) {
      sentences.push(`{ ${visibilityState} ? ${startTagStr}`);
    } else {
      sentences.push(startTagStr);
    }
    if (children?.length) {
      children?.forEach(child => {
        this.generateTSX(child).forEach(item => {
          sentences.push(item);
        });
      });
      const closeTagStr = `</${componentName}>`;
      sentences.push(closeTagStr);
    }
    if (sentences.length && visibilityState) {
      sentences[sentences.length - 1] = `${sentences[sentences.length - 1]} : null }`;
    }
    return sentences;
  }

  // TODO 半成品，需要 DSL 补充函数类 props 的签名
  generateUseCallback(opt: IUseCallbackOptions) {
    return this.generateUseMemo(opt);
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

  generateUseRef(opt: IUseRefOptions) {
    const { initialValueStr, valueType, name } = opt;
    return `const ${name}Ref = useRef<${valueType}>(${
      valueType === 'string' ? `'${initialValueStr}'` : initialValueStr
    });`;
  }

  generateUseState(opt: IUseStateOptions): string {
    const { initialValue, valueType, name } = opt;
    return `const [${name}, set${toPascal(name)}] = useState<${valueType === 'array' ? 'any[]' : valueType}>(${
      valueType === 'string' ? `'${initialValue}'` : initialValue
    });`;
  }

  generateVariableName(componentId: string, propsName: string, prefix: string): string {
    return `${propsName}${toPascal(prefix)}Of${toPascal(componentId)}`;
  }

  mergeImportInfo(source: IImportInfo, target: IImportInfo) {
    Object.entries(target).forEach(
      ([importPath, importInfo]: [
        string,
        {
          [key: string]: string[];
        }
      ]) => {
        if (!source[importPath]) {
          source[importPath] = {};
        }
        if (!source[importPath].default) {
          source[importPath].default = [];
        }
        importInfo?.default?.forEach(item => {
          if (!(source?.[importPath]?.default || []).includes(item)) {
            source?.[importPath]?.default.push(item);
          }
        });

        if (!source[importPath].object) {
          source[importPath].object = [];
        }
        importInfo?.object?.forEach(item => {
          if (!(source?.[importPath]?.object || []).includes(item)) {
            source?.[importPath]?.object.push(item);
          }
        });

        if (!source[importPath]['*']) {
          source[importPath]['*'] = [];
        }
        importInfo?.['*']?.forEach(item => {
          if (!(source?.[importPath]?.['*'] || []).includes(item)) {
            source?.[importPath]?.['*'].push(item);
          }
        });
      }
    );
  }

  useLiteralAssignment(value: any, valueType: string) {
    const basicValueTypes = ['string', 'number', 'boolean', 'undefined', 'null'];
    if (basicValueTypes.includes(valueType)) {
      return true;
    }
    return Object.values(value).every(item => basicValueTypes.includes(typeOf(item)));
  }

  // 生成 handler 函数定义，目前 handler 内部的调用代码还不能重构为不冗余的代码
  private generateHandlerInfo(propsValue: { action?: string; eventTrackingInfo?: string }, componentId: string, propsName: string) {
    const action = this.dsl.actions[propsValue.action];
    const result = {
      functionName: `handle${toPascal(toProgressive(propsName.replace(/on/i, '')))}Of${componentId}`,
      body: [],
      comments: ''
    };
    if (action) {
      const { type, options, desc } = action;
      result.comments = desc;
      const stateValue = (options as StateTransitionOption).value;
      const stateValueType = typeOf(stateValue);
      let stateValStr = undefined;
      switch (type) {
        case ActionType.STATE_TRANSITION:
          stateValStr = ['string', 'number', 'boolean'].includes(stateValueType)
            ? stateValueType !== 'string'
              ? stateValue
              : `'stateValue'`
            : this.tsCodeGenerator.generateObjectStrArr(stateValue).join(' ');
          result.body = [`set${toPascal((options as StateTransitionOption).name)}(${stateValStr});`];
          break;
        case ActionType.PAGE_DIRECTION:
        case ActionType.EXTERNAL_PAGE_OPEN:
          result.body = [
            `window.open('${(options as PageDirectionOption).url}', '${
              (options as PageDirectionOption).target || '_self'
            }');`
          ];
          break;
        case ActionType.HTTP_REQUEST:
          result.body =  [
            `const res = await ${generateHttpRequestFunctionName(
              (options as HttpActionOption).requestOpt.url,
              (options as HttpActionOption).requestOpt.method
            )}({});`
          ];
          break;
        default:
          break;
      }
    }
    if (propsValue.eventTrackingInfo) {
      result.body.push(`window._sendTrack({sa: '${propsValue.eventTrackingInfo}', sb: '${componentId}' })`);
    }

    return result;
  }
}
