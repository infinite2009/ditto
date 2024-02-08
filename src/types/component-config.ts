import { FC } from 'react';
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
  icon: FC<any>;
  categories: string[];
  propsConfig: {
    [key: string]: IPropsConfigItem;
  };
  transformerStr?: PropsFormTransformer;
  children?: {
    name: string;
    value: IComponentSchema[] | string;
    /**
     * text：纯文本节点
     * template：模板节点，这种就是不能拖入组件，而是靠其他方式插入的
     * slot：插槽节点，用户将会在这个节点中拖入各种组件
     */
    type: 'text' | 'slot' | 'template';
    category: 'basic' | 'style' | 'interaction' | 'children' | 'hidden';
    // 禁用当前节点及其后代节点的可交互性，如果为 true，那么这些节点将无法选中和编辑
    notDraggable?: boolean;
  };
}
