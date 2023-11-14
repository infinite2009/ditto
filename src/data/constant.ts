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
