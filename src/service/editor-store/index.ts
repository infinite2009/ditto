import { makeAutoObservable } from 'mobx';
import { ComponentId } from '@/types';
import { CommentInfo } from '@/service/db-store';
import { nanoid } from 'nanoid';
import { mapTree } from '@/util';
import { MenuConfig } from '@/pages/editor/page-config/MenuConfig';
import { NavConfig } from '@/pages/editor/page-config/NavConfig';
import { CSSProperties } from 'react';
import { GetVoltronNoteList, PostVoltronPageList } from '@/api';
import {
  CommentPosition,
  ComponentDraggingInfo,
  DesignMode,
  ExtDOMRect,
  FormConfigType,
  NoteItem,
  PageConfig,
  ViewMode
} from './types';
import { PageWidth } from '@/pages/editor/toolbar';
import { VariableInfo } from '@/types/page.schema';

export { DesignMode };

export type { FormConfigType, ViewMode, PageConfig, CommentPosition, NoteItem, ComponentDraggingInfo, ExtDOMRect };

export default class EditorStore {
  actionConfigVisible = false;
  // 画布的矩形信息
  canvasRect: DOMRect;
  commentList: CommentInfo[] = [];
  commentOpen = false;
  componentDraggingInfo: ComponentDraggingInfo = null;
  componentIdForComment: ComponentId = '';
  componentIdForCopy: ComponentId;
  componentPropsDict: Record<ComponentId, Record<string, any>> = {};
  fetchPageList: () => Promise<any[]>;
  framework: 'React' | 'Vue' = 'React';
  getNoteList: () => Promise<any[]>;
  highlightComponent: ComponentId = null;
  hoveredComponentId: ComponentId = null;
  iframeDocument: Document;
  instanceId: string;
  isFetchingNoteList = false;
  isSaving = false;
  isSyncing = false;
  language: 'TypeScript' | 'JavaScript' = 'TypeScript';
  leftPanelVisible = true;
  mode: DesignMode = DesignMode.edit;
  noteList: NoteItem[] = [];
  /**
   * 页面配置
   * - 顶部导航配置
   * - 菜单配置
   * - 标注
   */
  pageConfig: PageConfig = {};
  pageList: PostVoltronPageList.ResItem[] = [];
  pageRootRef: HTMLElement = null;
  pageWidth: PageWidth = PageWidth.wechat;
  panelTabKey: FormConfigType = 'basic';
  projectId: string;
  rightPanelVisible = true;
  scale = 100;
  scaleOrigin: CSSProperties['transformOrigin'] = 'center';
  selectedComponentLib = '@bilibili/ui';
  selectedPageId: string;
  showNote = false;
  sketchViewMode: 'droppable' | 'all';
  // 状态表，记录页面中用到的所有的状态，条件渲染、数据源、组件 props 值，仅在页面编辑和预览时有效
  stateDict: Record<string, any> = {};
  variableConfigVisible = false;
  viewMode: ViewMode = 'design';
  private hiddenComponents: Record<ComponentId, boolean> = {};
  private rectInfo: Record<ComponentId, DOMRect> = {};

  constructor() {
    makeAutoObservable(this);
    this.instanceId = nanoid();
  }

  get hasCopiedComponent() {
    return !!this.componentIdForCopy;
  }

  get menuConfig() {
    return this.pageConfig.menuConfig;
  }

  get navConfig() {
    return this.pageConfig.navConfig;
  }

  get selectPage() {
    return (this.pageList || []).find(i => i.pageId === this.selectedPageId);
  }

  clearComponentDraggingInfo() {
    this.componentDraggingInfo = null;
  }

  clearComponentIdForComment() {
    this.componentIdForComment = null;
  }

  closeActionConfig() {
    this.actionConfigVisible = false;
  }

  closeComment() {
    this.commentOpen = false;
  }

  closeVariableConfig() {
    this.variableConfigVisible = false;
  }

  fetchCommentByComponentId(id: ComponentId): CommentInfo {
    return this.commentList.find(item => item.componentId === id && !item.resolved);
  }

