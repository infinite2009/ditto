import ISchema from './schema';
import IComponentSchema from './component.schema';
import DynamicObject from '@/types/dynamic-object';
import IPropsSchema from '@/types/props.schema';
import { ComponentId, PropsId } from '@/types/index';
import IActionSchema from '@/types/action.schema';
import IEventSchema from '@/types/event.schema';
import IHandlerSchema from '@/types/handler.schema';
import { IHttpServiceSchema } from '@/types/http-service.schema';
import { Simulate } from 'react-dom/test-utils';
import keyDown = Simulate.keyDown;

export default interface IPageSchema extends ISchema {
  // 页面的总体介绍，用于写入代码文件的 desc 注释
  desc: string;
  // 页面名
  name: string;
  // 组件的属性
  props: {
    [key: ComponentId]: DynamicObject<IPropsSchema>;
  };
  // 页面的模板
  child: IComponentSchema;
  // 客户端存储
  storage?: DynamicObject;
  // 从 url 获取参数
  query?: DynamicObject<string>;
  // 后端接口调用可能存在复用，所以组件的 handler action 需要引用这里的服务
  httpService?: DynamicObject<IHttpServiceSchema>;
  // 动作函数：转移状态、变换和格式化数据（最好放到 BFF 层），调用服务
  actions?: DynamicObject<IActionSchema>;
  // 页面内的事件，页面载入、退出、滚动、周期性事件
  events?: {
    onload: IEventSchema;
    onunload: IEventSchema;
    interval: IEventSchema;
  };
  // 事件处理器
  handlers?: DynamicObject<IHandlerSchema>;
}
