import IActionSchema from '@/types/action.schema';
import ActionType from '@/types/action-type';

export default interface IPageRedirectionActionSchema extends IActionSchema {
  type: ActionType.pageRedirection;
  payload: {
    href: string;
    target?: '_blank' | '_self';
    isExternal: boolean;
  };
}
