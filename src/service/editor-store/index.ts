import { makeAutoObservable } from 'mobx';
import { ComponentId } from '@/types';
import DbStore from '@/service/db-store';

export type ViewMode = 'design' | 'code';

export enum DesignMode {
  edit = 'edit',
  preview = 'preview',
  comment = 'comment'
}

export type CommentPosition = {
  top: number;
  left: number;
};

export default class EditorStore {
  componentIdForCopy: ComponentId;
  leftPanelVisible = true;
  rightPanelVisible = true;
  selectedPath: string;
  viewMode: ViewMode = 'design';
  framework: 'React' | 'Vue' = 'React';
  language: 'TypeScript' | 'JavaScript' = 'TypeScript';
  mode: DesignMode = DesignMode.edit;
  relativeCommentPosition: CommentPosition = { top: 0, left: 0 };
  commentOpen: boolean = false;
  componentId: ComponentId;
  private componentPositionDict: Record<string, CommentPosition> = {};
  private hiddenComponents: Record<ComponentId, boolean> = {};

  constructor() {
    makeAutoObservable(this);
  }

  get hasCopiedComponent() {
    return !!this.componentIdForCopy;
  }

  async createComment(data: { dslId: string; content: string }) {
    await DbStore.createComment({
      ...data,
      resolved: 0,
      componentId: this.componentId,
      positionTop: this.relativeCommentPosition.top,
      positionLeft: this.relativeCommentPosition.left
    });
  }

  setFramework(framework: 'React' | 'Vue', language: 'TypeScript' | 'JavaScript') {
    this.framework = framework;
    this.language = language;
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'design' ? 'code' : 'design';
  }

  toggleExpandingCanvas() {
    this.toggleLeftPanelVisible();
    this.toggleRightPanelVisible();
  }

  toggleCommentMode() {
    if (this.mode === DesignMode.comment) {
      this.mode = DesignMode.edit;
    } else {
      this.mode = DesignMode.comment;
    }
  }

  /**
   * 记录评论对于为组件的位置
   *
   * @param postion
   */
  setCommentPosition(postion: CommentPosition) {
    this.relativeCommentPosition = postion;
  }

  setComponentIdForComment(componentId: ComponentId) {
    this.componentId = componentId;
  }

  setComponentPosition(componentId: ComponentId, position: CommentPosition) {
    this.componentPositionDict[componentId] = position;
  }

  /**
   * 获取评论
   */
  getCommentPosition() {
    const { top, left } = this.componentPositionDict[this.componentId];
    return {
      top: this.relativeCommentPosition.top + top,
      left: this.relativeCommentPosition.left + left
    };
  }

  showComment() {
    this.commentOpen = true;
  }

  closeComment() {
    this.commentOpen = false;
  }

  toggleLeftPanelVisible() {
    this.leftPanelVisible = !this.leftPanelVisible;
  }

  toggleRightPanelVisible() {
    this.rightPanelVisible = !this.rightPanelVisible;
  }

  /**
   * 判断指定组件是否可见
   *
   * @param componentId
   */
  isVisible(componentId: ComponentId) {
    // 如果从隐藏组件字典里查不到，就是可见的
    return !this.hiddenComponents[componentId];
  }

  setComponentIdForCopy(componentId: ComponentId) {
    this.componentIdForCopy = componentId;
  }

  setSelectedPath(path: string) {
    this.selectedPath = path;
  }

  /**
   * 保存评论
   * @param dslId
   * @param componentId
   * @param content 目前是纯文本，将来升级为富文本
   */
  async saveComment(dslId: string, componentId: ComponentId, content: string) {}
}
