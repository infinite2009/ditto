import IPageSchema from '@/types/page.schema';
import * as prettier from 'prettier/standalone';
import prettierConfig from '@/config/.prettierrc.json';
import parserHtml from 'prettier/parser-html';
import { Options as PrettierOptions, RequiredOptions } from 'prettier';
import { BaseDirectory, createDir, exists, FileEntry, readDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import ReactCodeGenerator from '@/service/code-generator/react';
import TypeScriptCodeGenerator from '@/service/code-generator/typescript';
import * as typescript from 'prettier/parser-typescript';
import { ProjectInfo } from '@/types/app-data';
import { basename, dirname, extname, homeDir, join, sep } from '@tauri-apps/api/path';
import VueCodeGenerator from './code-generator/vue';
import VueTransformer from './dsl-process/vue-transformer';
import cloneDeep from 'lodash/cloneDeep';
import { PropsId } from '@/types';
import isEqual from 'lodash/isEqual';
import { createAsyncTask, getFileName, isWeb } from '@/util';
import ActionType from '@/types/action-type';
import DSLStore from '@/service/dsl-store';
import { Command } from '@tauri-apps/api/shell';
import { Platform, platform } from '@tauri-apps/api/os';
import DbStore from '@/service/db-store';
import ComponentManager from '@/service/component-manager';
import IComponentSchema from '@/types/component.schema';
import EventTrigger from '@/types/event-trigger';

interface EntryTree {
  children?: EntryTree[];
  isLeaf?: boolean;
  key: string;
  name: string;
  path: string;
  title: string;
}

export type GenerateOptions = {
  /**
   * 是否生成简单的代码，即不包含组件的导入语句
   * @default false
   */
  simple?: boolean;
  useStore?: boolean;
};

class FileManager {
  private static instance = new FileManager();
  os: Platform | 'Web';

  constructor() {
    if (isWeb()) {
      this.os = 'Web';
    } else {
      platform().then(res => {
        this.os = res;
      });
    }
  }

  static getInstance() {
    return FileManager.instance;
  }

  private static async generateNewFileName(directory: string) {
    const fileName = '未命名页面';
    const ext = '.voltron';
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

  async beautify(content: string, config?: PrettierOptions) {
    try {
      return prettier.format(content, {
        ...prettierConfig,
        parser: 'typescript',
        plugins: [typescript],
        ...config
      } as unknown as Partial<RequiredOptions>);
    } catch (e) {
      console.log(e);
      console.log(content);
      return '';
    }
  }

  /**
   * 关闭项目
   * @param projectId
   */
  async closeProject(projectId: string) {
    return await DbStore.updateProject({
      id: projectId,
      isOpen: false,
      isActive: false
    });
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
   * @param tplPath
   */
  async createNewPage(directory: string, tplPath: string = undefined) {
    try {
      const dslStoreService = new DSLStore();
      const fileName = await FileManager.generateNewFileName(directory);
      dslStoreService.createEmptyDSL(fileName, '');
      if (tplPath && (await exists(tplPath))) {
        const content = await readTextFile(tplPath);
        if (content) {
          dslStoreService.initDSL(JSON.parse(content));
        }
      }
      const filePath = await join(directory, fileName);
      await writeTextFile(filePath, JSON.stringify(dslStoreService.dsl));
      return filePath;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteFileOrFolder(path: string) {
    if (!(await exists(path))) {
      return;
    }
    await FileManager.moveToTrash(path);
  }

  async exportReactPageCodeFile(filePath: string, dsl: IPageSchema) {
    const formattedContent = (await this.generateReactCode(dsl)).pageCode;
    await writeTextFile(filePath, formattedContent, { dir: BaseDirectory.Document });
  }

  async exportVuePageCodeFile(filePath: string, dsl: IPageSchema) {
    const formattedContent = await this.generateVueCode(dsl);
    await writeTextFile(filePath, formattedContent, { dir: BaseDirectory.Document });
  }

  async fetchCurrentProjectId() {
    const result = await DbStore.selectProjects({ isActive: true });
    if (result.length) {
      return result[0].id;
    }
  }

  async fetchOpenedProjects() {
    // TODO: need implementation
    if (isWeb()) {
      return [];
    }
    const projects = await DbStore.selectProjects();
    return projects.filter((item: ProjectInfo) => item.isOpen);
  }

  async fetchProjectData() {
    const projects = await DbStore.selectProjects({ isActive: true });
    if (!projects.length) {
      return [];
    }
    const currentProjectPath = projects[0].path;
    const doesExist = await exists(currentProjectPath);
    if (!doesExist) {
      return [];
    }

    const entries: FileEntry[] = await readDir(currentProjectPath, { recursive: true });

    const recursiveMap = (entries: FileEntry[], parentKey: string) => {
      return entries
        .filter(entry => (entry.name as string).endsWith('.voltron') || entry.children)
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

  async fetchProjectInfo(projectId: string) {
    const projects = await DbStore.selectProjects({ id: projectId });
    if (!projects.length) {
      return;
    }
    return projects[0];
  }

  /**
   * 获取用户的全部项目
   */
  async fetchProjects(): Promise<ProjectInfo[]> {
    return await DbStore.selectProjects();
  }

  async generateReactCode(dsl: IPageSchema, opts?: GenerateOptions) {
    return await createAsyncTask(() => {
      const simplifiedDSL = this.simplifyProps(dsl);
      // Ugly: 特殊处理下 Table
      Object.values(simplifiedDSL.componentIndexes).forEach((component: IComponentSchema) => {
        const componentConfig = ComponentManager.fetchComponentConfig(component.configName, component.dependency);
        if (componentConfig?.children?.noRendering) {
          component.children = [];
        }
      });
      const react = new ReactCodeGenerator(
        simplifiedDSL as unknown as IPageSchema,
        new TypeScriptCodeGenerator(),
        opts
      );
      try {
        const formatOpt = {
          ...prettierConfig,
          parser: 'typescript',
          plugins: [typescript]
        } as unknown as Partial<RequiredOptions>;
        if (react.generationOpts.useStore) {
          return {
            pageCode: prettier.format(react.generatePageCode(), formatOpt),
            storeCode: prettier.format(react.generateStoreCode(), formatOpt)
          };
        }
        return {
          pageCode: prettier.format(react.generatePageCode(), formatOpt)
        };
      } catch (e) {
        console.error(e);
        if (react.generationOpts.useStore) {
          return {
            pageCode: react.generatePageCode(),
            storeCode: react.generateStoreCode()
          };
        }
        return { pageCode: react.generatePageCode() };
      }
    });
  }

  async generateVueCode(dsl: IPageSchema) {
    const simplifiedDSL = this.simplifyProps(dsl);
    const vueDslTransformer = new VueTransformer(simplifiedDSL as unknown as IPageSchema);
    const vue = new VueCodeGenerator(vueDslTransformer.transformDsl(), new TypeScriptCodeGenerator());
    return await createAsyncTask(() =>
      prettier.format(vue.generatePageCode(), {
        ...prettierConfig,
        parser: 'vue',
        plugins: [typescript, parserHtml]
      } as unknown as Partial<RequiredOptions>)
    );
  }

  async openFile(path: string, projectId: string): Promise<string> {
    await DbStore.updateProject({
      id: projectId,
      isOpen: true,
      isActive: true,
      openedPage: path
    });
    return readTextFile(path);
  }

  async openProject(projectId: string) {
    return await DbStore.updateProject({
      id: projectId,
      isOpen: true,
      isActive: true
    });
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

  async readFile(filePath: string) {
    return await readTextFile(filePath);
  }

  /**
   * 重命名项目，注意处理好文件名、路径相关的问题
   *
   * @param path
   * @param newName
   */
  async renamePage(path: string, newName: string) {
    if (!(await exists(path))) {
      throw new Error('文件不存在或文件夹不存在');
    }
    const dir = await dirname(path);
    let newPath: string;
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
      const currentProject = (await DbStore.selectProjects({ isActive: true }))[0];
      const { openedFile, path: projectPath } = currentProject;
      if (path === projectPath) {
        const newCurrentFile = openedFile.replace(path, newPath);
        await DbStore.updateProject({
          id: currentProject.id,
          name: newName,
          path: newPath,
          openedPage: newCurrentFile
        });
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
        await DbStore.updateProject({
          id: currentProject.id,
          name: newName,
          openedPage: newProjectInfo.openedFile
        });
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  // async renameProject(project: ProjectInfo, newName: string) {
  //   const projectInfo = (await DbStore.selectProjects({ id: project.id }))[0];
  //   if (projectInfo) {
  //     const documentPath = await documentDir();
  //     const newPath = await join(documentPath, newName);
  //     const existNewPath = await exists(newPath);
  //     if (existNewPath) {
  //       throw new Error('文件夹已存在，请重新输入');
  //     }
  //     if (this.os === 'win32') {
  //       try {
  //         const log = await new Command('Rename folder on win32', [
  //           'Rename-Item',
  //           '-Path',
  //           `${projectInfo.path}`,
  //           '-NewName',
  //           `${newPath}`
  //         ]).execute();
  //       } catch (err) {
  //         console.error(err);
  //         throw new Error('系统错误');
  //       }
  //     } else {
  //       const log = await new Command('mv', [projectInfo.path, newPath]).execute();
  //       if (log.code !== 0) {
  //         throw new Error(log.stderr);
  //       }
  //     }
  //
  //     await DbStore.updateProject({
  //       id: project.id,
  //       name: newName,
  //       path: newPath,
  //       // 如果该项目有打开的页面，需要进行路径替换
  //       openedPage: projectInfo.openedFile
  //         ? projectInfo.openedFile.replace(projectInfo.name, newName)
  //         : projectInfo.openedFile
  //     });
  //   }
  // }

  /**
   * 精简 dsl 的 props
   */
  private simplifyProps(dsl: IPageSchema) {
    const dslClone: IPageSchema = cloneDeep(dsl);
    const { actions } = dslClone;
    const indexes = Object.values(dslClone.componentIndexes);
    indexes.forEach(componentSchema => {
      const { id: componentId, configName, name, dependency, propsRefs } = componentSchema;

      const { propsConfig, isLayer } = ComponentManager.fetchComponentConfig(configName || name, dependency);
      const propsDict = dslClone.props[componentId];
      // 用赋值的数组进行遍历
      const propsRefsCopy = [...propsRefs];
      propsRefsCopy.forEach(ref => {
        const props = propsDict[ref];
        if (!props) {
          return;
        }

        // 如果是浮层组件的 open 属性也跳过
        if (isLayer && ref === 'open') {
          return;
        }

        // 如果是一个事件属性，而且设置过事件，则需要豁免，这是一个补丁
        if (
          props.name in EventTrigger &&
          (dslClone.events[componentId] || []).some(item => item.trigger === props.name)
        ) {
          return;
        }

        const actionPropsDict: Record<PropsId, { name: string; value: any }> = {};
        Object.values(actions).forEach(action => {
          if (action.type === ActionType.STATE_TRANSITION && action.options.target === componentId) {
            Object.assign(actionPropsDict, action.options.props);
          }
        });
        // 如果 props 的值还是初始值，并且不是 状态转移类别的 action 涉及到的 props，或者没有绑定事件，就删除
        if (props && !actionPropsDict[props.name]) {
          if (isEqual(props.value, propsConfig[props.name]?.defaultValue)) {
            delete propsDict[props.name];
            const index = propsRefs.indexOf(props.name);
            if (index !== -1) {
              propsRefs.splice(index, 1);
            }
          } else if (props.name === 'style') {
            // 针对 style 要特殊处理
            const defaultValue = propsConfig[props.name]?.defaultValue as Record<string, any>;
            if (defaultValue) {
              Object.keys(defaultValue).forEach(key => {
                if (props.value) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  if (defaultValue[key] === props.value[key]) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    delete props.value[key];
                  }
                }
              });
            }
            if (!Object.keys(props.value || {}).length) {
              delete propsDict[props.name];
            }
          }
        }
      });
    });
    return dslClone;
  }
}

const fileManager = FileManager.getInstance();

export default fileManager;
