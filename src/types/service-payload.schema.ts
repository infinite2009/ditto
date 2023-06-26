import ISchema from '@/types/schema';
import DynamicObject from '@/types/dynamic-object';

export default interface IServicePayload extends ISchema {
  method: 'GET' | 'HEAD' | 'OPTIONS' | 'PUT' | 'DELETE' | 'POST';
  headers: DynamicObject;
  params: DynamicObject;
  query: DynamicObject;
  data: DynamicObject;
}