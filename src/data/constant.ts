export const COMPONENT_DROPDOWN_CONTEXT_MENUS_WITHOUT_DELETE = [
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

export const COMPONENT_DROPDOWN_CONTEXT_MENUS = [
  ...COMPONENT_DROPDOWN_CONTEXT_MENUS_WITHOUT_DELETE,
  [
    {
      key: 'delete',
      title: '删除',
      shortKey: ['del']
    }
  ]
];
