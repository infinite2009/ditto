import IActionSchema from '@/types/action.schema';
import { ComponentId } from '@/types/index';

/**
 * 控制组件的显隐，用来处理那些组件本身没有显隐控制的情况，不适用于 modal, drawer 这种类型的组件
 */
export default interface IVisibilityActionSchema extends IActionSchema {
  type: 'visibilityToggle';
  payload: {
    target: ComponentId;
  };
}
