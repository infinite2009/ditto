import IPageSchema from '@/types/page.schema';
import * as prettier from 'prettier/standalone';
import prettierConfig from '@/config/.prettierrc.json';
import * as babel from 'prettier/parser-babel';
import { RequiredOptions } from 'prettier';
import { BaseDirectory, exists, readDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/dialog';
import ReactCodeGenerator from '@/service/code-generator/react';
import TypeScriptCodeGenerator from '@/service/code-generator/typescript';
import * as typescript from 'prettier/parser-typescript';
import { createAsyncTask } from '@/util';
import AppData from '@/types/app-data';
import initialAppData from '@/config/app-data.json';
import { appDataDir, documentDir } from '@tauri-apps/api/path';

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


export async function saveAppData(data: Partial<{ currentFilePath : string; currentProject: string; recentProject: string }>) {
  const appDataPath = 'app-data.json';
  console.log('app data path: ', BaseDirectory.Data);
  const configText = await readTextFile(appDataPath, { dir: BaseDirectory.Data });
  let config: Partial<AppData> = {};
  if (configText) {
    config = JSON.parse(configText);
  }

  config.currentFilePath = data.currentFilePath || config.currentFilePath;

  config.currentProject = data.currentProject || config.currentProject;

  config.recentProjects = config.recentProjects || [];
  const index = config.recentProjects.findIndex(item => item === data.recentProject);
  if (index > -1) {
    config.recentProjects.splice(index, 1);
  }
  if (data.recentProject) {
    config.recentProjects.unshift();
  }

  writeTextFile(appDataPath, JSON.stringify(config), { dir: BaseDirectory.AppData });
}

export async function initAppData() {
  try {
    const appDataDir1 = await appDataDir();
    console.log('appDataDir: ', appDataDir1);
    const appDataPath = 'app-data.json';
    const doesExist = await exists(appDataPath, { dir: BaseDirectory.AppData });
    if (!doesExist) {
      const text = JSON.stringify(initialAppData);
      debugger;
      writeTextFile(appDataPath, text, { dir: BaseDirectory.AppData });
    }
  } catch (err) {
    console.error(err);
  }
}

export async function openProject() {
  const documentDirPath = await documentDir();
  const selected = await open({
    title: '打开文件夹',
    directory: true,
    defaultPath: documentDirPath
  }) as string;
  if (selected) {
    saveAppData({ recentProject: selected });
    generateProjectData(selected as string);
  }
}

export async function generateProjectData(projectPath: string) {
  const entries = await readDir(projectPath);
  debugger;
}
