import IPageSchema from '@/types/page.schema';
import * as prettier from 'prettier/standalone';
import prettierConfig from '@/config/.prettierrc.json';
import * as babel from 'prettier/parser-babel';
import { RequiredOptions } from 'prettier';
import { BaseDirectory, exists, FileEntry, readDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/dialog';
import ReactCodeGenerator from '@/service/code-generator/react';
import TypeScriptCodeGenerator from '@/service/code-generator/typescript';
import * as typescript from 'prettier/parser-typescript';
import AppData from '@/types/app-data';
import { documentDir, sep } from '@tauri-apps/api/path';
import VueCodeGenerator from './code-generator/vue';
import VueTransformer from './dsl-process/vue-transformer';
import cloneDeep from 'lodash/cloneDeep';
import { PropsId } from '@/types';
import { isEqual } from 'lodash';
import { createAsyncTask, fetchComponentConfig, getFileName } from '@/util';
import ActionType from '@/types/action-type';
import * as localforage from 'localforage';

interface EntryTree {
  key: string;
  title: string;
  children?: EntryTree[];
  isLeaf?: boolean;
}

const initialAppData = {
  currentFile: '',
  currentProject: '',
  openedFiles: [],
  openedProjects: [],
  recentProjects: []
};

class FileManager {
  // Danger: 不要改数据库的名字
  static db = localforage.createInstance({
    name: 'Ditto'
  });
  static APP_DATA_STORE_NAME = 'appData';
  private static instance = new FileManager();
  cache: AppData;
  appDataPath = 'appData.json';

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
    const simplifiedDSL = this.simplifyProps(dsl);
    const react = new ReactCodeGenerator(simplifiedDSL as unknown as IPageSchema, new TypeScriptCodeGenerator());
    const originalCodeContent = react.generatePageCode().join('\n');
    const formattedContent = await createAsyncTask(() =>
      prettier.format(originalCodeContent, {
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
    // try {
    //   const appDataPath = this.appDataPath;
    //   const doesExist = await exists(appDataPath, { dir: BaseDirectory.AppData });
    //   if (!doesExist) {
    //     const text = await createAsyncTask(() =>
    //       prettier.format(JSON.stringify(initialAppData), {
    //         ...prettierConfig,
    //         parser: 'json',
    //         plugins: [babel]
    //       } as unknown as Partial<RequiredOptions>)
    //     );
    //     await createDir('', { dir: BaseDirectory.AppData, recursive: true });
    //     writeTextFile(appDataPath, text, { dir: BaseDirectory.AppData });
    //   } else {
    //     const text = await readTextFile(appDataPath, { dir: BaseDirectory.AppData });
    //     this.cache = JSON.parse(text);
    //   }
    // } catch (err) {
    //   console.error(err);
    // }
    // TODO: read app data from database, if there is no data in db, assign initial data to cache
    try {
      const appData = await FileManager.db.getItem(FileManager.APP_DATA_STORE_NAME);
      this.cache = (appData as AppData) || initialAppData;
    } catch (err) {
      console.error(err);
    }
  }

  async saveAppData(data: Partial<AppData>) {
    try {
      Object.assign(this.cache, data);
      this.cache.recentProjects = this.cache.recentProjects || [];
      const index = this.cache.recentProjects.findIndex(item => item === data.currentProject);
      // 找到的话，就先剔除
      if (index > -1) {
        this.cache.recentProjects.splice(index, 1);
      }
      if (data.currentProject) {
        this.cache.recentProjects.unshift(data.currentProject);
      }
      await FileManager.db.setItem(FileManager.APP_DATA_STORE_NAME, this.cache);
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

  /**
   * 精简 dsl 的 props
   */
  private simplifyProps(dsl: IPageSchema) {
    const dslClone = cloneDeep(dsl);
    const { actions } = dslClone;
    const indexes = Object.values(dslClone.componentIndexes);
    indexes.forEach(componentSchema => {
      const { id: componentId, configName, name, dependency, propsRefs } = componentSchema;
      const { propsConfig } = fetchComponentConfig(configName || name, dependency);
      const propsDict = dslClone.props[componentId];
      propsRefs.forEach(ref => {
        const props = propsDict[ref];
        const actionPropsDict: Record<PropsId, { name: string; value: any }> = {};
        Object.values(actions).forEach(action => {
          if (action.type === ActionType.stateTransition && action.payload.target === componentId) {
            Object.assign(actionPropsDict, action.payload.props);
          }
        });
        // 如果 props 的值还是初始值，并且不是 状态转移类别的 action 涉及到的 props，就删除
        if (!actionPropsDict[props.name]) {
          if (isEqual(props.value, propsConfig[props.name].value)) {
            delete propsDict[props.name];
            const index = propsRefs.indexOf(props.name);
            if (index !== -1) {
              propsRefs.splice(index, 1);
            }
          } else if (props.name === 'style') {
            // 针对 style 要特殊处理
            const initialValue = propsConfig[props.name].value as Record<string, any>;
            Object.keys(initialValue).forEach(key => {
              if (props.value) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (initialValue[key] === props.value[key]) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  delete props.value[key];
                }
              }
            });
          }
        }
      });
    });
    return dslClone;
  }
}

const fileManager = FileManager.getInstance();

export function initAppData() {
  return fileManager.initAppData();
}

export function saveAppData(data: Partial<AppData>) {
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
