import { nanoid } from 'nanoid';
import { platform } from '@tauri-apps/api/os';
import ComponentFeature from '@/types/component-feature';
import {
  COPY_MENU,
  DELETE_MENU,
  EXPORT_COMPONENT_MENU,
  EXPORT_MODULE_MENU,
  HIDE_MENU,
  INSERT_MENU_FOR_CONTAINER,
  INSERT_MENU_FOR_ROOT,
  INSERT_MENU_FOR_SLOT,
  INSERT_MENU_FOR_SOLID,
  RENAME_MENU,
  REPLACE_WITH_BUSINESS_COMPONENT_MENU,
  SHOW_MENU
} from '@/data/constant';
import * as http from '@tauri-apps/api/http';
import { Body } from '@tauri-apps/api/http';
import AppStore from '@/service/app-store';
import { info } from '@/service/logging';
import axios from 'axios';

import DynamicObject from '@/types/dynamic-object';
import IPropsSchema from '@/types/props.schema';
import dayjs from 'dayjs';
import { toJS } from 'mobx';

export function toPascal(str: string): string {
  try {
    return str.charAt(0).toUpperCase() + str.slice(1);
  } catch (e) {
    return str;
  }
}

export function typeOf(value: any): string {
  const typeStr = Object.prototype.toString.call(value);
  const match = typeStr.match(/\[object (.+)\]/);
  if (match?.length) {
    return match[1].toLowerCase();
  }
  throw new Error(`unknown type: ${typeStr}`);
}

export function generateId() {
  return nanoid();
}

export function createAsyncTask<T = any>(task: (...args: any[]) => T) {
  return Promise.resolve(task).then(res => res());
}

export function getFileName(path: string) {
  return path.replace(/\.[^/.]+$/, '');
}

/**
 * 生成插槽的 id
 * @param nodeId
 * @param row
 * @param column
 */
export function generateSlotId(nodeId: string, row: number | string, column?: number | string) {
  if (column !== undefined && column !== null) {
    return `${nodeId}_template_${row}_${column}`;
  }
  return `${nodeId}_template_${row}`;
}

export function toProgressive(verb: string) {
  const lastChar = verb.slice(-1);
  const beforeLastChar = verb.slice(-2, -1);
  const vowels = ['a', 'e', 'i', 'o', 'u'];

  if (verb.toLowerCase() === 'ok') {
    return verb;
  }

  if (beforeLastChar === 'i' && lastChar === 'e') {
    return `${verb.slice(0, -2)}ying`;
  } else if (lastChar === 'e') {
    return `${verb.slice(0, -1)}ing`;
  } else if (!vowels.includes(beforeLastChar) && vowels.includes(lastChar)) {
    return `${verb}${lastChar}ing`;
  } else {
    return `${verb}ing`;
  }
}

export function hyphenToCamelCase(input: string) {
  return input.replace(/-([a-zA-Z])/g, function (match, group1) {
    return group1.toUpperCase();
  });
}

export function findNodePath(root: any, target: string, key = 'path'): string[] {
  if (root[key] === target) {
    return [root.key];
  }

  if (root?.children?.length) {
    for (const child of root.children) {
      const path = findNodePath(child, target, key);
      if (path.length) {
        if (root.key) {
          return [root.key, ...path];
        }
        return path;
      }
    }
  }

  return [];
}

export async function isMac() {
  const os = await platform();
  return os === 'darwin';
}

/**
 * 扁平化对象，得到所有属性的 keyPath
 *
 * @param obj
 * @param prefix
 */