  getPageRootWrapperRef() {
    return this.pageRootRef;
  }

  getRectInfo(id: ComponentId) {
    if (!this.rectInfo[id]) {
      const dom = this.iframeDocument.querySelector(`[data-voltron-id=${id}]`);
      if (!dom) {
        return null;
      }
      this.rectInfo[id] = dom.getBoundingClientRect().toJSON();
    }
    return { ...this.rectInfo[id] };
  }

  getState(stateName: string) {
    return this.stateDict[stateName];
  }

  initPageConfig(data: PageConfig) {
    this.pageConfig = data;
  }

  /**
   * 根据DSL的 stateDict 进行组件运行时状态初始化，使之能在预览模式下响应用户交互
   */
  initStateDict(stateDict: Record<string, VariableInfo>) {
    Object.entries(stateDict).forEach(([key, val]) => {
      this.stateDict[key] = val;
    });
  }

  /**
   * 判断指定组件是否可见
   *
   * @param componentId
   */
  isVisible(componentId: ComponentId) {
    // 如果从隐藏组件字典里查不到，就是可见的
    console.log(`${componentId} is visible: `, !this.hiddenComponents[componentId]);
    return !this.hiddenComponents[componentId];
  }

  openActionConfig() {
    this.actionConfigVisible = true;
  }

  openVariableConfig() {
    this.variableConfigVisible = true;
  }

  removeOpenedPage(projectId: string) {
    const openedProjectsStr = window.localStorage.getItem('openedProjects');
    if (openedProjectsStr) {
      const openedProjects = JSON.parse(openedProjectsStr);
      delete openedProjects[projectId];
      window.localStorage.setItem('openedProjects', JSON.stringify(openedProjects));
    }
  }

  resetRectInfo() {
    this.rectInfo = {};
  }

  setActiveKeyOfPageConfig(activeKey: string) {
    this.setPageConfig(this.pageConfig.open, activeKey);
  }

  setCommentList(commentList: CommentInfo[]) {
    this.commentList = commentList;
  }

  setComponentDraggingCoordinates(data: { top: number; left: number }) {
    if (!this.componentDraggingInfo) {
      return;
    }
    this.componentDraggingInfo.top = data.top;
    this.componentDraggingInfo.left = data.left;
  }

  setComponentDraggingInfo(data: ComponentDraggingInfo) {
    this.componentDraggingInfo = data;
  }

  setComponentIdForComment(componentId: ComponentId) {
    this.componentIdForComment = componentId;
  }

  setComponentIdForCopy(componentId: ComponentId) {
    this.componentIdForCopy = componentId;
  }

  setFetchPageList(fn: () => Promise<any[]> = () => Promise.resolve([])) {
    this.fetchPageList = fn;
  }

  setFramework(framework: 'React' | 'Vue', language: 'TypeScript' | 'JavaScript') {
    this.framework = framework;
    this.language = language;
  }

  setGetNoteList(fn: () => Promise<any[]> = () => Promise.resolve([])) {
    this.getNoteList = fn;
  }

  setHighlightComponent(id: ComponentId) {
    this.highlightComponent = id;
  }

  setHoveredComponentId(id: ComponentId) {
    this.hoveredComponentId = id;
  }

  setIframeDocument(iframeDocument: Document) {
    this.iframeDocument = iframeDocument;
  }

  setIsFetchingNoteList(isFetching: boolean) {
    this.isFetchingNoteList = isFetching;
  }

  setIsInCanvas(val: boolean) {
    if (!this.componentDraggingInfo) {
      return;
    }
    this.componentDraggingInfo.isInCanvas = val;
  }

  setIsSaving(val: boolean) {
    this.isSaving = val;
  }

  setMenuConfig(val: MenuConfig) {
    const items = val?.items?.length ? val?.items : this.pageConfig?.menuConfig?.items;
    this.pageConfig.menuConfig = {
      ...this.pageConfig.menuConfig,
      ...val,
      items: mapTree(items || [], (item: any) => ({
        ...item,
        children: item?.children?.length ? item.children : undefined
      }))
    };
  }

