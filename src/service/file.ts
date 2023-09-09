import IPageSchema from '@/types/page.schema';
import * as prettier from 'prettier/standalone';
import prettierConfig from '@/config/.prettierrc.json';
import * as babel from 'prettier/parser-babel';
import { RequiredOptions } from 'prettier';
import { BaseDirectory, createDir, exists, FileEntry, readDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/dialog';
import ReactCodeGenerator from '@/service/code-generator/react';
import TypeScriptCodeGenerator from '@/service/code-generator/typescript';
import * as typescript from 'prettier/parser-typescript';
import { createAsyncTask } from '@/util';
import AppData from '@/types/app-data';
import initialAppData from '@/config/app-data.json';
import { appDataDir, documentDir } from '@tauri-apps/api/path';

interface EntryTree {
  key: string;
  title: string;
  children?: EntryTree[];
  isLeaf?: boolean;
}

class FileManager {
  private static instance = new FileManager();
  cache: AppData;
  appDataPath = 'appData.json';

  private constructor() {
    this.cache = initialAppData;
  }

  static getInstance() {
    return FileManager.instance;
  }

  async savePageDSLFile(filePath: string, dsl: IPageSchema) {
    const formattedContent = await createAsyncTask(() =>
      prettier.format(JSON.stringify(dsl), {
        ...prettierConfig,
        parser: 'json',
        plugins: [babel]
      } as unknown as Partial<RequiredOptions>)
    );
    await writeTextFile(filePath, formattedContent, { dir: BaseDirectory.Document });
  }

  async exportReactPageCodeFile(filePath: string, dsl: IPageSchema) {
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

  async initAppData() {
    try {
      const appDataPath = this.appDataPath;
      await appDataDir();
      const doesExist = await exists(appDataPath, { dir: BaseDirectory.AppData });
      if (!doesExist) {
        const text = await createAsyncTask(() =>
          prettier.format(JSON.stringify(initialAppData), {
            ...prettierConfig,
            parser: 'json',
            plugins: [babel]
          } as unknown as Partial<RequiredOptions>)
        );
        await createDir('', { dir: BaseDirectory.AppData, recursive: true });
        writeTextFile(appDataPath, text, { dir: BaseDirectory.AppData });
      } else {
        const text = await readTextFile(appDataPath, { dir: BaseDirectory.AppData });
        this.cache = JSON.parse(text);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async saveAppData(data: Partial<{ currentFilePath: string; currentProject: string; recentProject: string }>) {
    try {
      const appDataPath = this.appDataPath;
      const configText = await readTextFile(appDataPath, { dir: BaseDirectory.AppData });
      let config: Partial<AppData> = {};
      if (configText) {
        config = JSON.parse(configText);
      }

      config.currentFilePath = data.currentFilePath || config.currentFilePath;

      config.currentProject = data.currentProject || config.currentProject;

      config.recentProjects = config.recentProjects || [];
      const index = config.recentProjects.findIndex(item => item === data.recentProject);
      // 找到的话，就先剔除
      if (index > -1) {
        config.recentProjects.splice(index, 1);
      }
      if (data.recentProject) {
        config.recentProjects.unshift(data.recentProject);
      }

      this.cache = Object.assign(this.cache, config);
      writeTextFile(appDataPath, JSON.stringify(config), { dir: BaseDirectory.AppData });
    } catch (err) {
      console.error(err);
    }
  }

  async openProject() {
    const documentDirPath = await documentDir();
    const selected = (await open({
      title: '打开文件夹',
      directory: true,
      defaultPath: documentDirPath
    })) as string;
    if (selected) {
      await this.saveAppData({ recentProject: selected, currentProject: selected });
    }
  }

  async generateProjectData() {
    if (!this.cache.currentProject) {
      return [];
    }
    const doesExist = await exists(this.cache.currentProject);
    if (!doesExist) {
      return [];
    }

    const entries: FileEntry[] = await readDir(this.cache.currentProject, { recursive: true });

    function recursiveMap(entries: FileEntry[]) {
      return entries
        .filter(entry => (entry.name as string).endsWith('.ditto') || entry.children)
        .map(entry => {
          const r: EntryTree = {
            key: entry.path,
            title: (entry.name as string).replace(/\.[^/.]+$/, '')
          };
          if (entry.children) {
            r.children = recursiveMap(entry.children);
          } else {
            r.isLeaf = true;
          }
          return r;
        });
    }

    return recursiveMap(entries);
  }
}

const fileManager = FileManager.getInstance();

export function initAppData() {
  return fileManager.initAppData();
}

export function generateProjectData() {
  return fileManager.generateProjectData();
}

export function openProject() {
  return fileManager.openProject();
}

export function exportReactPageCodeFile(filePath: string, dsl: IPageSchema) {
  return fileManager.exportReactPageCodeFile(filePath, dsl);
}

export function savePageDSLFile(filePath: string, dsl: IPageSchema) {
  return fileManager.savePageDSLFile(filePath, dsl);
}
