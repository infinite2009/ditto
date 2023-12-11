import { makeAutoObservable } from 'mobx';

export default class AppStore {
  // 场景
  scene;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * 切换场景
   * @param newScene
   */
  switchScene(newScene: any) {
    this.scene = newScene;
  }
}
