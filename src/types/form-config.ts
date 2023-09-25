import { FC } from 'react';

export interface FormSchema {
  type: 'object';
  properties: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      title: string;
      required?: boolean;
      component: string;
      componentProps?: {
        [key: string]: any;
      };
      initialValue?: any;
    };
  };
}

export default interface IFormConfig {
  configName: string;
  schema?: {
    style: FormSchema;
    basic: FormSchema;
    event: FormSchema;
    data: FormSchema;
  };
  formComponent?: {
    style: FC<any>;
    basic: FC<any>;
    event: FC<any>;
    data: FC<any>;
  };
}
