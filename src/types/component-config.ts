import React from 'react';

export default interface IComponentConfig {
  component: React.Component;
  title: string;
  icon: React.Component;
  category: 'basic' | 'layer';
  propsConfig: {
    [key: string]: {
      name: string;
      initialValue?: any;
      category: 'basic' | 'style' | 'interaction';
    };
  };
}