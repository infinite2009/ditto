import IActionSchema from '@/types/action.schema';
import ActionType from '@/types/action-type';

export default interface IPageRedirectionActionSchema extends IActionSchema {
  payload: {
    href: string;
    target?: '_blank' | '_self';
    isExternal: boolean;
  };
  type: ActionType.PAGE_DIRECTION;
}
