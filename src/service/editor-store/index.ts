import { makeAutoObservable } from 'mobx';
import { ComponentId } from '@/types';

export default class EditorStore {
  componentIdForCopy: ComponentId;
  private hiddenComponents: Record<ComponentId, boolean> = {};

  constructor() {
    makeAutoObservable(this);
  }

  get hasCopiedComponent() {
    return !!this.componentIdForCopy;
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
}
