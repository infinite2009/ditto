enum PageAction {
  createPage,
  undo,
  redo,
  preview,
  exportCode,
  saveFile,
  copyFullSource,
  copyComponentSource,
  copyCustomSource,
  openProject,
  clear,
  changePlatform,
  expandCanvas,
  // 显隐批注
  toggleNote,
  // 切换画布、设计视图
  changeView,
  // 改变页面尺寸
  changePageSize,
  // 改变画布缩放倍率
  changeScale,
  comment,
  // 编辑 DSL
  editDSL,
  // 回滚 DSL
  rollbackDSL,
  SHARE
}

export default PageAction;
