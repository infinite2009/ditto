import { nanoid } from 'nanoid';
import componentConfig from '@/data/component-dict';
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

export function fetchComponentConfig(configName: string, dependency: string) {
  return componentConfig[dependency][configName];
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
  visible: boolean = true,
  hasCopiedComponent: boolean = false
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
