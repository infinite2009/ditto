import { nanoid } from 'nanoid';
import { platform } from '@tauri-apps/api/os';
import ComponentFeature from '@/types/component-feature';
import {
  COPY_MENU,
  DELETE_MENU,
  HIDE_MENU,
  INSERT_MENU_FOR_CONTAINER,
  INSERT_MENU_FOR_ROOT,
  INSERT_MENU_FOR_SLOT,
  INSERT_MENU_FOR_SOLID,
  RENAME_MENU,
  SHOW_MENU
} from '@/data/constant';
import * as http from '@tauri-apps/api/http';
import { Body } from '@tauri-apps/api/http';
import AppStore from '@/service/app-store';

export function toUpperCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

export function createAsyncTask(task: (...args: any[]) => string) {
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
export function flattenObject(obj: any, prefix = ''): Record<string, any> {
  if (Array.isArray(obj)) {
    return obj.reduce((acc, item, index) => {
      const key = `${prefix}[${index}]`;
      return { ...acc, ...flattenObject(item, key) };
    }, {});
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      return { ...acc, ...flattenObject(value, newKey) };
    }, {});
  } else {
    return { [prefix]: obj };
  }
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
      return acc[key.split('[')[0]][index];
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
        return [[INSERT_MENU_FOR_ROOT], [RENAME_MENU]];
      }
      return [[RENAME_MENU]];
    case ComponentFeature.slot:
      if (hasCopiedComponent) {
        return [[INSERT_MENU_FOR_SLOT], [RENAME_MENU]];
      }
      return [[RENAME_MENU]];
    case ComponentFeature.container:
      if (hasCopiedComponent) {
        return [[COPY_MENU, INSERT_MENU_FOR_CONTAINER, RENAME_MENU], [visible ? HIDE_MENU : SHOW_MENU], [DELETE_MENU]];
      }
      return [[COPY_MENU, RENAME_MENU], [visible ? HIDE_MENU : SHOW_MENU], [DELETE_MENU]];
    case ComponentFeature.solid:
      if (hasCopiedComponent) {
        return [[COPY_MENU, INSERT_MENU_FOR_SOLID, RENAME_MENU], [visible ? HIDE_MENU : SHOW_MENU], [DELETE_MENU]];
      }
      return [[COPY_MENU, RENAME_MENU], [visible ? HIDE_MENU : SHOW_MENU], [DELETE_MENU]];
  }
}

export function isDifferent(a: any, b: any) {
  // 判断两个值的类型是否相同
  if (typeof a !== typeof b) return true;

  // 如果两个值都是对象（包括数组和普通对象）
  if (typeof a === 'object' && a !== null && b !== null) {
    // 获取两个对象的键
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    // 如果两个对象的键的数量不同，那么它们就是不同的
    if (keysA.length !== keysB.length) return true;

    // 检查每一个键，看看它们在两个对象中是否有相同的值
    for (const key of keysA) {
      if (isDifferent(a[key], b[key])) return true;
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
  const urlObj = new URL(url.startsWith('//') ? `http:${url}` : url);
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
  // 覆盖全局的 fetch 函数
  window.fetch = new Proxy(window.fetch, {
    apply: async function (target, thisArg, [url, options = {}]) {
      const loginStatus = await AppStore.checkLoginStatus();
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
      // 非http(s)请求，使用原生XHR对象
      for (const header in this.headers) {
        this.xhr.setRequestHeader(header, this.headers[header]);
      }
      this.xhr.open(this.method, this.url, this.async, this.user, this.password);
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
  let queryParameters: Record<string, string | number> = {};

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
