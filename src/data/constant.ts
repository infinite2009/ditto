export const COMPONENT_DROPDOWN_BASIC_CONTEXT_MENUS = [
  [
    {
      key: 'copy',
      title: '复制',
      shortKey: ['⌘', 'C']
    },
    {
      key: 'paste',
      title: '粘贴',
      shortKey: ['⌘', 'V']
    },
    {
      key: 'rename',
      title: '重命名',
      shortKey: ['⌘', 'R']
    }
  ]
];

export const COMPONENT_DROPDOWN_CONTEXT_MENUS_WITH_HIDE = [
  ...COMPONENT_DROPDOWN_BASIC_CONTEXT_MENUS,
  [
    {
      key: 'hide',
      title: '隐藏',
      shortKey: ['⌘', 'H']
    }
  ],
  [
    {
      key: 'delete',
      title: '删除',
      shortKey: ['del']
    }
  ]
];

export const COMPONENT_DROPDOWN_CONTEXT_MENUS_WITH_SHOW = [
  ...COMPONENT_DROPDOWN_BASIC_CONTEXT_MENUS,
  [
    {
      key: 'show',
      title: '显示',
      shortKey: ['⌘', 'H']
    }
  ],
  [
    {
      key: 'delete',
      title: '删除',
      shortKey: ['del']
    }
  ]
];