  setMoving() {
    if (!this.componentDraggingInfo) {
      return;
    }
    this.componentDraggingInfo.isMoving = true;
  }

  setNavConfig(val: NavConfig) {
    this.pageConfig.navConfig = {
      // logo: 'https://s1.hdslb.com/bfs/templar/york-static/qDA51Kz4chURK9Iu.png',
      // ...this.pageConfig.navConfig,
      ...val
    };
  }

  setNoteList(list: GetVoltronNoteList.ListItem[]) {
    this.noteList = list;
  }

  setPageConfig(open: boolean, activeKey?: string) {
    if (this.mode === DesignMode.edit) {
      this.pageConfig.open = open;
      this.pageConfig.activeKey = activeKey;
    } else {
      this.pageConfig.open = false;
      this.pageConfig.activeKey = '';
    }
  }

  // setComponentPosition(componentId: ComponentId, position: CommentPosition) {
  //   this.componentPositionDict[componentId] = {
  //     top: Math.round(position.top),
  //     left: Math.round(position.left)
  //   };
  // }

  setPageList(list: PostVoltronPageList.ResItem[]) {
    this.pageList = list;
  }

  setPageRootWrapperRef(ref: HTMLElement) {
    this.pageRootRef = ref;
  }

  setPageWidth(data: number) {
    this.pageWidth = data;
  }

  setPanelTabKey(key: FormConfigType) {
    this.panelTabKey = key;
  }

  setProjectId(projectId: string) {
    this.projectId = projectId;
  }

  setScale(scale: number, origin: CSSProperties['transformOrigin'] = 'center') {
    // 限定缩放范围,[6,800]
    this.scale = Math.floor(Math.min(800, Math.max(6, scale || 100)));
    this.scaleOrigin = origin;
  }

  setSelectedComponentLib(data: string) {
    this.selectedComponentLib = data;
  }

  setSelectedPageId(projectId: string, pageId: string) {
    this.selectedPageId = pageId;
    const openedProjectsStr = window.localStorage.getItem('openedProjects');
    if (openedProjectsStr) {
      const openedProjects = JSON.parse(openedProjectsStr);
      openedProjects[projectId] = pageId;
      window.localStorage.setItem('openedProjects', JSON.stringify(openedProjects));
    } else {
      window.localStorage.setItem('openedProjects', JSON.stringify({ [projectId]: pageId }));
    }
  }

  setSketchViewMode(mode: 'droppable' | 'all') {
    this.sketchViewMode = mode;
  }

  setState(stateName: string, value: any) {
    this.stateDict[stateName] = {
      ...this.stateDict[stateName],
      value
    };
  }

  /**
   * 设置状态，仅针对单个状态进行覆盖，无法精细到对象类型或者数组类型的状态内部的子属性
   *
   * @param key
   * @param value
   */
  setValueToStateDict(key: string, value: any) {
    this.stateDict[key] = value;
  }

  showComment() {
    this.commentOpen = true;
  }

  showReplaceModal(id: ComponentId) {
    // this.replaceModalVisible = true;
    console.debug('showReplaceModal', id);
  }

  /**
   * 同步外部数据，同时禁止其他更新
   *
   * @param key
   * @param value
   */
  syncExternalData(key: string, value: any) {
    this.isSyncing = true;
    this[key] = value;
    this.isSyncing = false;
  }

  toDesignViewMode() {
    this.viewMode = 'design';
  }

  toggleExpandingCanvas() {
    this.toggleLeftPanelVisible();
    this.toggleRightPanelVisible();
  }

  toggleLeftPanelVisible() {
    this.leftPanelVisible = !this.leftPanelVisible;
  }

  /**
   * 模式切换
   */
  toggleMode(targetMode) {
    this.mode = targetMode;
  }

