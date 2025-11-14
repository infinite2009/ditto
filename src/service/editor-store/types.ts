import { ComponentId } from '@/types';
import { CommentInfo } from '@/service/db-store';
import { MenuConfig } from '@/pages/editor/page-config/MenuConfig';
import { NavConfig } from '@/pages/editor/page-config/NavConfig';
import { CSSProperties } from 'react';
import { GetVoltronNoteList, PostVoltronPageList } from '@/api';

export type ViewMode = 'design' | 'code';

export type FormConfigType = 'basic' | 'style' | 'data' | 'event' | 'action' | 'note';

export enum DesignMode {
  edit = 'edit',
  preview = 'preview',
  comment = 'comment',
  HISTORY = 'history',
  /** 回滚模式，用于回滚到指定版本, 此过程中除了历史列表，其他大多数交互功能均不可用, 直到用户点击 【返回编辑】 按钮 */
  rollback = 'rollback',
}

export type CommentPosition = {
  top: number;
  left: number;
};

export type PageConfig = {
  open?: boolean;
  activeKey?: string;
  navConfig?: NavConfig;
  menuConfig?: MenuConfig;
};

export type NoteItem = GetVoltronNoteList.ListItem;

export interface ComponentDraggingInfo {
  dependency?: string;
  dndType: 'insert' | 'move' | 'insertFragment';
  id?: ComponentId;
  initialLeft: number;
  initialTop: number;
  isInCanvas: boolean;
  isLayer?: boolean;
  isMoving: boolean;
  left: number;
  name: string;
  title?: string | any;
  top: number;
}

export interface ExtDOMRect extends DOMRect {
  relativeLeft: number;
  relativeTop: number;
}

// 1. 基础状态接口
interface IEditorState {
  canvasRect: DOMRect;
  commentList: CommentInfo[];
  commentOpen: boolean;
  componentDraggingInfo: ComponentDraggingInfo;
  componentIdForComment: ComponentId;
  componentIdForCopy: ComponentId;
  componentPropsDict: Record<ComponentId, Record<string, any>>;
  framework: 'React' | 'Vue';
  highlightComponent: ComponentId;
  hoveredComponentId: ComponentId;
  instanceId: string;
  isFetchingNoteList: boolean;
  isSaving: boolean;
  language: 'TypeScript' | 'JavaScript';
  leftPanelVisible: boolean;
  mode: DesignMode;
  noteList: NoteItem[];
  pageConfig: PageConfig;
  pageList: PostVoltronPageList.ResItem[];
  pageRootRef: HTMLElement;
  panelTabKey: FormConfigType;
  projectId: string;
  rightPanelVisible: boolean;
  scale: number;
  scaleOrigin: CSSProperties['transformOrigin'];
  selectedPageId: string;
  showNote: boolean;
  sketchViewMode: 'droppable' | 'all';
  viewMode: ViewMode;
}

// 2. Getter 接口
interface IEditorGetters {
  hasCopiedComponent: boolean;
  menuConfig: MenuConfig;
  navConfig: NavConfig;
  selectPage: PostVoltronPageList.ResItem;
}

// 3. 页面配置操作接口
interface IPageConfigOperations {
  initPageConfig: (data: PageConfig) => void;
  setActiveKeyOfPageConfig: (activeKey: string) => void;
  setMenuConfig: (val: MenuConfig) => void;
  setNavConfig: (val: NavConfig) => void;
  setPageConfig: (open: boolean, activeKey?: string) => void;
  setProjectId: (projectId: string) => void;
}

// 4. 组件拖拽操作接口
interface IComponentDragOperations {
  clearComponentDraggingInfo: () => void;
  setComponentDraggingCoordinates: (data: { top: number; left: number }) => void;
  setComponentDraggingInfo: (data: ComponentDraggingInfo) => void;
  setIsInCanvas: (val: boolean) => void;
  setMoving: () => void;
}

// 5. 视图模式操作接口
interface IViewModeOperations {
  toggleExpandingCanvas: () => void;
  toggleLeftPanelVisible: () => void;
  toggleMode: (targetMode: DesignMode) => void;
  toggleNote: (isOpen?: boolean) => void;
  toggleRightPanelVisible: () => void;
  toggleViewMode: () => void;
}

// 6. 注释操作接口
interface ICommentOperations {
  clearComponentIdForComment: () => void;
  closeComment: () => void;
  fetchCommentByComponentId: (id: ComponentId) => CommentInfo;
  setCommentList: (commentList: CommentInfo[]) => void;
  setComponentIdForComment: (componentId: ComponentId) => void;
  showComment: () => void;
}

// 7. 页面管理接口
interface IPageManagement {
  fetchPageList: () => Promise<any[]>;
  removeOpenedPage: (projectId: string) => void;
  setFetchPageList: (fn?: () => Promise<any[]>) => void;
  setPageList: (list: PostVoltronPageList.ResItem[]) => void;
  setSelectedPageId: (projectId: string, pageId: string) => void;
}

// 8. 笔记管理接口
interface INoteManagement {
  getNoteList: () => Promise<any[]>;
  setGetNoteList: (fn?: () => Promise<any[]>) => void;
  setIsFetchingNoteList: (isFetching: boolean) => void;
  setNoteList: (list: GetVoltronNoteList.ListItem[]) => void;
}

// 9. 组件属性操作接口
interface IComponentOperations {
  isVisible: (componentId: ComponentId) => boolean;
  setComponentIdForCopy: (componentId: ComponentId) => void;
  setComponentProps: (componentId: ComponentId, propsName: string, propsValue: any) => void;
  setHighlightComponent: (id: ComponentId) => void;
  setHoveredComponentId: (id: ComponentId) => void;
}

// 10. 缩放和布局接口
interface ILayoutOperations {
  getPageRootWrapperRef: () => HTMLElement;
  getRectInfo: (id: ComponentId, zoomingScale?: number) => ExtDOMRect;
  setPageRootWrapperRef: (ref: HTMLElement) => void;
  setScale: (scale: number, origin?: CSSProperties['transformOrigin']) => void;
  updateComponentSizeSketch: (scale?: number, iframe?: HTMLIFrameElement) => any;
  updateRectInfo: (id: ComponentId, rect: ExtDOMRect) => void;
}

// 11. 其他设置接口
interface ISettingsOperations {
  setFramework: (framework: 'React' | 'Vue', language: 'TypeScript' | 'JavaScript') => void;
  setIsSaving: (val: boolean) => void;
  setPanelTabKey: (key: FormConfigType) => void;
  setSketchViewMode: (mode: 'droppable' | 'all') => void;
}

// 完整的 EditorStore 接口
export type IEditorStore = IEditorState &
  IEditorGetters &
  IPageConfigOperations &
  IComponentDragOperations &
  IViewModeOperations &
  ICommentOperations &
  IPageManagement &
  INoteManagement &
  IComponentOperations &
  ILayoutOperations &
  ISettingsOperations;
