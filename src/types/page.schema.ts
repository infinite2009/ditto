import ISchema from './schema';
import IComponentSchema from './component.schema';
import DynamicObject from '@/types/dynamic-object';
import IPropsSchema from '@/types/props.schema';
import { ActionId, ComponentId } from '@/types/index';
import IActionSchema from '@/types/action.schema';
import IEventSchema from '@/types/event.schema';
import { IHttpServiceSchema } from '@/types/http-service.schema';
import ComponentSchemaRef from '@/types/component-schema-ref';

export type BusinessReplacementRef = string;

export type VariableInfo = { desc: string; name: string; type: 'boolean' | 'number' | 'array' | 'object' | 'string'; key: string; initialValue: boolean | string | number | [] | object };

export default interface IPageSchema extends ISchema {
  // 动作函数：转移状态、变换和格式化数据（最好放到 BFF 层），调用服务
  actions: Record<ActionId, IActionSchema>;
  // 替换用的业务组件、模块
  businessReplacement: {
    [key: BusinessReplacementRef]: IComponentSchema;
  };
  // 页面的模板
  child: ComponentSchemaRef;
  // 组件索引
  componentIndexes: Record<ComponentId, IComponentSchema>;
  // 组件数量统计，用来生成合适的组件ID
  componentStats: Record<string, number>;
  // 页面的总体介绍，用于写入代码文件的 desc 注释
  desc: string;
  // 页面内的事件，页面载入、退出、滚动、周期性事件会挂载到 page root 上
  events: Record<ComponentId, IEventSchema[]>;
  // 以组件 id 为 key 的脚本，运行时的返回值传递给组件
  hooks: Record<ComponentId, string>;
  // 后端接口调用可能存在复用，所以组件的 handler action 需要引用这里的服务
  httpService?: DynamicObject<IHttpServiceSchema>;
  // 页面名
  name: string;
  // 组件的属性
  props: {
    [key: ComponentId]: DynamicObject<IPropsSchema>;
  };
  // 从 url 获取参数
  query?: DynamicObject<string>;
  // 客户端存储
  storage?: DynamicObject;
  // 状态表，记录页面中用到的所有的状态，条件渲染、数据源、组件 props 值
  variableDict?: Record<string, VariableInfo>;
}