  toggleNote(isOpen?: boolean) {
    if (typeof isOpen === 'boolean') {
      this.showNote = isOpen;
    } else {
      this.showNote = !this.showNote;
    }
  }

  toggleRightPanelVisible() {
    this.rightPanelVisible = !this.rightPanelVisible;
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'design' ? 'code' : 'design';
  }

  updateComponentSizeSketch(scale = 100, iframe: HTMLIFrameElement) {
    if (!iframe) {
      return;
    }
    const zoomingFactor = +(100 / scale).toFixed(2);
    const pageRoot = iframe.contentWindow.document.querySelector('[data-voltron-component=PageRoot]');
    const pageRootRectInfo = pageRoot?.getBoundingClientRect() as ExtDOMRect;
    if (!pageRoot) {
      return;
    }
    const iframeRect = iframe.getBoundingClientRect();
    pageRootRectInfo.relativeTop = 0;
    pageRootRectInfo.relativeLeft = 0;
    const result = {
      id: pageRoot.id,
      rectInfo: {
        x: pageRootRectInfo.x * zoomingFactor + iframeRect.x,
        y: pageRootRectInfo.y * zoomingFactor + iframeRect.y,
        top: pageRootRectInfo.top * zoomingFactor + iframeRect.top,
        right: pageRootRectInfo.right * zoomingFactor + iframeRect.left,
        bottom: pageRootRectInfo.bottom * zoomingFactor + iframeRect.top,
        left: pageRootRectInfo.left * zoomingFactor + iframeRect.left,
        width: pageRootRectInfo.width * zoomingFactor,
        height: pageRootRectInfo.height * zoomingFactor,
        relativeTop: 0,
        relativeLeft: 0
      },
      dom: pageRoot,
      children: []
    };
    this.updateRectInfo(result.id, result.rectInfo as ExtDOMRect);
    Array.prototype.slice.call(pageRoot.children).forEach(child => {
      this.buildVoltronComponentTree(child, result, pageRootRectInfo, zoomingFactor, iframeRect);
    });
    // console.log('update sketch: ', result);
    return result;
  }

  updateRectInfo(id: ComponentId, rect: ExtDOMRect) {
    this.rectInfo[id] = rect;
  }

  private buildVoltronComponentTree(
    dom: Element,
    parentNode,
    pageRootRectInfo: ExtDOMRect,
    zoomingFactor: number,
    iframeRect
  ) {
    // console.log('iframeRect: ', iframeRect);
    let newParentNode = parentNode;
    if ((dom as HTMLElement).dataset.voltronComponent) {
      const rectInfo = dom.getBoundingClientRect() as ExtDOMRect;
      rectInfo.relativeTop = rectInfo.top - pageRootRectInfo.top;
      rectInfo.relativeLeft = rectInfo.left - pageRootRectInfo.left;
      newParentNode = {
        id: (dom as HTMLElement).dataset.voltronId,
        rectInfo: {
          x: rectInfo.x * zoomingFactor + iframeRect.x,
          y: rectInfo.y * zoomingFactor + iframeRect.y,
          top: rectInfo.top * zoomingFactor + iframeRect.top,
          right: rectInfo.right * zoomingFactor + iframeRect.left,
          bottom: rectInfo.bottom * zoomingFactor + iframeRect.top,
          left: rectInfo.left * zoomingFactor + iframeRect.left,
          width: rectInfo.width * zoomingFactor,
          height: rectInfo.height * zoomingFactor,
          relativeTop: rectInfo.relativeTop * zoomingFactor,
          relativeLeft: rectInfo.relativeLeft * zoomingFactor
        },
        dom
      };
      this.updateRectInfo(newParentNode.id, newParentNode.rectInfo);
      parentNode.children = parentNode.children || [];
      parentNode.children.push(newParentNode);
    }
    if (dom.children.length) {
      Array.prototype.slice.call(dom.children).forEach(childDom => {
        this.buildVoltronComponentTree(childDom, newParentNode, pageRootRectInfo, zoomingFactor, iframeRect);
      });
    }
  }
}
