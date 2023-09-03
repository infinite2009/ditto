import React, { FC } from 'react';
import IComponentSchema from '@/types/component.schema';
import IPropsSchema from '@/types/props.schema';

export interface IPropsConfigItem extends IPropsSchema {
  category: 'basic' | 'style' | 'interaction' | 'children';
  disabled?: boolean;
}

export default interface IComponentConfig {
  configName: string;
  // 此等优先级
  importName?: string;
  // 最高优先级
  callingName?: string;
  component: FC<any> | string;
  dependency: string;
  isContainer?: boolean;
  title: string;
  icon: React.ForwardRefExoticComponent<any> | null;
  category: 'basic' | 'layer';
  propsConfig: {
    [key: string]: IPropsConfigItem;
  };
  children?: {
    name: string;
    value: IComponentSchema[] | string;
    category: 'basic' | 'style' | 'interaction' | 'children';
    disabled?: boolean;
  };
}
