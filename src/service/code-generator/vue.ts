import IPageSchema from '@/types/page.schema';
import { toUpperCase, typeOf } from '@/util';
import TypeScriptCodeGenerator, {
  IConstantOptions,
  IFunctionOptions,
  IImportOptions
} from '@/service/code-generator/typescript';
import IComponentSchema from '@/types/component.schema';
import { ImportType } from '@/types';
import IPropsSchema from '@/types/props.schema';
import ReactCodeGenerator, { IDSLStatsInfo, IPropsOptions, ITSXOptions, IUseCallbackOptions, IUseEffectOptions, IUseMemoOptions, IUseRefOptions, IUseStateOptions } from './react';
import ComponentSchemaRef from '@/types/component-schema-ref';


export default class VueCodeGenerator extends ReactCodeGenerator {
  constructor(dsl: IPageSchema, tsCodeGenerator: TypeScriptCodeGenerator) {
    super(dsl, tsCodeGenerator);
    this.dsl = dsl;
    this.tsCodeGenerator = tsCodeGenerator;
  }

  dsl: IPageSchema;

  tsCodeGenerator: TypeScriptCodeGenerator;

  /**
   * @override
   */
  generatePropsStrWithLiteral(opt: IPropsOptions): string {
    const { name, variableType, value } = opt;

    // 插槽属性 TODO 待优化 使用variableType = 'slotName'
    if (name.startsWith('#') && value == '') {
      return `${name}`;
    }
    if (variableType === 'string') {
      return `${name}="${value}"`;
    }
    return `:${name}="${value}"`;
  }
  /**
   * @override
   */
  generatePropAssignmentExpWithVariable(opt: IPropsOptions): string {
    const { name, variableName } = opt;
    return `:${name}="${variableName}"`;
  }
  /**
   * @override
   */
  generateUseEffect(opt: IUseEffectOptions): string[] {
    const { handlerCallingSentence, dependencies } = opt;
    const result: string[] = [];
    const dependenciesStr = this.generateDependenciesSentence(dependencies);
    // const computedStr = `computed(() => {
    //   return ${dependenciesStr}
    // })`;
    const useEffectHeadStr = `watch(${dependenciesStr},() => {`;
    result.push(useEffectHeadStr);
    result.push(handlerCallingSentence);
    const tailSentence = `}, {immediate: true});`;
    result.push(tailSentence);
    return result;
  }
  /**
   * @override
   */
  generateUseState(opt: IUseStateOptions): string {
    const { initialValue, valueType, name } = opt;
    return `const ${name} = ref<${valueType === 'array' ? 'any[]' : valueType}>(${
      valueType === 'string' ? `'${initialValue}'` : initialValue
    });`;
  }
  /**
   * @override
   */
  generateUseMemo(opt: IUseMemoOptions) {
    const { handlerCallingSentence, dependencies } = opt;
    const result: string[] = [];
    const useEffectHeadStr = 'computed(() => {';
    result.push(useEffectHeadStr);
    result.push(`return ${handlerCallingSentence}`);
    // const dependenciesStr = this.generateDependenciesSentence(dependencies);
    const tailSentence = `});`;
    result.push(tailSentence);
    return result;
  }


