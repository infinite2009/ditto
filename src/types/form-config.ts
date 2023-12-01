import { FC } from 'react';

export interface FormItemSchema {
  name: string;
  component: string;
  componentProps?: {
    [key: string]: any;
  };
  initialValue?: any;
  // // 这个 form 配置项将合并到哪个 props 上，此时该 props 是一个对象，如果没有这个配置，则不进行合并
  // propsToCompose?: string;
  // 如果有这个
  propsMapping?: {
    // props 的名字
    name: string;
    /*
     * 映射的类型：parallel 表示平行映射，就是说当前 form 表单值就是一个props，
     * aggregation 表示聚合映射，就是说当前的表单值是目标 props 的一个属性
     */
    type: 'parallel' | 'aggregation';
  };
  required?: boolean;
  title: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

export interface FormSchema {
  [key: string]: FormItemSchema;
}

export default interface IFormConfig {
  configName: string;
  formComponent?: {
    style?: FC<any>;
    basic?: FC<any>;
    event?: FC<any>;
    data?: FC<any>;
  };
  schema?: {
    style?: {
      [key: string]: boolean | FormItemSchema | Record<string, any>;
    };
    basic?: FormSchema;
    event?: FormSchema;
    data?: FormSchema;
  };
}
