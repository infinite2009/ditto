import { nanoid } from 'nanoid';
import { BaseDirectory, writeTextFile } from '@tauri-apps/api/fs';
import * as prettierConfig from '@/config/.prettierrc.json';
import * as prettier from 'prettier/standalone';
import * as babel from 'prettier/parser-babel';
import componentConfig from '@/data/component-dict';
import IPageSchema from '@/types/page.schema';
import { RequiredOptions } from 'prettier';

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

export function createAsyncTask(task: () => string) {
  return Promise.resolve(task).then(res => res());
}

export async function saveFile(filePath: string, dsl: IPageSchema) {
  const formattedContent = await createAsyncTask(() => prettier.format(JSON.stringify(dsl), {
    ...prettierConfig,
    parser: 'json',
    plugins: [babel]
  } as unknown as Partial<RequiredOptions>));
  await writeTextFile(filePath, formattedContent, { dir: BaseDirectory.Document });
}
