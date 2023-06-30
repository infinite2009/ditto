import IPageSchema from '@/types/page.schema';
import { toUpperCase, typeOf } from '@/util';
import { s } from '@tauri-apps/api/path-f8d71c21';

export interface ITSXOptions {
  componentName: string;
  propsStrArr?: string[];
  children?: ITSXOptions[];
}

export interface IPropsOptions {
  name: string;
  variableName: string;
  variableType: string;
  variableValueSource: 'fixed' | 'dataSource' | 'calculation';
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

export default class ReactCodeGenerator {
  constructor(dsl: IPageSchema) {
    this.dsl = dsl;
  }

  dsl: IPageSchema;

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

  generatePropStr(opt: IPropsOptions): string {
    const { name, variableName, variableType } = opt;
    if (variableType === 'function') {
      return `${name}={(...args) => ${variableName}(...args)}`;
    }
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
}
