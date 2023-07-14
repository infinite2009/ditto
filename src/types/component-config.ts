import React, { FC } from 'react';

export default interface IComponentConfig {
  component: FC;
  title: string;
  icon: React.Component | null;
  category: 'basic' | 'layer';
  propsConfig: {
    [key: string]: {
      name: string;
      initialValue?: any;
      category: 'basic' | 'style' | 'interaction';
    };
  };
}