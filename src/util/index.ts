import { nanoid } from 'nanoid';
import { BaseDirectory, writeTextFile } from '@tauri-apps/api/fs';
import * as prettierConfig from '@/config/.prettierrc.json';
import * as prettier from 'prettier/standalone';
import * as babel from 'prettier/parser-babel';
import * as typescript from 'prettier/parser-typescript';
import componentConfig from '@/data/component-dict';
import IPageSchema from '@/types/page.schema';
import { RequiredOptions } from 'prettier';
import ReactCodeGenerator from '@/service/code-generator/react';
import TypeScriptCodeGenerator from '@/service/code-generator/typescript';

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

export async function savePageDSLFile(filePath: string, dsl: IPageSchema) {
  const formattedContent = await createAsyncTask(() =>
    prettier.format(JSON.stringify(dsl), {
      ...prettierConfig,
      parser: 'json',
      plugins: [babel]
    } as unknown as Partial<RequiredOptions>)
  );
  await writeTextFile(filePath, formattedContent, { dir: BaseDirectory.Document });
}

export async function exportReactPageCodeFile(filePath: string, dsl: IPageSchema) {
  const react = new ReactCodeGenerator(dsl as unknown as IPageSchema, new TypeScriptCodeGenerator());
  const formattedContent = await createAsyncTask(() =>
    prettier.format(react.generatePageCode().join('\n'), {
      ...prettierConfig,
      parser: 'typescript',
      plugins: [typescript]
    } as unknown as Partial<RequiredOptions>)
  );
  await writeTextFile(filePath, formattedContent, { dir: BaseDirectory.Document });
}
