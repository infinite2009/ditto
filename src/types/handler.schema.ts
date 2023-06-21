import ISchema from "@/types/schema";
import { ActionId } from '@/types/index';

/**
 * @file 事件响应函数定义，和事件是 1:n, 即一个事件只有一个 handler，但是一个 handler 可以用于多个事件
 * @description 还没有想好怎么用
 */
export default interface IHandlerSchema extends ISchema {
  name: string;
  desc: string;
  actionRefs: ActionId[];
  // 留个空位，先实现串行
  callType: 'callback' | 'sequence';
}
