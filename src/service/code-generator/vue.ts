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
import ReactCodeGenerator, { IDSLStatsInfo, IImportInfo, IPropsOptions, ITSXOptions, IUseCallbackOptions, IUseEffectOptions, IUseMemoOptions, IUseRefOptions, IUseStateOptions } from './react';
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
    const { name, variableName, variableType } = opt;
    if (name.startsWith('#')) {
      return `${name}`;
    }
    if (name.startsWith('v-')) {
      return `${name}="${variableName}"`;
    }
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
  generateCamelotRegister(importInfo: IImportInfo) {
    const newImportInfo = {
      '@camelot/rsc-register': {
        object: ['register']
      }
    } as IImportInfo;
    // delete importInfo.camelot;
    return newImportInfo;
  }
  generateVueImportInfo(importInfo: IImportInfo) {
    const newImportInfo =  {
      'vue': {
        default: [],
        object: importInfo.react.object.map(name => {
          const map = {
            useEffect: 'watch',
            useState: 'ref'
          };
          return map[name as keyof typeof map];
        })
      }
    } as IImportInfo;

    delete importInfo.react;
    return newImportInfo;
  }
  generateCamelotImportSentence(importNames: string[]) {
    const regiterListStr = importNames.map((name) => {
      return `{ name: '${name.slice(2)}', version: 'last', env: 'uat'}`;
    }).join(',');
    return `register([${regiterListStr}])`;
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

    Object.assign(importInfo, this.generateVueImportInfo(importInfo));
    Object.assign(importInfo, this.generateCamelotRegister(importInfo));

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

        if (importPath === 'camelot') {
          // 暂时忽略，最后处理
          return;
        } 
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
    // 异步加载/注册 camelot组件
    if (importInfo.camelot) {
      const importSentence = this.generateCamelotImportSentence(importInfo.camelot.object);
      if (importSentence) {
        result.push(importSentence);
      }
    }
    result = result.concat(functionInfo.body);
    result.push(`</script>`);

    return result;
  }
  
}
