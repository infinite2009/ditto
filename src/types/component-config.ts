import React, { FC } from 'react';
import IComponentSchema from '@/types/component.schema';
import IPropsSchema from '@/types/props.schema';
import { PropsFormTransformer } from '@/types/form-config';

export interface IPropsConfigItem extends IPropsSchema {
  disabled?: boolean;
}

export default interface IComponentConfig {
  // 隐藏组件配置
  isHidden?: boolean;
  configName: string;
  // 此等优先级
  importName?: string;
  // 不生成导入语句
  noImport?: boolean;
  // 最高优先级
  callingName?: string;
  component: FC<any> | string;
  dependency: string;
  // 是否是图层类组件，默认为 false
  isLayer?: boolean;
  isContainer?: boolean;
  title: string;
  icon: React.ForwardRefExoticComponent<any> | null;
  category: string;
  propsConfig: {
    [key: string]: IPropsConfigItem;
  };
  transformerStr?: PropsFormTransformer;
  children?: {
    name: string;
    value: IComponentSchema[] | string;
    type: 'text' | 'placeholder' | 'slot';
    category: 'basic' | 'style' | 'interaction' | 'children' | 'hidden';
  };
}
