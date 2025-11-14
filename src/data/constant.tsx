export const COMPONENT_DROPDOWN_BASIC_CONTEXT_MENUS = [[]];
export const RENAME_MENU = {
  key: 'rename',
  title: '重命名',
  shortKey: ['⌘', 'R']
};

export const COPY_MENU = {
  key: 'copy',
  title: '复制',
  shortKey: ['⌘', 'C']
};

export const INSERT_MENU_FOR_CONTAINER = {
  key: 'insert',
  title: '插入',
  children: [
    {
      key: 'insertBefore',
      title: '插入到前边',
      shortKey: ['⌘', '⌥', 'B']
    },
    {
      key: 'insertAfter',
      title: '插入到后边',
      shortKey: ['⌘', '⌥', 'A']
    },
    {
      key: 'insertInFirst',
      title: '插入为第一个子组件',
      shortKey: ['⌘', '⌥', 'F']
    },
    {
      key: 'insertInLast',
      title: '插入为最后一个子组件',
      shortKey: ['⌘', '⌥', 'L']
    }
  ]
};

export const INSERT_MENU_FOR_ROOT = {
  key: 'insert',
  title: '插入',
  children: [
    {
      key: 'insertInFirst',
      title: '插入为第一个子组件',
      shortKey: ['⌘', '⌥', 'F']
    },
    {
      key: 'insertInLast',
      title: '插入为最后一个子组件',
      shortKey: ['⌘', '⌥', 'L']
    }
  ]
};

export const INSERT_MENU_FOR_SLOT = INSERT_MENU_FOR_ROOT;

export const INSERT_MENU_FOR_SOLID = {
  key: 'insert',
  title: '插入',
  children: [
    {
      key: 'insertBefore',
      title: '插入到前边'
    },
    {
      key: 'insertAfter',
      title: '插入到后边'
    }
  ]
};

export const DELETE_MENU = {
  key: 'delete',
  title: '删除',
  shortKey: ['del']
};

export const SHOW_MENU = {
  key: 'show',
  title: '显示',
  shortKey: ['⌘', 'H']
};

export const HIDE_MENU = {
  key: 'hide',
  title: '隐藏',
  shortKey: ['⌘', 'H']
};

export const SELECT_ANCESTOR = {
  key: 'selectAncestor',
  title: '选择祖先节点',
  shortKey: []
};

/**
 * 收藏模块
 */
export const EXPORT_MODULE_MENU = {
  key: 'exportModule',
  title: '收藏',
  shortKey: ['⌘', 'E']
};

export const REPLACE_WITH_BUSINESS_COMPONENT_MENU = {
  key: 'replaceWithBusinessComponent',
  title: '用业务组件替换',
  shortKey: [],
};

/**
 * 收藏组件
 */
export const EXPORT_COMPONENT_MENU = {
  key: 'exportComponent',
  title: '收藏单组件',
  shortKey: ['⌘', 'E']
};

export const REPLACE_COMPONENT_MENU = {
  key: 'replaceComponent',
  title: '将组件替换成业务模块',
  shortKey: []
};

/* 收藏组件右键操作 */

export enum ModuleComponentOperateKey {
  RENAME_MODULE_COMPONENT = 'renameModuleComponent',
  DELETE_MODULE_COMPONENT = 'deleteModuleComponent',
  PREVIEW_MODULE_COMPONENT = 'previewModuleComponent',
  SHARE_MODULE_COMPONENT = 'shareModuleComponent'
}

export const PREVIEW_MODULE_COMPONENT_MENU = {
  key: ModuleComponentOperateKey.PREVIEW_MODULE_COMPONENT,
  title: '预览',
  shortKey: ['⌘', 'P']
};
export const RENAME_MODULE_COMPONENT_MENU = {
  key: ModuleComponentOperateKey.RENAME_MODULE_COMPONENT,
  title: '重命名',
  shortKey: ['⌘', 'F2']
};

export const DELETE_MODULE_COMPONENT_MENU = {
  key: ModuleComponentOperateKey.DELETE_MODULE_COMPONENT,
  title: '删除',
  style: {
    color: '#F85A54',
  },
  shortKey: ['⌘', 'del']
};


export const SHARE_MODULE_COMPONENT_MENU = {
  key: ModuleComponentOperateKey.SHARE_MODULE_COMPONENT,
  title: '分享',
  shortKey: ['⌘', 'T']
};



