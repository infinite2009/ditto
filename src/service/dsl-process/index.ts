import { makeAutoObservable } from 'mobx';
import IPageSchema from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';

export default class DslProcessor {
  dsl: IPageSchema;

  constructor(dsl: IPageSchema | undefined = undefined) {
    makeAutoObservable(this);
    if (dsl) {
      this.dsl = dsl;
    } else {
      this.initDSL();
    }
  }

  initDSL() {
    // TODO: 待实现
    console.log('insert component works');
    const a = {};
    this.dsl = a as IPageSchema;
  }

  /**
   * 插入一个新的组件
   */
  insertComponent(parentId: string, componentNode: IComponentSchema) {
    console.log('insert component works');
  }

  deleteComponent(id: string) {
    console.log('delete component works');
  }

  moveComponent(targetId: string, sourceId: string) {
    console.log('move component works');
  }

  updateComponentProps(id: string, propsPartial: { [key: string]: any }) {
    console.log('update component props works');
  }

  exportAsTemplate(id: string) {
    console.log('export as template works');
  }
}
