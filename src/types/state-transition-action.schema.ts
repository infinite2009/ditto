import IActionSchema from '@/types/action.schema';
import { ComponentId, PropsId } from '@/types/index';
import ActionType from '@/types/action-type';

export default interface IStateTransitionActionSchema extends IActionSchema {
  payload: {
    target: ComponentId;
    props: Record<PropsId, { name: string; value: any }>;
  };
  type: ActionType.STATE_TRANSITION;
}
