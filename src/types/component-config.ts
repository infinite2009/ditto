import React, { FC } from 'react';

export default interface IComponentConfig {
  name: string;
  component: FC<any>;
  dependency: string;
  isContainer?: boolean;
  title: string;
  icon: React.ForwardRefExoticComponent<any> | null;
  category: 'basic' | 'layer';
  propsConfig: {
    [key: string]: {
      name: string;
      initialValue?: any;
      category: 'basic' | 'style' | 'interaction';
      disabled?: boolean;
    };
  };
}