/**
 * @file 页面事件 DSL，组件的事件由组件开发者维护
 */
import ISchema from '@/types/schema';
import { ComponentId } from '@/types/index';
import EventTrigger from '@/types/event-trigger';

export default interface IEventSchema extends ISchema {
  trigger: EventTrigger;
  // 绑定事件的组件 id
  componentId: ComponentId;
  // 动作列表
  actionList: string[];
  // handlerRef: HandlerId;
}
