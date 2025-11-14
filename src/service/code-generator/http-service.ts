import DynamicObject from '@/types/dynamic-object';

export interface IHttpServiceOptions {
  url: string;
  params: string[];
  method: 'GET' | 'HEAD' | 'OPTIONS' | 'POST' | 'PUT' | 'DELETE';
  body: DynamicObject;
  headers: DynamicObject;
}

export default class HttpService {

  generateAxiosInitialization() {
    // TODO
  }

  generateHttpServiceDefinition(opt: IHttpServiceOptions) {
    // TODO
  }
}