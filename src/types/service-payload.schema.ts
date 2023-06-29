import DynamicObject from '@/types/dynamic-object';

export default interface IHttpServicePayload {
  headers?: DynamicObject;
  params?: DynamicObject;
  query?: DynamicObject;
  data?: DynamicObject;
}