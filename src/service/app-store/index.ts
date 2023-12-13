import { makeAutoObservable } from 'mobx';
import { nanoid } from 'nanoid';

export type Modifier = 'ctrl' | 'meta' | 'alt' | 'shift';

export enum Scene {
  projectManagement = 'projectManagement',
  editor = 'editor',
  preview = 'preview'
}

type ShortKeyHandler = (data: any, scene: string, functionKey: string) => void;

type FunctionKey = string;

export interface SceneContext {
  id: string;
  scene: Scene;
  // data 的具体类型需要具体的场景下利用上下文数据的代码决定，往往是根据 handler 的需要来确定
  data: any;
  handlers: Record<FunctionKey, ShortKeyHandler>;
}

export default class AppStore {
  // 场景
  scene: Scene;

  // 快捷键的注册字典，分场景，分功能
  shortKeyDict = {
    [Scene.projectManagement]: {
      openProject: {
        functionName: '打开项目',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      openInFinder: {
        functionName: '打开文件所在位置',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      createCopy: {
        functionName: '创建副本',

        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      rename: {
        functionName: '重命名',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      remove: {
        functionName: '删除',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      closeProject: {
        functionName: '关闭项目',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      }
    },
    [Scene.editor]: {
      downloadCode: {
        functionName: '下载代码',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      save: {
        functionName: '保存',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      preview: {
        functionName: '预览',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      toggleDesignAndCode: {
        functionName: '切换设计/代码展示',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      toggleCanvasExpansion: {
        functionName: '切换宽屏画布展示',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      clearCanvas: {
        functionName: '清空画布',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      adjustPageSize: {
        functionName: '调整页面尺寸',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      zoomIn: {
        functionName: '缩小画布',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      zoomOut: {
        functionName: '放大画布',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      undo: {
        functionName: '撤销',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      redo: {
        functionName: '重做',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      copy: {
        functionName: '复制',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      paste: {
        functionName: '粘贴',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      cancelSelection: {
        functionName: '取消选择',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      bold: {
        functionName: '添加/移除加粗',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      italic: {
        functionName: '添加/移除斜体',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      underline: {
        functionName: '添加/移除下划线',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      lineThrough: {
        functionName: '添加/移除删除线',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      textAlignLeft: {
        functionName: '文字左对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      textAlignCenter: {
        functionName: '文字居中对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      textAlignRight: {
        functionName: '文字右对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      alignStart: {
        functionName: '主轴始端对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      alignCenter: {
        functionName: '主轴居中对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      alignEnd: {
        functionName: '主轴末端对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      justifyStart: {
        functionName: '交叉轴始端对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      justifyCenter: {
        functionName: '交叉轴居中对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      justifyEnd: {
        functionName: '交叉轴始端对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      justifyBetween: {
        functionName: '交叉轴始端对齐',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      justifyEvenly: {
        functionName: '交叉轴均匀对齐1',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      toggleDirection: {
        functionName: '交叉轴均匀对齐2',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      toggleWrap: {
        functionName: '切换换行/不换行',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      exportTemplate: {
        functionName: '导出为模板',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      rename: {
        functionName: '重命名',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      newFolder: {
        functionName: '新增文件夹',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      },
      newPage: {
        functionName: '新增页面',
        key: '',
        ctrl: true,
        alt: true,
        shift: true,
        meta: true
      }
    }
  };

  activeContext: SceneContext;

  contexts: Record<FunctionKey, SceneContext> = {};

  // projectId 为 key，contextId 为 value
  contextIdDictForProject = {};

  setContextIdForProject(contextId: string, projectId: string) {
    this.contextIdDictForProject[projectId] = contextId;
  }

  getContextIdForProject(projectId: string) {
    return this.contextIdDictForProject[projectId];
  }

  constructor() {
    makeAutoObservable(this);
  }

  createContext(scene: Scene, data: any, handlers: Record<FunctionKey, ShortKeyHandler> = {}) {
    const contextId = nanoid();
    this.contexts[contextId] = {
      id: contextId,
      scene,
      data,
      handlers
    };
    this.activeContext = this.contexts[contextId];
    return contextId;
  }

  /**
   * 给指定场景下指定快捷键注册处理器
   * @param shortKey
   * @param scene
   * @param functionKey
   */
  registerShortKey(scene: Scene, functionKey: string, shortKey: string) {
    Object.entries(this.shortKeyDict).find(([, sceneDict]) => {
      if (sceneDict[functionKey] === shortKey) {
        sceneDict[functionKey].shortKey = '';
        throw new Error(`检测到冲突的按键，${sceneDict[functionKey].functionName}`);
      }
    });
    if (this.shortKeyDict[scene]?.[functionKey]) {
      delete this.shortKeyDict[scene][shortKey];
    }
  }

  /**
   * 切换场景
   * @param id
   */
  activateSceneContext(id: string) {
    this.activeContext = this.contexts[id];
  }

  /**
   * 取消处理器注册
   * @param scene
   * @param functionKey
   */
  unregisterShortKey(scene: Scene, functionKey: string) {
    this.scene[functionKey].shortKey = '';
  }

  /**
   * 执行当前场景下的功能，
   * 如果没有在场景字典中找到当前场景，抛出异常
   */
  execute(key: string, modifiers: Record<Modifier, boolean>) {
    if (!this.activeContext) {
      return '不存在激活的上下文';
    }
    // 查出当前激活的场景的快捷，比对一下
    const { scene, data, handlers } = this.activeContext;
    if (!this.shortKeyDict?.[scene]) {
      return '不存在的场景';
    }
    const selected = Object.keys(handlers).find(functionKey => {
      return functionKey in this.shortKeyDict[scene];
    });
    if (!selected) {
      return '不存在的快捷键设置';
    }
    const { key: mainKey, alt, shift, meta, ctrl } = this.shortKeyDict[scene][selected];
    if (
      key === mainKey &&
      modifiers.alt === alt &&
      modifiers.shift === shift &&
      modifiers.ctrl === ctrl &&
      modifiers.meta === meta
    ) {
      handlers[selected](data, scene, selected);
    }
  }

  /**
   * 给当前的上下文注册处理器
   * @param contextId
   * @param handlers
   */
  registerHandlers(contextId: string, handlers: Record<FunctionKey, ShortKeyHandler>) {
    if (!this.contexts[contextId]) {
      return '不存在的上下文';
    }
    this.contexts[contextId].handlers = handlers;
  }
}
