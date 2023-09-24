import IActionSchema from '@/types/action.schema';
import ActionType from '@/types/action-type';

export default interface IHttpRequestActionSchema extends IActionSchema {
  type: ActionType.httpRequest;
  payload: {
    headers?: Record<string, any>;
    params?: Record<string, any>;
    query?: Record<string, any>;
    data?: Record<string, any>;
  };
}
