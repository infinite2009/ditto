import ISchema from './schema';
import IComponentSchema from './component.schema';
import DynamicObject from "@/types/dynamic-object";
import IPropsSchema from '@/types/props.schema';
import { ComponentId } from '@/types/index';
import IActionSchema from '@/types/action.schema';
import IEventSchema from '@/types/event.schema';

export default interface IPageSchema extends ISchema {
  // 页面的总体介绍，用于写入代码文件的 desc 注释
  desc: string;
  // 页面名
  name: string;
  // 组件的属性
  props: {
    [key: ComponentId]: {
      // 基础属性
      basicProps: DynamicObject<IPropsSchema>;
      // 样式属性
      styleProps: DynamicObject<IPropsSchema>;
      // 事件属性
      eventProps: DynamicObject<IPropsSchema>;
      // 高级属性
      advancedProps: DynamicObject<IPropsSchema>;
      // 子节点（个别组件的其他 props 和 children 是冲突的）
      children?: any[];
    }
  };
  // 页面的模板
  children: IComponentSchema[];
  // 客户端存储
  storage: DynamicObject;
  // 从 url 获取参数
  query: DynamicObject<string>;
  // 后端接口调用可能存在复用，所以组件的 handler action 需要引用这里的服务
  service: DynamicObject;
  // 动作函数：转移状态、变换和格式化数据（最好放到 BFF 层），调用服务
  actions: DynamicObject<IActionSchema>;
  events: DynamicObject<IEventSchema>
}
