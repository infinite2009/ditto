import IPageSchema from '@/types/page.schema';
import * as prettier from 'prettier/standalone';
import prettierConfig from '@/config/.prettierrc.json';
import * as babel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import { RequiredOptions } from 'prettier';
import { BaseDirectory, createDir, exists, FileEntry, readDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { open } from '@tauri-apps/api/dialog';
import ReactCodeGenerator from '@/service/code-generator/react';
import TypeScriptCodeGenerator from '@/service/code-generator/typescript';
import * as typescript from 'prettier/parser-typescript';
import AppData, { ProjectInfo } from '@/types/app-data';
import { basename, dirname, documentDir, extname, homeDir, join, sep } from '@tauri-apps/api/path';
import VueCodeGenerator from './code-generator/vue';
import VueTransformer from './dsl-process/vue-transformer';
import cloneDeep from 'lodash/cloneDeep';
import { PropsId } from '@/types';
import { isEqual } from 'lodash';
import { createAsyncTask, fetchComponentConfig, getFileName } from '@/util';
import ActionType from '@/types/action-type';
import * as localforage from 'localforage';
import { nanoid } from 'nanoid';
import DSLStore from '@/service/dsl-store';
import { Command } from '@tauri-apps/api/shell';
import { Platform, platform } from '@tauri-apps/api/os';

interface EntryTree {
  children?: EntryTree[];
  isLeaf?: boolean;
  key: string;
  name: string;
  path: string;
  title: string;
}

const initialCache = {
  currentProject: '',
  recentProjects: {},
  pathToProjectDict: {}
};

class FileManager {
  static APP_DATA_STORE_NAME = 'appData';
  static RECENT_PROJECTS_STORE_NAME = 'recentProjects';
  // Danger: 不要改数据库的名字
  static appDataStore = localforage.createInstance({
    name: 'Ditto',
    storeName: FileManager.APP_DATA_STORE_NAME
  });
  static recentProjectsStore = localforage.createInstance({
    name: 'Ditto',
    storeName: FileManager.RECENT_PROJECTS_STORE_NAME
  });
  private static instance = new FileManager();
  appDataPath = 'appData.json';
  cache: AppData = {} as AppData;
  os: Platform;

  constructor() {
    platform().then(res => {
      this.os = res;
    });
  }

  static getInstance() {
    return FileManager.instance;
  }

  private static async generateNewFileName(directory: string) {
    const fileName = '未命名页面';
    const ext = '.ditto';
    if (!(await exists(`${directory}${sep}${fileName}${ext}`))) {
      return `${fileName}${ext}`;
    }
    let suffix = 1;
    let whetherExists = false;
    do {
      whetherExists = await exists(`${directory}${sep}${fileName} ${suffix}${ext}`);
      if (whetherExists) {
        suffix++;
      }
    } while (whetherExists);
    return `${fileName} ${suffix}${ext}`;
  }

  /**
   * 根据输入字符串生成一个同目录下的文件夹副本的名字，永不重复
   * @param folderName
   * @param baseDir
   * @private
   */
  private static async generateNewFolderName(
    folderName: string,
    baseDir: BaseDirectory = BaseDirectory.Document
  ): Promise<string> {
    let newFolderName = folderName;
    let suffix = 0;
    let whetherExists = false;
    do {
      whetherExists = await exists(newFolderName, { dir: baseDir });
      if (whetherExists) {
        suffix++;
        newFolderName = `${folderName} ${suffix}`;
      }
    } while (whetherExists);
    return newFolderName;
  }

  private static async generateNewPath(pathName: string, baseDir: string) {
    // TODO: 需要扩展为支持同时支持目录和文件
    try {
      const isDirectory = FileManager.isDirectory(pathName);
      const ext = isDirectory ? '' : await extname(pathName);
      // 去掉没有前缀的文件名或者目录名
      const pathnameWithoutExt = await basename(pathName, ext ? `.${ext}` : '');
      let newPathName = pathName;
      let suffix = 0;
      let whetherExists = false;
      do {
        whetherExists = await exists(await join(baseDir, newPathName));
        if (whetherExists) {
          suffix++;
          newPathName = `${pathnameWithoutExt} ${suffix}${ext ? `.${ext}` : ''}`;
        }
      } while (whetherExists);
      return newPathName;
    } catch (err) {
      console.error(err);
    }
  }

  private static async isDirectory(path: string) {
    const testInfo = await new Command('isDirectory', ['-d', path]).execute();
    return testInfo.code !== 1;
  }

  private static async moveToTrash(path: string) {
    try {
      await new Command('mv', [path, await join(await homeDir(), '.Trash')]).execute();
      return 0;
    } catch (err) {
      console.error(err);
      return 1;
    }
  }

  async addDirectory(parentPath: string, name: string) {
    try {
      return createDir(await join(parentPath, name));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async addFile(parentPath: string, name: string, content = '') {
    try {
      return await writeTextFile(await join(parentPath, name), content);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async closeProject(projectId: string) {
    const projectInfo = (await FileManager.recentProjectsStore.getItem(projectId)) as ProjectInfo;
    projectInfo.isOpen = false;
    await FileManager.recentProjectsStore.setItem(projectId, projectInfo);
    this.cache.recentProjects[projectId] = projectInfo;
    if (projectId === this.cache.currentProject) {
      await FileManager.appDataStore.removeItem('currentProject');
      this.cache.currentProject = '';
    }
  }

  async copyProject(project: ProjectInfo): Promise<ProjectInfo | null> {
    try {
      const documentPath = await documentDir();
      const folder = await FileManager.generateNewFolderName(project.path.split(sep).pop() as string);
      const cpPath = await join(documentPath, folder);
      const log = await new Command('cp', ['-r', project.path, cpPath]).execute();
      const projectCp = {
        id: nanoid(),
        name: folder,
        path: cpPath,
        lastModified: new Date().getTime(),
        isOpen: false,
        openedFile: ''
      };
      await FileManager.recentProjectsStore.setItem(projectCp.id, projectCp);
      // 更新缓存
      this.cache.recentProjects[projectCp.id] = projectCp;
      this.cache.pathToProjectDict[projectCp.path] = projectCp;
      return projectCp;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async createNewDirectory(parentPath: string) {
    const folder = '未命名文件夹';
    if (!(await exists(`${parentPath}${sep}${folder}`))) {
      await createDir(`${parentPath}${sep}${folder}`);
      return;
    }
    let suffix = 0;
    let whetherExists = false;
    do {
      whetherExists = await exists(`${parentPath}${sep}${folder} ${suffix}`);
      if (whetherExists) {
        suffix++;
      }
    } while (whetherExists);
    await createDir(`${parentPath}${sep}${folder} ${suffix}`);
  }

  /**
   * @param directory 绝对路径
   */
  async createNewPage(directory: string) {
    const dslStoreService = new DSLStore();
    const fileName = await FileManager.generateNewFileName(directory);
    dslStoreService.createEmptyDSL(fileName, '');
    const filePath = await join(directory, fileName);
    await writeTextFile(filePath, JSON.stringify(dslStoreService.dsl));
  }

  /**
   * 创建一个新项目，需要用户选择文件夹
   */
  async createProject(): Promise<ProjectInfo | null> {
    try {
      const folder = await FileManager.generateNewFolderName('未命名文件夹');
      await createDir(folder, { dir: BaseDirectory.Document });
      const documentPath = await documentDir();
      const projectPath = await join(documentPath, folder);
      await this.createNewPage(projectPath);
      const project = {
        id: nanoid(),
        name: folder,
        path: projectPath,
        lastModified: new Date().getTime(),
        isOpen: false,
        openedFile: ''
      };
      await FileManager.recentProjectsStore.setItem(project.id, project);
      this.cache.recentProjects[project.id] = project;
      this.cache.pathToProjectDict[project.path] = project;
      return project;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async deleteFileOrFolder(path: string) {
    if (!(await exists(path))) {
      return;
    }
    await FileManager.moveToTrash(path);
  }

  async deleteProject(project: ProjectInfo, deleteFolder = false): Promise<void> {
    try {
      const tasks = [FileManager.recentProjectsStore.removeItem(project.id)];
      if (project.id === this.cache.currentProject) {
        tasks.push(FileManager.appDataStore.removeItem('currentProject'));
      }
      await Promise.all(tasks);
      delete this.cache.recentProjects[project.id];
      delete this.cache.pathToProjectDict[project.path];
      if (deleteFolder) {
        await FileManager.moveToTrash(project.path);
      }
    } catch (err) {
      console.error(err);
    }
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
        plugins: [typescript, parserHtml]
      } as unknown as Partial<RequiredOptions>)
    );
    await writeTextFile(filePath, formattedContent, { dir: BaseDirectory.Document });
  }

  fetchCurrentProjectId() {
    return this.cache.currentProject;
  }

  fetchOpenedProjects() {
    const result: Record<string, ProjectInfo> = {};
    (Object.values(this.cache.recentProjects) as unknown as ProjectInfo[]).forEach((project: ProjectInfo) => {
      if (project.isOpen) {
        result[project.id] = project;
      }
    });
    return result;
  }

  async fetchProjectData() {
    if (!this.cache.currentProject) {
      return [];
    }
    const currentProjectPath = this.cache.recentProjects[this.cache.currentProject].path;
    const doesExist = await exists(currentProjectPath);
    if (!doesExist) {
      return [];
    }

    const entries: FileEntry[] = await readDir(currentProjectPath, { recursive: true });

    const recursiveMap = (entries: FileEntry[], parentKey: string) => {
      return entries
        .filter(entry => (entry.name as string).endsWith('.ditto') || entry.children)
        .map((entry, index) => {
          const r: EntryTree = {
            key: parentKey ? `${parentKey}-${index}` : index.toString(),
            path: entry.path,
            name: entry.name as string,
            title: getFileName(entry.name as string)
          };
          if (entry.children) {
            r.children = recursiveMap(entry.children, r.key);
          } else {
            r.isLeaf = true;
          }
          return r;
        });
    };

    const arr = currentProjectPath.split(sep);
    const projectName = arr[arr.length - 1];
    const project = {
      name: projectName,
      path: currentProjectPath,
      children: entries
    };
    return recursiveMap([project], '');
  }

  fetchProjectInfo(projectId: string) {
    return this.cache.recentProjects[projectId];
  }

  /**
   * 获取用户的全部项目
   */
  async fetchRecentProjects(): Promise<ProjectInfo[]> {
    if (Object.keys(this.cache.recentProjects).length > 0) {
      return Object.values(this.cache.recentProjects);
    }
    const recentProjects: ProjectInfo[] = [];
    await FileManager.recentProjectsStore.iterate(val => {
      recentProjects.push(val as ProjectInfo);
      this.cache.pathToProjectDict[(val as ProjectInfo).path] = val as ProjectInfo;
    });
    return recentProjects;
  }

  async generateNewFileName(directory: string) {
    return await FileManager.generateNewFileName(directory);
  }

  async initAppData() {
    try {
      this.cache = initialCache;
      await Promise.all([
        FileManager.appDataStore.iterate((val, key) => {
          this.cache[key] = val;
        }),
        FileManager.recentProjectsStore.iterate((val: ProjectInfo, key: string) => {
          this.cache.recentProjects[key] = val;
          this.cache.pathToProjectDict[val.path] = val;
        })
      ]);
    } catch (err) {
      console.error(err);
    }
  }

  async openFile(file: string, projectId: string): Promise<string> {
    const openedProject = (await FileManager.recentProjectsStore.getItem(projectId)) as ProjectInfo;
    openedProject.openedFile = file;
    await FileManager.recentProjectsStore.setItem(projectId, openedProject);
    this.cache.recentProjects[projectId] = openedProject;
    return readTextFile(file);
  }

  /**
   * 打开本地文件所在位置
   * @param project
   */
  async openLocalFileDirectory(project: ProjectInfo) {
    switch (this.os) {
      case 'darwin':
        await new Command('open Finder', project.path).execute();
        break;
      default:
        return Promise.reject(`暂不支持的系统：${this.os}`);
    }
  }

  async openLocalProject() {
    try {
      const documentDirPath = await documentDir();
      const selected = (await open({
        title: '打开文件夹',
        directory: true,
        defaultPath: documentDirPath
      })) as string;
      if (selected) {
        // 检查是否是一个已经存在的项目
        if (this.cache.pathToProjectDict[selected]) {
          return this.cache.pathToProjectDict[selected];
        } else {
          // 没有命中缓存，查一下数据库
          let project;
          await FileManager.recentProjectsStore.iterate(async val => {
            // 如果查到了，更新缓存，并且返回
            if ((val as ProjectInfo).path === selected) {
              project = val as ProjectInfo;
            }
          });
          if (project) {
            this.cache.pathToProjectDict[selected] = project;
            return project;
          } else {
            const project = {
              id: nanoid(),
              name: selected.split(sep).pop() as string,
              path: selected,
              lastModified: new Date().getTime(),
              isOpen: true,
              openedFile: ''
            };
            await FileManager.recentProjectsStore.setItem(project.id, project);
            // 更新缓存
            this.cache.recentProjects[project.id] = project;
            this.cache.pathToProjectDict[project.path] = project;
            return project;
          }
        }
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async openProject(projectId: string) {
    const openedProject = (await FileManager.recentProjectsStore.getItem(projectId)) as ProjectInfo;
    openedProject.isOpen = true;
    await FileManager.recentProjectsStore.setItem(projectId, openedProject);
    this.cache.recentProjects[projectId] = openedProject;
    await FileManager.appDataStore.setItem('currentProject', projectId);
    this.cache.currentProject = projectId;
  }

  async pasteFileOrPath(sourcePath: string, destinationPath: string) {
    try {
      // 1. 检测 destinationPath 是文件还是文件夹
      const isDirectory = await FileManager.isDirectory(destinationPath);
      let destinationPathForPaste: string;
      if (isDirectory) {
        // 如果是目录，当前目录就是可以目标目录
        destinationPathForPaste = destinationPath;
      } else {
        // 如果是文件，则提取它的 basename 作为目标目录
        destinationPathForPaste = await dirname(destinationPath);
      }
      // 生成文件名
      const fileName = await basename(sourcePath);
      const newFileName = await FileManager.generateNewPath(fileName, destinationPathForPaste);
      await new Command('cp', ['-r', sourcePath, await join(destinationPathForPaste, newFileName)]).execute();
      // 复制成功，正常退出
      return 0;
    } catch (err) {
      // 复制失败，出现异常
      console.error(err);
      return 1;
    }
  }

  async renamePage(path: string, newName: string) {
    if (!(await exists(path))) {
      throw new Error('文件不存在或文件夹不存在');
    }
    const dir = await dirname(path);
    let newPath;
    const isDirectory = await FileManager.isDirectory(path);
    if (isDirectory) {
      // 如果是目录，找到上级目录
      newPath = await join(dir, newName);
    } else {
      const ext = await extname(path);
      newPath = await join(dir, `${newName}.${ext}`);
    }
    if (path === newPath) {
      return;
    }
    try {
      const log = await new Command('mv', [path, newPath]).execute();
      if (log.code !== 0) {
        throw new Error(log.stderr);
      }
      const currentProject = (await FileManager.recentProjectsStore.getItem(this.cache.currentProject)) as ProjectInfo;
      const { openedFile, path: projectPath } = currentProject;
      if (path === projectPath) {
        const newCurrentFile = openedFile.replace(path, newPath);
        // 如果 path 是项目目录，则需要更新数据库
        const newProjectInfo = {
          ...currentProject,
          name: newName,
          path: newPath,
          openedFile: newCurrentFile
        };
        await FileManager.recentProjectsStore.setItem(currentProject.id, newProjectInfo);
        this.cache.recentProjects[newProjectInfo.id] = newProjectInfo;
        this.cache.currentProject = newProjectInfo.id;
        delete this.cache.pathToProjectDict[path];
        this.cache.pathToProjectDict[path] = newProjectInfo;
      } else if (openedFile.startsWith(path)) {
        // 如果 path 是当前页面目录，则需要更新数据库
        const newProjectInfo = {
          ...currentProject
        };
        if (path === openedFile) {
          newProjectInfo.openedFile = newPath;
        } else {
          newProjectInfo.openedFile = openedFile.replace(path, newPath);
        }
        await FileManager.recentProjectsStore.setItem(currentProject.id, newProjectInfo);
        this.cache.recentProjects[newProjectInfo.id] = newProjectInfo;
        this.cache.currentProject = newProjectInfo.id;
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  async renameProject(project: ProjectInfo, newName: string) {
    const projectInfo = (await FileManager.recentProjectsStore.getItem(project.id)) as ProjectInfo;
    if (projectInfo) {
      const documentPath = await documentDir();
      const newPath = await join(documentPath, newName);
      const existNewPath = await exists(newPath);
      if (existNewPath) {
        throw new Error('文件夹已存在，请重新输入');
      }
      if (this.os === 'win32') {
        try {
          const log = await new Command('Rename folder on win32', [
            'Rename-Item',
            '-Path',
            `${projectInfo.path}`,
            '-NewName',
            `${newPath}`
          ]).execute();
        } catch (err) {
          console.error(err);
          throw new Error('系统错误');
        }
      } else {
        // await createDir(newPath);
        const log = await new Command('mv', [projectInfo.path, newPath]).execute();
        if (log.code !== 0) {
          throw new Error(log.stderr);
        }
      }

      projectInfo.name = newName;
      projectInfo.path = newPath;
      projectInfo.lastModified = new Date().getTime();

      await FileManager.recentProjectsStore.setItem(projectInfo.id, projectInfo);
      this.cache.recentProjects[projectInfo.id] = projectInfo;

      delete this.cache.pathToProjectDict[project.path];
      this.cache.pathToProjectDict[projectInfo.path] = projectInfo;
    }
  }

  async saveFile(path: string, content: string) {
    await writeTextFile(path, content);
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

  async saveTemplateFile(fileName: string, content: string) {
    await writeTextFile(fileName, content, { dir: BaseDirectory.AppData });
    console.log('写入模板文件');
  }

  async setCurrentProject(projectId: string) {
    await FileManager.appDataStore.setItem('currentProject', projectId);
    this.cache.currentProject = projectId;
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

export default fileManager;
