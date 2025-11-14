import ISchema from './schema';
import ActionType from '@/types/action-type';
import { ComponentId } from '@/types/index';

export interface HttpActionOption {
  name?: string;
  requestOpt: {
    data: Record<string, any>;
    headers: Record<string, string>;
    method: 'GET' | 'PATCH' | 'PUT' | 'POST' | 'DELETE';
    params: Record<string, string | number>;
    url: string;
  };
}

export interface StateTransitionOption {
  name: string;
  // 如果 useFunction 为真，则 value 是一个函数的定义字符串，该函数的返回值作为状态的值。
  useFunction?: boolean;
  value: any;
}

export interface PageDirectionOption {
  target: 'blank' | 'self';
  url: string;
}

export default interface IActionSchema extends ISchema {
  // 描述，用于函数的注释
  desc: string;
  // 动作 id
  id: string;
  // 动作名称
  name: string;
  // relatedComponentIds: string[];
  options: StateTransitionOption | PageDirectionOption | HttpActionOption | { target: ComponentId };
  // 调用了这个动作的组件，组件通过事件关联到指定的动作，如果组件被删除，可以通过这个属性进行关联性的删除，防止空引用
  // 动作类型
  type: ActionType;
}
