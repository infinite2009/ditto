import { FC } from 'react';

export interface FormItemSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  title: string;
  required?: boolean;
  component: string;
  componentProps?: {
    [key: string]: any;
  };
  initialValue?: any;
  // 这个 form 配置项将合并到哪个 props 上，此时该 props 是一个对象，如果没有这个配置，则不进行合并
  propsToCompose?: string;
}

export interface FormSchema {
  [key: string]: FormItemSchema;
}

export default interface IFormConfig {
  configName: string;
  schema?: {
    style?: {
      [key: string]: boolean | FormItemSchema;
    };
    basic?: FormSchema;
    event?: FormSchema;
    data?: FormSchema;
  };
  formComponent?: {
    style?: FC<any>;
    basic?: FC<any>;
    event?: FC<any>;
    data?: FC<any>;
  };
}
