enum ComponentFeature {
  root = 'root',
  container = 'container',
  slot = 'slot',
  solid = 'solid',
  // 透明元素，它是为了配合生成代码才需要插入的元素，不承担 DnD 以及其他的样式功能
  transparent = 'transparent',
  // 黑盒，只能通过画布和它的子组件进行交互，不能再组件树上交互
  blackBox = 'blackBox',
  WITH_SLOTS = 'withSlots',
}

export default ComponentFeature;
