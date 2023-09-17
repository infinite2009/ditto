import IActionSchema from '@/types/action.schema';
import { ComponentId, PropsId } from '@/types/index';

export default interface IStateTransitionActionSchema extends IActionSchema {
  type: 'stateTransition';
  payload: {
    target: ComponentId;
    props: Record<PropsId, { name: string; value: any }>;
  };
}
