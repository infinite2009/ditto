import { makeAutoObservable } from 'mobx';

export enum Scene {
  projectManagement = 'projectManagement',
  editor = 'editor',
  preview = 'preview'
}

export default class AppStore {
  // 场景
  scene: Scene;

  // 快捷键的注册字典，分场景，分功能
  sceneDict = {
    projectManagement: {
      openProject: '',
      openInFinder: '',
      createCopy: '',
      rename: '',
      remove: '',
      closeProject: ''
    },
    toolbar: {
      downloadCode: '',
      save: '',
      preview: '',
      toggleDesignAndCode: '',
      toggleCanvasExpansion: '',
      clearCanvas: '',
      adjustPageSize: '',
      zoomIn: '',
      zoomOut: '',
      undo: '',
      redo: ''
    },
    editor: {
      copy: '',
      cut: '',
      paste: '',
      cancelSelection: '',
      bold: '',
      italic: '',
      underline: '',
      lineThrough: '',
      textAlignLeft: '',
      textAlignCenter: '',
      textAlignRight: '',
      alignStart: '',
      alignCenter: '',
      alignEnd: '',
      justifyStart: '',
      justifyEnd: '',
      justifyAround: '',
      justifyEvenly: '',
      toggleDirection: '',
      toggleWrap: ''
    },
    projectTree: {
      exportTemplate: '',
      copy: '',
      cut: '',
      paste: '',
      rename: '',
      newFolder: '',
      newPage: '',
      cancelSelection: ''
    },
    preview: {}
  };

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * 切换场景
   * @param newScene
   */
  switchScene(newScene: Scene) {
    this.scene = newScene;
  }

  /**
   * 给指定场景下指定快捷键注册处理器
   * @param shortKey
   * @param scene
   * @param handler
   */
  registerShortKey(shortKey: string, scene: Scene, handler: (e: { shortKey: string; scene: Scene }) => void) {
    // 检测到当前场景下的快捷键被其他的处理器注册，抛出错误。允许同一个handler反复注册，保持幂等
    if (this.sceneDict[scene]?.[shortKey] && this.sceneDict[scene]?.[shortKey] !== handler) {
      throw new Error('当前快捷键已被使用，请更换另外一个快捷键');
    }
    // 如果当前场景没有初始化
    if (!this.sceneDict[scene]) {
      this.sceneDict[scene] = {};
    }
    // 注册当前的 handler
    this.sceneDict[scene][shortKey] = handler;
  }

  /**
   * 取消处理器注册
   * @param shortKey
   * @param scene
   */
  unregisterShortKey(shortKey: string, scene: Scene) {
    if (this.sceneDict[scene]?.[shortKey]) {
      delete this.sceneDict[scene][shortKey];
    }
  }

  invokeHandler(shortKey: string, scene: Scene) {}
}