  // TODO 半成品，需要 DSL 补充函数类 props 的签名
  generateUseCallback(opt: IUseCallbackOptions) {
    return this.generateUseMemo(opt);
  }
  /**
   * @override
   */
  generateUseRef(opt: IUseRefOptions) {
    const { initialValueStr, valueType, name } = opt;
    return `const ${name}Ref = ref<${valueType}>(${
      valueType === 'string' ? `'${initialValueStr}'` : initialValueStr
    });`;
  }
  analysisTemplate(
    templateRef: ComponentSchemaRef,
    propsDict: {
      [key: string]: { [key: string]: IPropsSchema };
    }
  ) {
    const { componentIndexes } = this.dsl;
    const template = componentIndexes[templateRef.current];
    const result: Partial<IDSLStatsInfo> = {
      importInfo: {
        vue: {
          object: []
        }
      },
      stateInfo: {},
      memoInfo: {},
      callbackInfo: {},
      effectInfo: {},
      constantInfo: {},
      tsxInfo: {
        componentName: template.callingName || template.name,
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
        const node = componentIndexes[nodeRef.current];
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
            propsRefs = [],
            children = [],
            id
          } = node as IComponentSchema;

          // 提取导入信息
          if (dependency && dependency !== 'html') {
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
          if (pNode) {
            pNode.componentName = callingName || name;
            // 处理当前节点的 props
            if (propsDict[id]) {
              const { importInfo, propsStrArr, stateInfo, callbackInfo, memoInfo, effectInfo, constantInfo } =
                this.analysisProps(propsDict, propsRefs, node as IComponentSchema);
              pNode.propsStrArr = propsStrArr;
              // 将每个组件节点的 stateInfo 合并到 result 中，通过命名系统避免 state 重名，callback，memo，effect 亦然
              Object.assign(result.stateInfo as object, stateInfo);
              Object.assign(result.callbackInfo as object, callbackInfo);
              Object.assign(result.memoInfo as object, memoInfo);
              Object.assign(result.effectInfo as object, effectInfo);
              Object.assign(result.constantInfo as object, constantInfo);
              if (result.importInfo) {
                const { object } = result.importInfo.vue;
                if (Object.entries(effectInfo).length && !object.includes('watch')) {
                  object.push('watch');
                }
                if (Object.entries(stateInfo).length && !object.includes('ref')) {
                  object.push('ref');
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
            pNode.children = children.map(() => {
              return {
                componentName: '',
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

  analysisProps(
    propsDict: { [key: string]: { [key: string]: IPropsSchema } },
    propsRefs: string[],
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
      constantInfo: {}
    };

    const { id: componentId } = component;

    const componentPropsDict = propsDict[componentId];

    propsRefs.forEach(ref => {
      const props = componentPropsDict[ref];
      // 找不到的 ref 跳过
      if (!props) {
        return;
      }
      const { value, valueType, valueSource, isValue, templateKeyPathsReg = [], name } = props;
      const basicValueTypes = ['string', 'number', 'boolean'];
      // 基础类型固定值走字面，其他情况走变量（常量、state、memo、callback）
      if (valueSource === 'editorInput') {
        if (basicValueTypes.includes(valueType)) {
          result.propsStrArr.push(
            this.generatePropsStrWithLiteral({
              name: ref,
              value: value.toString(),
              variableType: valueType
            })
          );
        } else {
          if (templateKeyPathsReg.length) {
            const variableName = this.generateVariableName(componentId, name, 'const');
            result.propsStrArr.push(
              this.generatePropAssignmentExpWithVariable({
                name: ref,
                variableName,
                variableType: valueType
              })
            );

            // 模板使用嵌套
            if (result.constantInfo) {
              result.constantInfo[variableName] = {
                name: variableName,
                value: this.tsCodeGenerator.generateObjectStrArr(
                  value,
                  templateKeyPathsReg,
                  (val: ComponentSchemaRef, wrapper: string[] = [], insertIndex = 0) => {
                    const { tsxInfo, importInfo, effectInfo, constantInfo, memoInfo, callbackInfo, stateInfo } =
                      this.analysisTemplate(val, propsDict);
                    // 合并统计分析
                    Object.assign(result.stateInfo as object, stateInfo);
                    Object.assign(result.callbackInfo as object, callbackInfo);
                    Object.assign(result.memoInfo as object, memoInfo);
                    Object.assign(result.effectInfo as object, effectInfo);
                    Object.assign(result.constantInfo as object, constantInfo);
                    if (importInfo) {
                      // 合并 hooks
                      const { object } = importInfo.vue;
                      if (
                        result.effectInfo &&
                        Object.entries(result.effectInfo).length &&
                        !object.includes('watch')
                      ) {
                        object.push('watch');
                      }
                      if (result.stateInfo && Object.entries(result.stateInfo).length && !object.includes('ref')) {
                        object.push('ref');
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
                      const tsxSentences = this.generateTSX(tsxInfo);
                      // 这里如果存在 wrapper ，则按照插入索引的位置，插入 tsx 代码
                      if (wrapper.length) {
                        const cp = [...wrapper];
                        cp.splice(insertIndex, 0, ...tsxSentences);
                        return cp;
                      }
                      return tsxSentences;
                    }
                    return [];
                  }
                )
              };
            }
          } else {
            const variableName = this.generateVariableName(componentId, name, 'state');
            result.propsStrArr.push(
              this.generatePropAssignmentExpWithVariable({
                name: ref,
                variableName,
                variableType: valueType
              })
            );
            // 变量需要转为 state
            if (result.stateInfo) {
              result.stateInfo[variableName] = {
                name: variableName,
                initialValue: this.tsCodeGenerator.generateObjectStrArr(value).join(' '),
                valueType
              };
            }
          }
        }
      } else if (valueSource === 'handler') {
        // TODO: 生成 useCallback
        const variableName = this.generateVariableName(componentId, name, 'state');
        if (result.callbackInfo) {
          result.callbackInfo[variableName] = {
            dependencies: [],
            handlerCallingSentence: `() => { console.log('useCallback ${variableName} works!'); }`
          };
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
      } else {
        const variableName = this.generateVariableName(componentId, name, 'state');
        result.propsStrArr.push(
          this.generatePropAssignmentExpWithVariable({
            name: ref,
            variableName,
            variableType: valueType
          })
        );
        // 使用状态的变量
        if (result.stateInfo) {
          result.stateInfo[variableName] = {
            name: variableName,
            initialValue: basicValueTypes.includes(valueType)
              ? value
              : this.tsCodeGenerator.generateObjectStrArr(value).join(' '),
            valueType
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
    return result;
  }
  /**
   * @override
   */
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

    // import react -> import vue
    // importInfo.vue = {
    //   default: [],
    //   object: importInfo.react.object.map(name => {
    //     const map = {
    //       useEffect: 'watch',
    //       useState: 'useState'
    //     };
    //     return map[name as keyof typeof map];
    //   })
    // };
    // console.log(importInfo.react);
    // delete importInfo.react;

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
        ...Object.values(constantInfo)
          .map(i =>
            this.tsCodeGenerator.generateAssignment({
              variableName: i.name,
              expressions: i.value
            })
          )
          .flat(2)
      ]
    };
    let template: string[] = [] as string[];
    if (tsxInfo === null) {
      template = [`<template></<template>`];
    } else {
      // template.push('<template>');
      // template = template.concat(this.generateTSX(tsxInfo));
      // template.push('</template>');
      result.push('<template>');
      result = result.concat(this.generateTSX(tsxInfo));
      result.push('</template>');
    }
    // result = result.concat(this.tsCodeGenerator.generateFunctionDefinition(functionInfo as IFunctionOptions));
    result.push(`<script lang="ts" setup>`);
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
    result = result.concat(functionInfo.body);
    result.push(`</script>`);

    return result;
  }

}
