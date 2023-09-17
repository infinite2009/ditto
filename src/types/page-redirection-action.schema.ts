import IActionSchema from '@/types/action.schema';

export default interface IPageRedirectionActionSchema extends IActionSchema {
  type: 'pageRedirection';
  payload: {
    href: string;
    target: '_blank' | '_self';
  };
}