export function flattenObject(obj, prefix = '') {
  const result = {};

  if (Array.isArray(obj)) {
    obj.forEach((value, index) => {
      const keyPath = `${prefix}[${index}]`;
      result[keyPath] = value; // 保留数组本身的路径
      if (typeof value === 'object' && value !== null) {
        Object.assign(result, flattenObject(value, keyPath)); // 递归展开
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const keyPath = prefix ? `${prefix}.${key}` : key;
      result[keyPath] = value; // 保留当前路径
      if (typeof value === 'object' && value !== null) {
        Object.assign(result, flattenObject(value, keyPath)); // 递归展开
      }
    }
  } else {
    result[prefix] = obj;
  }

  return result;
}

/**
 * 根据 keyPath 获取引用
 *
 * @param obj
 * @param keyPath
 */
export function getValueByPath(obj: any, keyPath: string) {
  if (keyPath === '') {
    return obj;
  }

  return keyPath.split('.').reduce((acc, key) => {
    if (key.includes('[')) {
      const index = key.match(/\[(\d+)\]/)[1];
      return acc[index];
    } else {
      return acc[key];
    }
  }, obj);
}

/**
 * 计算上级路径
 *
 * @param keyPath
 */
export function getParentKeyPath(keyPath: string) {
  const lastIndex = keyPath.lastIndexOf('.');
  if (lastIndex === -1) {
    return '';
  }
  const lastChar = keyPath[lastIndex - 1];
  if (lastChar === ']') {
    const startIndex = keyPath.lastIndexOf('[', lastIndex - 1);
    return keyPath.substring(0, startIndex);
  }
  return keyPath.substring(0, lastIndex);
}

export function generateContextMenus(
  feature: ComponentFeature = ComponentFeature.solid,
  visible = true,
  hasCopiedComponent = false
) {
  switch (feature) {
    case ComponentFeature.root:
      if (hasCopiedComponent) {
        return [[INSERT_MENU_FOR_ROOT], [RENAME_MENU], [EXPORT_MODULE_MENU], [REPLACE_WITH_BUSINESS_COMPONENT_MENU]];
      }
      return [[RENAME_MENU]];
    case ComponentFeature.slot:
      if (hasCopiedComponent) {
        return [[INSERT_MENU_FOR_SLOT], [RENAME_MENU], [EXPORT_MODULE_MENU], [REPLACE_WITH_BUSINESS_COMPONENT_MENU]];
      }
      return [[RENAME_MENU], [EXPORT_MODULE_MENU], [REPLACE_WITH_BUSINESS_COMPONENT_MENU]];
    case ComponentFeature.container:
      if (hasCopiedComponent) {
        return [
          [COPY_MENU, INSERT_MENU_FOR_CONTAINER, RENAME_MENU],
          [visible ? HIDE_MENU : SHOW_MENU],
          [DELETE_MENU],
          [EXPORT_COMPONENT_MENU],
          [EXPORT_MODULE_MENU],
          [REPLACE_WITH_BUSINESS_COMPONENT_MENU]
        ];
      }
      return [
        [COPY_MENU, RENAME_MENU],
        [visible ? HIDE_MENU : SHOW_MENU],
        [DELETE_MENU],
        [EXPORT_COMPONENT_MENU],
        [EXPORT_MODULE_MENU],
        [REPLACE_WITH_BUSINESS_COMPONENT_MENU]
      ];
    case ComponentFeature.solid:
      if (hasCopiedComponent) {
        return [
          [COPY_MENU, INSERT_MENU_FOR_SOLID, RENAME_MENU],
          [visible ? HIDE_MENU : SHOW_MENU],
          [DELETE_MENU],
          [EXPORT_MODULE_MENU],
          [REPLACE_WITH_BUSINESS_COMPONENT_MENU]
        ];
      }
      return [
        [COPY_MENU, RENAME_MENU],
        [visible ? HIDE_MENU : SHOW_MENU],
        [DELETE_MENU],
        [EXPORT_MODULE_MENU],
        [REPLACE_WITH_BUSINESS_COMPONENT_MENU]
      ];
    case ComponentFeature.blackBox:
      if (hasCopiedComponent) {
        return [
          [COPY_MENU, RENAME_MENU],
          [visible ? HIDE_MENU : SHOW_MENU],
          [DELETE_MENU],
          [EXPORT_MODULE_MENU],
          [REPLACE_WITH_BUSINESS_COMPONENT_MENU]
        ];
      }
      return [
        [COPY_MENU, RENAME_MENU],
        [visible ? HIDE_MENU : SHOW_MENU],
        [DELETE_MENU],
        [EXPORT_MODULE_MENU],
        [REPLACE_WITH_BUSINESS_COMPONENT_MENU]
      ];
    default:
      return [[EXPORT_MODULE_MENU], [REPLACE_WITH_BUSINESS_COMPONENT_MENU]];
  }
}

export function isDifferent(a: any, b: any) {
  // 判断两个值的类型是否相同
  if (typeof a !== typeof b) {
    return true;
  }

  // 如果两个值都是对象（包括数组和普通对象）
  if (typeof a === 'object' && a !== null && b !== null) {
    // 获取两个对象的键
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    // 如果两个对象的键的数量不同，那么它们就是不同的
    if (keysA.length !== keysB.length) {
      return true;
    }
    // 检查每一个键，看看它们在两个对象中是否有相同的值
    for (const key of keysA) {
      if (isDifferent(a[key], b[key])) {
        return true;
      }
    }

    // 如果所有的键都有相同的值，那么两个对象是相同的
    return false;
  }

  // 对于所有非对象的值，我们可以简单地检查它们是否相等
  return a !== b;
}

export function parsePadding(padding: number | string) {
  if (typeof padding === 'number') {
    return {
      paddingTop: padding,
      paddingRight: padding,
      paddingBottom: padding,
      paddingLeft: padding
    };
  }
  // 将输入字符串分割为数组
  const values = padding.split(' ');

  // 创建一个对象来存储解析后的值
  let parsedValues = {};

  // 根据数组的长度，解析 padding 值
  switch (values.length) {
    case 1: // 所有的边都有相同的值
      parsedValues = {
        top: parseInt(values[0]),
        right: parseInt(values[0]),
        bottom: parseInt(values[0]),
        left: parseInt(values[0])
      };
      break;
    case 2: // 上下边和左右边有相同的值
      parsedValues = {
        top: parseInt(values[0]),
        right: parseInt(values[1]),
        bottom: parseInt(values[0]),
        left: parseInt(values[1])
      };
      break;
    case 3: // 上边有一个值，左右边有相同的值，下边有一个值
      parsedValues = {
        top: parseInt(values[0]),
        right: parseInt(values[1]),
        bottom: parseInt(values[2]),
        left: parseInt(values[1])
      };
      break;
    case 4: // 每个边都有一个值
      parsedValues = {
        top: parseInt(values[0]),
        right: parseInt(values[1]),
        bottom: parseInt(values[2]),
        left: parseInt(values[3])
      };
      break;
    default: // 输入无效
      console.log('Invalid input');
      return;
  }

  // 返回解析后的值
  return parsedValues;
}

export function camelToSnake(str: string) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str: string) {
  return str.replace(/(_\w)/g, match => match[1].toUpperCase());
}

export function camelToHyphen(str: string) {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

function parseUrlEncodedNested(str: string) {
  const obj = {};

  str.split('&').forEach(pair => {
    let [key, value] = pair.split('=');
    key = decodeURIComponent(key);
    value = decodeURIComponent(value);

    // 检查是否存在嵌套
    const match = key.match(/([^[]+)\[([^\]]*)]/);
    if (match) {
      const [, parentKey, childKey] = match;
      if (!obj[parentKey]) {
        obj[parentKey] = {};
      }
      obj[parentKey][childKey] = value;
    } else {
      obj[key] = value;
    }
  });

  return obj;
}

function prepareBody(contentType: string, body: any) {
  if (contentType === 'application/json' && typeof body !== 'string') {
    return JSON.stringify(body);
  } else if (contentType === 'application/x-www-form-urlencoded') {
    if (typeof body === 'object') {
      return Body.form(body);
    }
    if (typeof body === 'string') {
      return Body.form(parseUrlEncodedNested(body));
    }
    return new URLSearchParams(body).toString();
  }
  return body; // 对于其他类型，如 'multipart/form-data' 或 'text/plain'，不做转换
}

function constructUrlWithQuery(url: string, optionsQueryParams: { [s: string]: string } | ArrayLike<string>) {
  // domain:bilibili.co 的证书不安全，所以降级为 http
  const urlObj = new URL(supplementProtocolForUrl(url));
  const urlQueryParams = new URLSearchParams(urlObj.search);

  if (optionsQueryParams) {
    for (const [key, value] of Object.entries(optionsQueryParams)) {
      urlQueryParams.set(key, value);
    }
  }

  urlObj.search = urlQueryParams.toString();
  return urlObj.toString();
}

export function proxyFetch() {
  if (!window.__TAURI__) {
    return;
  }
  // 覆盖全局的 fetch 函数
  window.fetch = new Proxy(window.fetch, {
    apply: async function (target, thisArg, [url, options = {}]) {
      const loginStatus = await AppStore.checkLoginStatusForDesktop();
      if (!loginStatus) {
        // TODO：发送登录失败的消息，并在原地进行重试
        return;
      }
      const contentType = options.headers
        ? options.headers['Content-Type'] || options.headers['content-type']
        : undefined;
      const body = contentType ? prepareBody(contentType, options.body) : options.body;
      const finalUrl = constructUrlWithQuery(url, options.query);
      const tauriOptions = {
        method: options.method || 'GET',
        headers: {
          ...(options.headers || {}),
          Cookie: `_AJSESSIONID=${loginStatus.sessionId};username=${loginStatus.accountName}`
        },
        body
      };

      try {
        // 使用 Tauri 的 http.fetch
        const response = await http.fetch(finalUrl, tauriOptions);
        return {
          ...response,
          json: () => Promise.resolve(response.data),
          text: () => Promise.resolve(JSON.stringify(response.data))
        };
      } catch (err) {
        console.error(err);
      }
    }
  });
}

export function proxyXHR() {
  if (!window.__TAURI__) {
    return;
  }
  const originalXHR = window.XMLHttpRequest;

  function TauriProxyXHR() {
    const xhrInstance = new originalXHR();
    this.xhr = xhrInstance;

    xhrInstance.onreadystatechange = () => {
      if (xhrInstance.readyState === 4) {
        this.status = xhrInstance.status;
        this.statusText = xhrInstance.statusText;
        this.responseText = xhrInstance.responseText;
        this.readyState = xhrInstance.readyState;
        if (this.onreadystatechange) {
          this.onreadystatechange();
        }
      }
    };
  }

  TauriProxyXHR.prototype.open = function (method, url, async, user, password) {
    this.method = method;
    this.url = url;
    this.async = async;
    this.user = user;
    this.password = password;
  };

  TauriProxyXHR.prototype.setRequestHeader = function (header, value) {
    if (!this.headers) {
      this.headers = {};
    }
    this.headers[header] = value;
  };

  TauriProxyXHR.prototype.getAllResponseHeaders = function () {
    return this.xhr.getAllResponseHeaders();
  };

  TauriProxyXHR.prototype.getResponseHeader = function (header) {
    return this.xhr.getResponseHeader(header);
  };

  TauriProxyXHR.prototype.send = function (body) {
    if (this.url.startsWith('http')) {
      // 如果是http(s)请求，则通过Tauri后端代理
      fetch(this.url, {
        method: this.method,
        body: body,
        headers: this.headers
      })
        .then(res => {
          // 代理请求成功，设置响应数据
          this.status = res.status;
          this.statusText = '';
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.responseText = res.data;
          this.readyState = 4;
          if (this.onload) {
            this.onload();
          }
        })
        .catch(err => {
          // 代理请求失败
          if (this.onerror) {
            this.onerror(err);
          }
        });
    } else {
      this.xhr.open(this.method, this.url, this.async, this.user, this.password);
      // 非http(s)请求，使用原生XHR对象
      for (const header in this.headers) {
        this.xhr.setRequestHeader(header, this.headers[header]);
      }
      this.xhr.send(body);
    }
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.XMLHttpRequest = TauriProxyXHR;
}

export function parseCustomProtocolUrl(url: string) {
  const urlParts = new URL(url);
  const protocol = urlParts.protocol.replace(':', '');
  const path = urlParts.pathname;
  const queryParameters: Record<string, string | number> = {};

  urlParts.searchParams.forEach((value, key) => {
    queryParameters[key] = value;
  });

  return {
    protocol,
    host: urlParts.host,
    path,
    queryParameters
  };
}

export function supplementProtocolForUrl(url: string, cacheDisabled = false) {
  const protocol = '';
  let urlWithProtocol = url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    urlWithProtocol = url;
  } else if (url.startsWith('//')) {
    urlWithProtocol = `http${url.indexOf('uat') > -1 ? '' : 's'}:${url}`;
  } else {
    urlWithProtocol = `http${url.indexOf('uat') > -1 ? '' : 's'}://${url}`;
  }
  if (cacheDisabled) {
    urlWithProtocol = `${urlWithProtocol}${urlWithProtocol.startsWith('?') ? '' : '?'}${
      urlWithProtocol.endsWith('?') ? '' : '&'
    }t=${new Date().getTime()}`;
  }
  return urlWithProtocol;
}

export async function customFetch<T = { code: number; data: any; message: string }>(
  url: string,
  options: http.FetchOptions | RequestInit = {}
): Promise<http.Response<T>> {
  if (isWeb()) {
    const notAuthorized = -101;
    const res = (await axios(url, {
      ...options,
      headers: {
        'X-CSRF': nanoid(),
        'x1-bilispy-color': 'dashboard',
        ...(options.headers || {})
      },
      data: options.body
    } as any)) as any;

    // VITE_DISABLE_UN_LOGIN_REDIRECT 在 env.local中配置，控制本地不进行重定向跳转
    if (res.data.code === notAuthorized && !import.meta.env.VITE_DISABLE_UN_LOGIN_REDIRECT) {
      console.log('window.location.href: ', window.location.href);
      if (process.env.NODE_ENV === 'prod') {
        window.location.href = `https://dashboard-mng.bilibili.co/login.html?caller=${getCaller()}&path=${
          window.location.pathname
        }${window.location.search}`;
      } else {
        window.location.href = 'http://alpha.dashboard.bilibili.co/login.html?caller=uat-voltron&path=/';
      }
      return res;
    } else {
      return res;
    }
  } else {
    if (AppStore.loginStatus) {
      const { sessionId, username } = AppStore.loginStatus;
      const timeBefore = new Date();
      const actuallyUrl = url.startsWith('http')
        ? url
        : `${(options as any)?.origin || 'https://uat-ee.bilibili.co'}${url}`;
      info(`Fetching ${actuallyUrl} starting: ${timeBefore}`);
      const optionsProcessed = {
        ...options,
        headers: {
          ...(options.headers || {}),
          account: username,
          'x1-bilispy-color': 'dashboard',
          'x-account': username,
          'X-CSRF': nanoid(),
          cookie: `_AJSESSIONID=${sessionId};username=${username};JSESSIONID=${sessionId}`
          // cookie: '_AJSESSIONID=6a5dd1eea2a2465ba92b486b53136353; JSESSIONID=C79EEBD6F1F58922119DE4788E24851A'
        }
      } as any;
      const bodyType = typeOf(options.body);
      const body: any = options.body;
      switch (bodyType) {
        case 'object':
          if (body.file) {
            const uint8Array = await fileToUint8Array(body.file as File);
            optionsProcessed.body = Body.form({
              ...body,
              file: {
                file: uint8Array,
                fileName: body.file.name,
                mime: body.file.type
              }
            });
          } else {
            optionsProcessed.body = Body.json(options.body as Record<string, any>);
          }
          break;
        case 'string':
          optionsProcessed.body = Body.text(options.body as string);
          break;
        case 'uint8array':
          optionsProcessed.body = Body.bytes(options.body as Uint8Array);
          break;
        default:
          optionsProcessed.body = options.body;
          break;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      optionsProcessed.query = options.params || {};
      delete optionsProcessed.params;
      const res = (await http.fetch(actuallyUrl, optionsProcessed)) as any;
      info(`Fetching ${actuallyUrl} ending: ${new Date().getTime() - timeBefore.getTime()}ms`);
      return res;
    }
    return Promise.reject('not authorized');
  }
}

/**
 * 判断输入是不是空对象
 * @param obj
 */
export function isEmpty(obj: Record<string, any>) {
  if (obj === undefined || obj === null) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

/**
 * 相对时间格式化
 *
 * @param date
 */
export function relativeTimeFormat(date: string | number) {
  const seconds = Math.round(
    typeOf(date) === 'number'
      ? (new Date().getTime() - (date as number)) / 1000
      : (new Date().getTime() - new Date(date).getTime()) / 1000
  );
  if (seconds <= 0) {
    return '刚刚';
  }
  if (seconds < 60) {
    return `${seconds}秒前`;
  }
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)}分钟前`;
  }
  if (seconds < 86400) {
    return `${Math.round(seconds / 3600)}小时前`;
  }
  if (seconds <= 14 * 86400) {
    return `${Math.round(seconds / 86400)}天前`;
  }
  return typeOf(date) === 'number' ? dayjs(date).format('YYYY-MM-DD') : (date as string).substring(0, 10);
}

export function generateHttpRequestFunctionName(path: string, method: string) {
  return `${method.toLowerCase()}${path
    .replace(/\{.+\}/, '')
    .split('/')
    .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
    .join('')}`;
}

export function proxyConsole() {
  window.console = new Proxy(console, {
    get: function (target, prop, receiver) {
      switch (prop) {
        case 'log':
        case 'warn':
        case 'error':
          return function (...args) {
            // 执行额外行为，比如记录日志或处理日志数据
            // console.log('Before logging:', new Date());

            // 调用原始的 console.log 方法，并传递参数
            // eslint-disable-next-line prefer-spread
            target[prop].apply(target, args);

            // TODO：发送日志到高达

            // 执行额外行为，比如记录日志或处理日志数据
            // console.log('After logging:', new Date());
          };
        default:
          return Reflect.get(target, prop, receiver);
      }
    }
  });
}

export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const arrayBuffer = event.target.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      resolve(uint8Array);
    };

    reader.onerror = function (event) {
      reject(new Error('File reading error'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export type GenDSLProps<FieldValue extends Record<string, any>> = {
  [key in keyof FieldValue]: IPropsSchema<FieldValue[key]>;
};

export default function getPropsValue(props: DynamicObject<IPropsSchema>) {
  return Object.fromEntries(Object.keys(props).map(i => [i, toJS(props[i]?.value)]));
}

export function isWeb() {
  return !window.__TAURI__;
}

export async function getPlatform() {
  if (isWeb()) {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.indexOf('win') > -1) {
      return 'win32';
    } else if (ua.indexOf('mac') > -1) {
      return 'darwin';
    }
    return 'unknown';
  }
  return await platform();
}

export function stringToFile(str: string, fileName: string, contentType = 'text/plain') {
  const blob = new Blob([str], {
    type: contentType
  });
  return new File([blob], fileName, {
    type: contentType
  });
}

export function getCaller() {
  // if (!isWeb()) {
  if (window.location.host.startsWith('ee')) {
    return 'ee';
  }
  if (window.location.host.startsWith('pre-ee')) {
    return 'pre-ee';
  }
  return 'uat-ee';
  // }
  // error('isUat 方法仅支持在浏览器端运行');
  // return 'uat-ee';
}

export function findComponentRoot(dom: HTMLElement) {
  let node = dom;
  while (node) {
    if (node.dataset) {
      const { voltronComponent } = node.dataset;
      if (voltronComponent) {
        return node;
      }
    }
    node = node.parentNode as HTMLElement;
  }
}

export * from './tree';
