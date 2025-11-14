import { makeAutoObservable } from 'mobx';
import DbStore, { TemplateInfo } from '@/service/db-store';
import { open } from '@tauri-apps/api/shell';
import { http } from '@tauri-apps/api';
import { loginWithCode } from '@/service/http';
import { ProjectInfo } from '@/types/app-data';
import NewFileManager from '@/service/new-file-manager';
import { getPlatform, isWeb } from '@/util';
import { DesignMode } from '@/service/editor-store';

export enum Scene {
  projectManagement = 'projectManagement',
  projectMenu = 'projectMenu',
  templateManagement = 'templateManagement',
  editor = 'editor',
  pageMenu = 'pageMenu',
  smallToolbar = 'smallToolbar',
  preview = 'preview',
  comment = 'comment',
  system = 'system',
  componentMenu = 'componentMenu'
}

// 快捷键激活场景更改
export const sceneMap = {
  [DesignMode.edit]: Scene.editor,
  [DesignMode.preview]: Scene.preview,
  [DesignMode.comment]: Scene.comment
};

type ShortKeyHandler = (scene: string, e: KeyboardEvent | ClipboardEvent) => void;

type FunctionKey = string;

export default class AppStore {
  static loginStatus: { sessionId: string; username: string } = null;
  activeProject: ProjectInfo = null;
  // projectId 为 key，contextId 为 value
  contexts: Record<Scene, Record<FunctionKey, ShortKeyHandler>> = {
    [Scene.componentMenu]: {},
    [Scene.editor]: {},
    [Scene.pageMenu]: {},
    [Scene.preview]: {},
    [Scene.projectManagement]: {},
    [Scene.projectMenu]: {},
    [Scene.smallToolbar]: {},
    [Scene.system]: {},
    [Scene.templateManagement]: {},
    [Scene.comment]: {}
  };
  defaultShortKeyDict = {
    win32: {
      [Scene.system]: {
        reload: {
          functionName: '重新加载',
          key: 'R',
          code: 'KeyR',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        relaunch: {
          functionName: '重新启动',
          key: 'R',
          code: 'KeyR',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false,
          clientOnly: true
        }
      },
      [Scene.projectMenu]: {
        openProject: {
          functionName: '打开项目',
          key: 'O',
          code: 'KeyO',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        rename: {
          functionName: '重命名',
          key: 'R',
          code: 'KeyR',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        remove: {
          functionName: '删除',
          key: 'DELETE',
          ctrl: false,
          alt: false,
          shift: false,
          meta: false
        }
      },
      [Scene.projectManagement]: {
        openProjectCreatingModal: {
          functionName: '新建项目',
          key: 'N',
          code: 'KeyN',
          ctrl: true,
          alt: true,
          shift: false,
          meta: false
        }
      },
      [Scene.templateManagement]: {
        renameTemplate: {
          functionName: '重命名',
          key: 'R',
          code: 'KeyR',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        deleteTemplate: {
          functionName: '删除',
          key: 'DELETE',
          ctrl: false,
          alt: false,
          shift: false,
          meta: false
        }
      },
      [Scene.componentMenu]: {
        copy: {
          functionName: '复制',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        paste: {
          functionName: '粘贴',
          key: 'V',
          code: 'KeyV',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        remove: {
          functionName: '删除',
          keystrokes: [
            {
              key: 'DELETE',
              ctrl: false,
              alt: false,
              shift: false,
              meta: false
            }
            // {
            //   key: 'BACKSPACE',
            //   ctrl: false,
            //   alt: false,
            //   shift: false,
            //   meta: false
            // }
          ],
          key: 'DELETE',
          ctrl: false,
          alt: false,
          shift: false,
          meta: false
        }
      },
      [Scene.pageMenu]: {
        copy: {
          functionName: '复制',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        remove: {
          functionName: '删除',
          key: 'DELETE',
          ctrl: false,
          alt: false,
          shift: false,
          meta: false
        },
        exportAsTemplate: {
          functionName: '导出为模板',
          key: 'E',
          code: 'KeyE',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        rename: {
          functionName: '重命名',
          key: 'R',
          code: 'KeyR',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        }
      },
      [Scene.smallToolbar]: {
        bold: {
          functionName: '添加/移除加粗',
          key: 'B',
          code: 'KeyB',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        italic: {
          functionName: '添加/移除斜体',
          key: 'I',
          code: 'KeyI',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        underline: {
          functionName: '添加/移除下划线',
          key: 'U',
          code: 'KeyU',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        lineThrough: {
          functionName: '添加/移除删除线',
          key: 'D',
          code: 'KeyD',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        textAlignLeft: {
          functionName: '文字左对齐',
          key: 'L',
          code: 'KeyL',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        textAlignCenter: {
          functionName: '文字居中对齐',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        textAlignRight: {
          functionName: '文字右对齐',
          key: 'R',
          code: 'KeyR',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        textAlign: {
          functionName: '文字两端对齐',
          key: 'J',
          code: 'KeyJ',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        alignStart: {
          functionName: '主轴始端对齐',
          key: 'S',
          code: 'KeyS',
          ctrl: true,
          alt: true,
          shift: false,
          meta: false
        },
        alignCenter: {
          functionName: '主轴居中对齐',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: true,
          shift: false,
          meta: false
        },
        alignEnd: {
          functionName: '主轴末端对齐',
          key: 'E',
          code: 'KeyE',
          ctrl: true,
          alt: true,
          shift: false,
          meta: false
        },
        justifyStart: {
          functionName: '交叉轴始端对齐',
          key: 'S',
          code: 'KeyS',
          ctrl: false,
          alt: true,
          shift: true,
          meta: false
        },
        justifyCenter: {
          functionName: '交叉轴居中对齐',
          key: 'C',
          code: 'KeyC',
          ctrl: false,
          alt: true,
          shift: true,
          meta: false
        },
        justifyEnd: {
          functionName: '交叉轴末端对齐',
          key: 'E',
          code: 'KeyE',
          ctrl: false,
          alt: true,
          shift: true,
          meta: false
        },
        justifyBetween: {
          functionName: '交叉轴两端对齐',
          key: 'L',
          code: 'KeyL',
          ctrl: false,
          alt: true,
          shift: true,
          meta: false
        },
        justifyEvenly: {
          functionName: '交叉轴均匀对齐',
          key: 'K',
          code: 'KeyK',
          ctrl: false,
          alt: true,
          shift: true,
          meta: false
        },
        toggleDirection: {
          functionName: '切换布局方向',
          key: 'D',
          code: 'KeyD',
          ctrl: true,
          alt: true,
          shift: false,
          meta: false
        },
        toggleWrap: {
          functionName: '切换换行/不换行',
          key: 'W',
          code: 'KeyW',
          ctrl: true,
          alt: true,
          shift: false,
          meta: false
        }
      },
      [Scene.editor]: {
        newPage: {
          functionName: '新增页面',
          key: 'P',
          code: 'KeyP',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        downloadCode: {
          functionName: '下载代码',
          key: 'D',
          code: 'KeyD',
          ctrl: false,
          alt: true,
          shift: false,
          meta: false
        },
        save: {
          functionName: '保存',
          key: 'S',
          code: 'KeyS',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        copySource: {
          functionName: '复制组件源码',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: false,
          shift: false,
          meta: true
        },
        copyFullSource: {
          functionName: '完整',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: false,
          shift: false,
          meta: true
        },
        copyComponentSource: {
          functionName: '仅组件',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: false,
          shift: false,
          meta: true
        },
        copyCustomSource: {
          functionName: '自定义',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: false,
          shift: false,
          meta: true
        },
        editDSL: {
          functionName: '编辑DSL',
          key: 'E',
          code: 'KeyE',
          ctrl: false,
          alt: false,
          shift: false,
          meta: true
        },
        rollbackDSL: {
          functionName: '历史DSL',
          key: 'R',
          code: 'KeyR',
          ctrl: false,
          alt: false,
          shift: false,
          meta: true
        },
        preview: {
          functionName: '预览',
          key: 'P',
          code: 'KeyP',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        toggleDesignAndCode: {
          functionName: '切换设计/代码展示',
          key: 'D',
          code: 'KeyD',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        toggleCanvasExpansion: {
          functionName: '切换宽屏画布展示',
          key: 'U',
          code: 'KeyU',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        clearCanvas: {
          functionName: '清空画布',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        togglePageWidth: {
          functionName: '切换页面类型',
          key: 'T',
          code: 'KeyT',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomIn: {
          functionName: '放大画布',
          key: '=',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomOut: {
          functionName: '缩小画布',
          key: '-',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomToFit: {
          functionName: '适应窗口',
          key: '1',
          code: 'Key1',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomTo100: {
          functionName: '还原',
          key: '0',
          code: 'Key0',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        undo: {
          functionName: '撤销',
          key: 'Z',
          code: 'KeyZ',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        redo: {
          functionName: '重做',
          key: 'Z',
          code: 'KeyZ',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        cancelSelection: {
          functionName: '取消选择',
          key: 'ESCAPE',
          ctrl: false,
          alt: false,
          shift: false,
          meta: false
        },
        copy: {
          functionName: '复制',
          key: 'C',
          code: 'KeyC',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        paste: {
          functionName: '粘贴',
          key: 'V',
          code: 'KeyV',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        remove: {
          functionName: '删除',
          keystrokes: [
            {
              key: 'DELETE',
              ctrl: false,
              alt: false,
              shift: false,
              meta: false
            }
            // {
            //   key: 'BACKSPACE',
            //   ctrl: false,
            //   alt: false,
            //   shift: false,
            //   meta: false
            // }
          ],
          key: 'DELETE',
          ctrl: false,
          alt: false,
          shift: false,
          meta: false
        },
        variableConfig: {
          functionName: '变量配置',
          key: 'R',
          ctrl: false,
          alt: true,
          shift: false,
          meta: false
        },
        actionConfig: {
          functionName: '动作配置',
          key: 'A',
          ctrl: true,
          alt: true,
          shift: false,
          meta: false
        }
      },
      // 当前页预览-快捷键注册
      [Scene.preview]: {
        toggleDesignAndCode: {
          functionName: '切换设计/代码展示',
          key: 'D',
          code: 'KeyD',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        // 当前页预览状态切换
        toggleCanvasExpansion: {
          functionName: '切换宽屏画布展示',
          key: 'U',
          code: 'KeyU',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        togglePageWidth: {
          functionName: '切换页面类型',
          key: 'T',
          code: 'KeyT',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomIn: {
          functionName: '放大画布',
          key: '=',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomOut: {
          functionName: '缩小画布',
          key: '-',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomToFit: {
          functionName: '适应窗口',
          key: '1',
          code: 'Key1',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomTo100: {
          functionName: '还原',
          key: '0',
          code: 'Key0',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        }
      },
      [Scene.comment]: {
        preview: {
          functionName: '预览',
          key: 'P',
          code: 'KeyP',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        toggleDesignAndCode: {
          functionName: '切换设计/代码展示',
          key: 'D',
          code: 'KeyD',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        toggleCanvasExpansion: {
          functionName: '切换宽屏画布展示',
          key: 'U',
          code: 'KeyU',
          ctrl: true,
          alt: false,
          shift: true,
          meta: false
        },
        zoomIn: {
          functionName: '放大画布',
          key: '=',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomOut: {
          functionName: '缩小画布',
          key: '-',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomToFit: {
          functionName: '适应窗口',
          key: '1',
          code: 'Key1',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        },
        zoomTo100: {
          functionName: '还原',
          key: '0',
          code: 'Key0',
          ctrl: true,
          alt: false,
          shift: false,
          meta: false
        }
      }
    },
    darwin: {}
  };
  openedProjects = [];
  platform = null;
  // 快捷键的注册字典，分场景，分功能
  shortKeyDict = null;
  templateList: { category: string; data: TemplateInfo[] }[] = [];

  constructor() {
    this.init().then();
    makeAutoObservable(this);
  }

  static async checkLoginStatus() {
    if (isWeb()) {
      return;
    }
    return this.checkLoginStatusForDesktop();
  }

  /**
   * 获取账户，如果没有账户，直接走登录
   */
  static async checkLoginStatusForDesktop(): Promise<{ sessionId: string; username: string }> {
    const dashboardUrl =
      process.env.NODE_ENV === 'prod'
        ? 'https://dashboard-mng.bilibili.co/api/v4/client/authorize?client_name=voltron&redirect_uri=voltron://login'
        : 'http://alpha.dashboard.bilibili.co/api/v4/client/authorize?client_name=uat-voltron&redirect_uri=voltron://login';
    // const dashboardUrl = 'https://dashboard-mng.bilibili.co/api/v4/client/authorize?client_name=voltron&redirect_uri=voltron://login';
    if (!AppStore.loginStatus) {
      const result = await DbStore.selectAppInfo();
      if (result[0]?.sessionId) {
        AppStore.loginStatus = {
          sessionId: result[0].sessionId,
          username: result[0].accountName
        };
      }
    }
    if (!AppStore.loginStatus && !import.meta.env.VITE_DISABLE_UN_LOGIN_REDIRECT) {
      // 没有记录账号，直接跳转登录
      open(dashboardUrl).then(() => {
        console.log('login open called');
      });
      return Promise.reject('no login');
    } else {
      const { sessionId, username } = AppStore.loginStatus;
      const dashboardAPIUrl =
        process.env.NODE_ENV === 'prod'
          ? 'https://dashboard-mng.bilibili.co/api/v4/user/info'
          : 'http://alpha.dashboard.bilibili.co/api/v4/user/info';
      // const dashboardAPIUrl = 'https://dashboard-mng.bilibili.co/api/v4/user/info';
      // 有账号，用 sessionId 检查下是否已经登录
      const res: http.Response<{ code: number; message: string; data: Record<string, string | number> }> =
        await http.fetch(dashboardAPIUrl, {
          method: 'GET',
          headers: {
            Cookie: `_AJSESSIONID=${sessionId};username=${username}`
          }
        });
      if (res.data.code !== 0 && !import.meta.env.VITE_DISABLE_UN_LOGIN_REDIRECT) {
        // 没有登录，弹窗提示用户去登录
        open(dashboardUrl).then(() => {
          console.log('login open called');
        });
        return null;
      }
      return {
        sessionId,
        username
      };
    }
  }

  /**
   * 保存用户的登录态和用户名
   */
  static async saveLoginStatus(code: string) {
    // 使用 dashboard 给的 code 去获取用户的 session
    const res = await loginWithCode(code);
    if (res.data.code === 0) {
      const result = await DbStore.selectAppInfo();
      if (result.length) {
        // 更新app info
        const appInfo = result[0];
        await DbStore.updateAppInfo({
          id: appInfo.id,
          accountName: res.data.data.username,
          sessionId: res.data.data.session_id
        });
      } else {
        await DbStore.addAppInfo({
          accountName: res.data.data.username,
          sessionId: res.data.data.session_id
        });
      }
      AppStore.loginStatus = {
        username: res.data.data.username,
        sessionId: res.data.data.session_id
      };
    }
  }

  async fetchTemplates() {
    const res = await NewFileManager.fetchTemplateList();
    if (!res.length) {
      this.setTemplateList([]);
    } else {
      const dataTmp: Record<string, { category: string; data: TemplateInfo[] }> = {};
      for (const item of res) {
        if (!dataTmp[item.category]) {
          dataTmp[item.category] = {
            category: item.category,
            data: []
          };
        }
        dataTmp[item.category].data.push(item);
      }
      this.setTemplateList(Object.values(dataTmp));
    }
    return this.templateList;
  }

  generateDarwinShortcutDict() {
    const result = {};
    Object.entries(this.defaultShortKeyDict.win32).forEach(([sceneKey, sceneValue]) => {
      result[sceneKey] = {};
      Object.entries(sceneValue).forEach(([key, value]) => {
        result[sceneKey][key] = value;
        if (result[sceneKey][key].ctrl === true) {
          result[sceneKey][key].ctrl = false;
          result[sceneKey][key].meta = true;
        }
      });
    });
    return result;
  }

  /**
   * 生成展示快捷键功能的名字
   * @param scene
   * @param functionKey
   */
  generateShortKeyDisplayName(scene: string, functionKey: string): string {
    const win32ModifierDict = {
      ctrl: 'Ctrl',
      alt: 'Alt',
      shift: 'Shift',
      meta: 'Win'
    };
    const darwinModifierDict = {
      ctrl: '⌃',
      alt: '⌥',
      shift: '⇧',
      meta: '⌘'
    };
    const modifierDict = this.platform === 'win32' ? win32ModifierDict : darwinModifierDict;
    const shortKeySetting = this.shortKeyDict[scene][functionKey];
    if (!shortKeySetting) {
      console.error('不存在的功能：', functionKey);
      return '';
    }
    const keyForDisplay = shortKeySetting.key === 'DELETE' ? 'Del' : shortKeySetting.key;
    const modifiersWithKey = [];

    if (shortKeySetting.meta) {
      modifiersWithKey.push(modifierDict.meta);
    }
    if (shortKeySetting.ctrl) {
      modifiersWithKey.push(modifierDict.ctrl);
    }
    if (shortKeySetting.alt) {
      modifiersWithKey.push(modifierDict.alt);
    }
    if (shortKeySetting.shift) {
      modifiersWithKey.push(modifierDict.shift);
    }

    modifiersWithKey.push(keyForDisplay);
    return modifiersWithKey.join(' ');
  }

  async init() {
    this.platform = await getPlatform();
    if (this.platform === 'darwin') {
      this.defaultShortKeyDict.darwin = this.generateDarwinShortcutDict();
    }
    this.shortKeyDict = this.defaultShortKeyDict[this.platform];
  }

  /**
   * 给当前的上下文注册处理器
   * @param scene
   * @param handlers
   */
  registerHandlers(scene: Scene, handlers: Record<FunctionKey, ShortKeyHandler>) {
    this.contexts[scene] = Object.assign(this.contexts[scene] || {}, handlers);
  }

  async renameTemplate(templateId: string, name: string) {
    return await DbStore.updateTemplate({
      id: templateId,
      name
    });
  }

  setActiveProject(projectInfo: ProjectInfo) {
    this.activeProject = projectInfo;
  }

  setOpenedProjects(projects: ProjectInfo[]) {
    this.openedProjects = projects;
  }

  setTemplateList(data: { category: string; data: TemplateInfo[] }[]) {
    this.templateList = data;
  }
}
