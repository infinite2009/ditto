import IActionSchema from '@/types/action.schema';

export default interface IHttpRequestActionSchema extends IActionSchema {
  type: 'httpRequest';
  payload: {
    headers?: Record<string, any>;
    params?: Record<string, any>;
    query?: Record<string, any>;
    data?: Record<string, any>;
  };
}
