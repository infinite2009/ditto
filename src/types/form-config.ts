import { FC } from 'react';
import { StyleFormConfig } from '@/types/index';

export interface FormItemSchema {
  component: string;
  componentProps?: {
    [key: string]: any;
  };
  initialValue?: any;
  name: string;
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
    // 函数实现的字符串，输入是当前表单值，输出是属性需要的值，是否聚合还是由 type 决定。例如：(name, val) => { return val }
    funcStr: string;
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
    style?: StyleFormConfig;
    basic?: FormSchema;
    event?: FormSchema;
    data?: FormSchema;
  };
}
