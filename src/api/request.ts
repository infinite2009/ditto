import { customFetch } from '@/util';
import { http } from '@tauri-apps/api';
import { ResponseType } from '@tauri-apps/api/http';
import mitt from 'mitt';
import { Axios } from 'axios';

export type RequestConfig = any;

const defaultConfig = {
  baseURL: '/api',
  timeout: 30 * 1000,
  withCredentials: true,
}

const axios = new Axios(defaultConfig);

export const emitter = mitt();

const whiteListUrl = ['/api/ditto/common/proxy'];
const handleRes = async (res: http.Response<any>) => {
  const url = (res as any).config.url;
  if (whiteListUrl.some(i => i === url)) return res;
  if (url.indexOf('/api/ditto') > -1) {
    if (res.data && res.data?.code === 0) {
      return res.data;
    }
    return Promise.reject(res);
  }
  return res.data;
};

const handleError = (e: { message: string; data: { message: never; }; }) => {

  if(e.message !== "canceled") {
    emitter.emit('errorMessage', { content: e?.data?.message ?? '操作失败'});
  }
  return Promise.reject(e);
};

axios.get = async (url, config) => {
  return customFetch(`${defaultConfig.baseURL}${url}`, {
    ...config,
    method: 'GET',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    params: config.params,
    headers: config.headers,
    responseType: config.responseType === 'blob' ? ResponseType.Binary : undefined
  }).then(handleRes).catch(handleError) as any;
};

axios.delete = async (url, config) => {
  return customFetch(`${defaultConfig.baseURL}${url}`, {
    method: 'DELETE',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    params: config.params,
    headers: config.headers,
    responseType: config.responseType === 'blob' ? ResponseType.Binary : undefined
  }).then(handleRes).catch(handleError) as never;
};

axios.put = async (url, data, config) => {
  return customFetch(`${defaultConfig.baseURL}${url}`, {
    method: 'PUT',
    body: data as never,
    headers: config.headers,
    timeout: config.timeout,
    responseType: config.responseType === 'blob' ? ResponseType.Binary : undefined
  }).then(handleRes).catch(handleError) as never;
};

axios.post = async (url, data, config) => {
  return customFetch(`${defaultConfig.baseURL}${url}`, {
    method: 'POST',
    body: data as never,
    headers: config.headers,
    timeout: config.timeout,
    responseType: config.responseType === 'blob' ? ResponseType.Binary : undefined
  }).then(handleRes).catch(handleError) as never;
};

axios.postForm = async (url, data, config) => {
  return customFetch(`${defaultConfig.baseURL}${url}`, {
    method: 'POST',
    body: {
      ...data as any
    },
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config.headers
    },
    timeout: config.timeout,
    responseType: config.responseType === 'blob' ? ResponseType.Binary : undefined
  }).then(handleRes).catch(handleError) as any;
};

export default axios;
