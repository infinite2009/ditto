import ISchema from '@/types/schema';

export interface IHttpServiceSchema extends ISchema {
  url: string;
  method: 'GET' | 'HEAD' | 'OPTIONS' | 'PUT' | 'DELETE' | 'POST';
}