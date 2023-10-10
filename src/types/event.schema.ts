/**
 * @file 页面事件 DSL，组件的事件由组件开发者维护
 */
import ISchema from '@/types/schema';
import { HandlerId } from '@/types/index';
import EventTrigger from '@/types/event-trigger';

export default interface IEventSchema extends ISchema {
  triggerType: EventTrigger;
  handlerRef: HandlerId;
}
