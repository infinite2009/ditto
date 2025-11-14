import {FC} from 'react';

/**
 * 转换函数的字符串，入参是所有表单项的值（对象形式）values。 返回一个对象，对象的每一个属性对应一个表单项。 Voltron 会使用这个字符串生成转换函数进行调用，请确保它只进行数据转换，没有额外的副作用，以避免产生意外的行为。
 * 非必选，如果没有，则认为将表单项的值直接传给 props
 */
export type PropsFormTransformer = string;

export interface FormItemSchema {
  component: string | FC<any>;
  componentProps?:
    | {
        [key: string]: any;
      }
    | ((data: Record<string, any>) => {
        [key: string]: any;
      });
  disabled?: boolean | (() => boolean);
  /** 描述信息 */
  help?: string | React.ReactNode;
  initialValue?: any;
  name: string;
  // 这个 form 配置项将合并到哪个 props 上，此时该 props 是一个对象，如果没有这个配置，则不进行合并
  propsToCompose?: string;
  // 当值改变是是否强制重新渲染组件
  reRenderWhenChange?: boolean;
  required?: boolean;
  title: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  valueTransform?: (value: any) => any;
}

export interface FormSchema {
  [key: string]: FormItemSchema;
}

/**
 * 样式表单配置，目前是不支持自定义的，按需传入配置即可。
 * boolean 表示启用当前配置全部功能，比如 layout: true 表示会启用layout 的所有功能：尺寸、方向、对齐、边距等
 */
export type StyleFormConfig = {
  layout?:
    | {
        width?: boolean;
        height?: boolean;
        wrap?: boolean | { wrap?: boolean; nowrap?: boolean };
        direction?: { row?: boolean; column?: boolean } | boolean;
        alignItems?: boolean;
        justifyContent?: boolean;
        padding?: boolean;
        // TODO
        margin?: boolean;
        gap?: boolean;
      }
    | boolean;
  backgroundColor?: boolean;
  border?:
    | {
        borderWidth?: boolean;
        borderColor?: boolean;
        borderStyle?: boolean;
        borderRadius?: boolean;
      }
    | boolean;
  shadow?: boolean;
  text?:
    | {
        // 字号和行高
        size?: boolean;
        color?: boolean;
        decoration?: boolean;
      }
    | boolean;
};

export default interface IFormConfig {
  configName: string;
  divider?: {
    basic?: boolean;
  };
  events?: boolean;
  formComponent?: {
    style?: FC<any>;
    basic?: FC<any>;
  };
  noData?: boolean;
  schema?: {
    style?: StyleFormConfig;
    basic?: FormSchema;
    event?: Record<string, { name: string; title: string; component: string | FC<any> }>;
  };
  transformerStr?: PropsFormTransformer;
  // 需要忽略的属性，配合 transformerStr 使用，把转换过的属性都删除掉，避免出现非预期行为
  valuesToIgnore?: string[];
}
