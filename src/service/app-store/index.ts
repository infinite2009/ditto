import { makeAutoObservable } from 'mobx';

export enum Scene {
  projectManagement = 'projectManagement',
  editor = 'editor',
  preview = 'preview'
}

export interface ActiveSceneContext {
  scene: Scene;
  functionName: string;
  data: any;
}

export default class AppStore {
  // 场景
  scene: Scene;

  // 快捷键的注册字典，分场景，分功能
  shortKeyDict = {
    [Scene.projectManagement]: {
      openProject: {
        functionName: '打开项目',
        shortKey: ''
      },
      openInFinder: {
        functionName: '打开文件所在位置',
        shortKey: ''
      },
      createCopy: {
        functionName: '创建副本',

        shortKey: ''
      },
      rename: {
        functionName: '重命名',
        shortKey: ''
      },
      remove: {
        functionName: '删除',
        shortKey: ''
      },
      closeProject: {
        functionName: '关闭项目',
        shortKey: ''
      }
    },
    [Scene.editor]: {
      downloadCode: {
        functionName: '下载代码',
        shortKey: ''
      },
      save: {
        functionName: '保存',
        shortKey: ''
      },
      preview: {
        functionName: '预览',
        shortKey: ''
      },
      toggleDesignAndCode: {
        functionName: '切换设计/代码展示',
        shortKey: ''
      },
      toggleCanvasExpansion: {
        functionName: '切换宽屏画布展示',
        shortKey: ''
      },
      clearCanvas: {
        functionName: '清空画布',
        shortKey: ''
      },
      adjustPageSize: {
        functionName: '调整页面尺寸',
        shortKey: ''
      },
      zoomIn: {
        functionName: '缩小画布',
        shortKey: ''
      },
      zoomOut: {
        functionName: '放大画布',
        shortKey: ''
      },
      undo: {
        functionName: '撤销',
        shortKey: ''
      },
      redo: {
        functionName: '重做',
        shortKey: ''
      },
      copy: {
        functionName: '复制',
        shortKey: ''
      },
      paste: {
        functionName: '粘贴',
        shortKey: ''
      },
      cancelSelection: {
        functionName: '取消选择',
        shortKey: ''
      },
      bold: {
        functionName: '添加/移除加粗',
        shortKey: ''
      },
      italic: {
        functionName: '添加/移除斜体',
        shortKey: ''
      },
      underline: {
        functionName: '添加/移除下划线',
        shortKey: ''
      },
      lineThrough: {
        functionName: '添加/移除删除线',
        shortKey: ''
      },
      textAlignLeft: {
        functionName: '文字左对齐',
        shortKey: ''
      },
      textAlignCenter: {
        functionName: '文字居中对齐',
        shortKey: ''
      },
      textAlignRight: {
        functionName: '文字右对齐',
        shortKey: ''
      },
      alignStart: {
        functionName: '主轴始端对齐',
        shortKey: ''
      },
      alignCenter: {
        functionName: '主轴居中对齐',
        shortKey: ''
      },
      alignEnd: {
        functionName: '主轴末端对齐',
        shortKey: ''
      },
      justifyStart: {
        functionName: '交叉轴始端对齐',
        shortKey: ''
      },
      justifyCenter: {
        functionName: '交叉轴居中对齐',
        shortKey: ''
      },
      justifyEnd: {
        functionName: '交叉轴始端对齐',
        shortKey: ''
      },
      justifyAround: {
        functionName: '交叉轴始端对齐',
        shortKey: ''
      },
      justifyEvenly: {
        functionName: '交叉轴均匀对齐1',
        shortKey: ''
      },
      toggleDirection: {
        functionName: '交叉轴均匀对齐2',
        shortKey: ''
      },
      toggleWrap: {
        functionName: '切换换行/不换行',
        shortKey: ''
      },
      exportTemplate: {
        functionName: '导出为模板',
        shortKey: ''
      },
      rename: {
        functionName: '重命名',
        shortKey: ''
      },
      newFolder: {
        functionName: '新增文件夹',
        shortKey: ''
      },
      newPage: {
        functionName: '新增页面',
        shortKey: ''
      }
    }
  };

  activeSceneContext: ActiveSceneContext;

  constructor() {
    makeAutoObservable(this);
  }

  // invokeHandler(shortKey: string, scene: Scene) {}

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
   * @param newScene
   */
  switchScene(newScene: Scene) {
    this.scene = newScene;
  }

  /**
   * 取消处理器注册
   * @param scene
   * @param functionKey
   */
  unregisterShortKey(scene: Scene, functionKey: string) {
    this.scene[functionKey].shortKey = '';
  }
}
