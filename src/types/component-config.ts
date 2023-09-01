import React, { FC } from 'react';
import IComponentSchema from '@/types/component.schema';

export default interface IComponentConfig {
  name: string;
  component: FC<any> | string;
  dependency: string;
  isContainer?: boolean;
  title: string;
  icon: React.ForwardRefExoticComponent<any> | null;
  category: 'basic' | 'layer';
  propsConfig: {
    [key: string]: {
      name: string;
      initialValue?: any;
      category: 'basic' | 'style' | 'interaction' | 'children';
      disabled?: boolean;
    };
  };
  children?: {
    name: string;
    initialValue: IComponentSchema[] | string;
    category: 'basic' | 'style' | 'interaction' | 'children';
    disabled?: boolean;
  };
}