enum PageAction {
  createPage,
  undo,
  redo,
  preview,
  exportCode,
  saveFile,
  openProject,
  clear,
  changePlatform,
  expandCanvas,
  // 切换画布、设计视图
  changeView,
  // 改变页面尺寸
  changePageSize,
  // 改变画布缩放倍率
  changeScale
}

export default PageAction;
