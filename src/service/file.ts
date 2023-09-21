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
import { createAsyncTask, getFileName } from '@/util';
import AppData from '@/types/app-data';
import initialAppData from '@/config/app-data.json';
import { documentDir, sep } from '@tauri-apps/api/path';
import VueCodeGenerator from './code-generator/vue';
import VueTransformer from './dsl-process/vue-transformer';

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

  async exportVuePageCodeFile(filePath: string, dsl: IPageSchema) {
    const vueDslTransformer = new VueTransformer(dsl as unknown as IPageSchema);
    const vue = new VueCodeGenerator(vueDslTransformer.transformDsl(), new TypeScriptCodeGenerator());
    const formattedContent = await createAsyncTask(() =>
      prettier.format(vue.generatePageCode().join('\n'), {
        ...prettierConfig,
        parser: 'vue',
        plugins: [typescript]
      } as unknown as Partial<RequiredOptions>)
    );
    await writeTextFile(filePath, formattedContent, { dir: BaseDirectory.Document });
  }

  async initAppData() {
    try {
      const appDataPath = this.appDataPath;
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

  async saveAppData(
    data: Partial<{
      currentFile: string;
      currentProject: string;
      recentProjects: string;
      openedFiles: string[];
    }>
  ) {
    try {
      const appDataPath = this.appDataPath;
      const configText = await readTextFile(appDataPath, { dir: BaseDirectory.AppData });
      let config: Partial<AppData> = {};
      if (configText) {
        config = JSON.parse(configText);
      }

      Object.assign(config, data);

      config.recentProjects = config.recentProjects || [];
      const index = config.recentProjects.findIndex(item => item === data.currentProject);
      // 找到的话，就先剔除
      if (index > -1) {
        config.recentProjects.splice(index, 1);
      }
      if (data.currentProject) {
        config.recentProjects.unshift(data.currentProject);
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
      await this.saveAppData({ currentProject: selected });
    }
  }

  async fetchProjectData() {
    if (!this.cache.currentProject) {
      return [];
    }
    const doesExist = await exists(this.cache.currentProject);
    if (!doesExist) {
      return [];
    }

    const entries: FileEntry[] = await readDir(this.cache.currentProject, { recursive: true });

    const files: string[] = [];

    const recursiveMap = (entries: FileEntry[]) => {
      return entries
        .filter(entry => (entry.name as string).endsWith('.ditto') || entry.children)
        .map(entry => {
          const r: EntryTree = {
            key: entry.path,
            title: getFileName(entry.name as string)
          };
          files.push(entry.path);
          if (entry.children) {
            r.children = recursiveMap(entry.children);
          } else {
            r.isLeaf = true;
          }
          return r;
        });
    };

    const arr = this.cache.currentProject.split(sep);
    const projectName = arr[arr.length - 1];
    const project = {
      name: projectName,
      path: this.cache.currentProject,
      children: entries
    };

    const result = recursiveMap([project]);
    this.cache.openedFiles = this.cache.openedFiles.filter(f => files.includes(f));
    this.saveAppData({
      openedFiles: this.cache.openedFiles
    });
    return result;
  }

  async closeOpenedFile(file: string) {
    const index = this.cache.openedFiles.findIndex(item => item === file);
    if (this.cache.openedFiles.length && index > -1) {
      if (index === 0) {
        this.cache.currentFile = this.cache.openedFiles[1];
      } else {
        this.cache.currentFile = this.cache.openedFiles[index - 1];
      }
      this.cache.openedFiles.splice(index, 1);
      await this.saveAppData({
        currentFile: this.cache.currentFile,
        openedFiles: this.cache.openedFiles
      });
    }
  }

  fetchOpenedFiles() {
    return this.cache.openedFiles;
  }

  fetchCurrentFile() {
    return this.cache.currentFile;
  }

  openFile(file: string): Promise<string> | undefined {
    this.cache.currentFile = file;
    if (!this.cache.openedFiles.includes(file)) {
      this.cache.openedFiles.push(file);
    }
    this.saveAppData({
      openedFiles: this.cache.openedFiles,
      currentFile: this.cache.currentFile
    });
    return readTextFile(file);
  }

  selectFile(file: string): Promise<string> {
    this.cache.currentFile = file;
    this.saveAppData({
      currentFile: this.cache.currentFile
    });
    return readTextFile(file);
  }
}

const fileManager = FileManager.getInstance();

export function initAppData() {
  return fileManager.initAppData();
}

export function saveAppData(
  data: Partial<{
    currentFile: string;
    currentProject: string;
    recentProjects: string;
    openedFiles: string[];
  }>
) {
  return fileManager.saveAppData(data);
}

export function generateProjectData() {
  return fileManager.fetchProjectData();
}

export function openProject() {
  return fileManager.openProject();
}

export function exportReactPageCodeFile(filePath: string, dsl: IPageSchema) {
  return fileManager.exportReactPageCodeFile(filePath, dsl);
}

export function exportVuePageCodeFile(filePath: string, dsl: IPageSchema) {
  return fileManager.exportVuePageCodeFile(filePath, dsl);
}

export function savePageDSLFile(filePath: string, dsl: IPageSchema) {
  return fileManager.savePageDSLFile(filePath, dsl);
}

export function closeOpenedFile(file: string) {
  return fileManager.closeOpenedFile(file);
}

export function fetchCurrentFile() {
  return fileManager.fetchCurrentFile();
}

export function fetchOpenedFiles() {
  return fileManager.fetchOpenedFiles();
}

export function openFile(file: string) {
  return fileManager.openFile(file);
}

export function selectFile(file: string) {
  return fileManager.selectFile(file);
}
