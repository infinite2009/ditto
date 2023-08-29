import { nanoid } from 'nanoid';
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import componentConfig from '@/data/component-dict';
import IPageSchema from '@/types/page.schema';

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

export function fetchComponentConfig(name: string, dependency: string) {
  return componentConfig[dependency][name];
}

export async function saveFile(filePath: string, dsl: IPageSchema) {
  if (filePath === undefined) {
    // TODO: 创建一个新文件
    await writeTextFile(filePath, JSON.stringify(dsl), { dir: BaseDirectory.Document } );
  } else {
    // TODO: 保存一个已有文件
  }
}
