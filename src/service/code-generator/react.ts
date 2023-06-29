import IPageSchema from '@/types/page.schema';

export interface IPropsOptions {
  name: string;
  variableName: string;
  variableType: string;
  variableValueSource: 'fixed' | 'dataSource' | 'calculation';
}

export default class ReactCodeGenerator {
  constructor(dsl: IPageSchema) {
    this.dsl = dsl;
  }

  dsl: IPageSchema;

  generateTSX(opt: ITSXOptions): string[] {
    const result: string[] = [];



    return result;
  }

  generatePropsStr(opt: IPropsOptions): string {
    const { name, variableName, variableType} = opt;
    if (variableType === 'function') {
      return `${name}={(...args) => ${variableName}(...args)}`;
    }
    return `${name}={${variableName}}`;
  }
}