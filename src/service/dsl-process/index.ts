import { makeAutoObservable } from 'mobx';
import IPageSchema from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';
import { fetchComponentConfig, generateId } from '@/util';
import { nanoid } from 'nanoid';
import IComponentConfig from '@/types/component-config';

export default class DslProcessor {
  dsl: IPageSchema;

  constructor(dsl: IPageSchema | undefined = undefined) {
    makeAutoObservable(this);
    if (dsl) {
      this.dsl = dsl;
    }
  }

  initDSL(dsl: IPageSchema) {
    if (dsl) {
      this.dsl = dsl;
    }
  }

  createEmptyPage(name: string, desc: string) {
    this.dsl = {
      id: generateId(),
      schemaType: 'page',
      name,
      desc,
      child: this.initialAntdRootComponent(),
    };
  }

  initialAntdRootComponent(): IComponentSchema {
    const rootId = generateId();

    return {
      id: rootId,
      schemaType: 'component',
      name: 'Row',
      dependency: 'antd',
      children: [
        this.createComponent('Col', 'antd')
      ]
    };
  }

  createComponent(name: string, dependency: string): IComponentSchema {
    const componentConfig = fetchComponentConfig(name, dependency);
    const componentSchema: IComponentSchema = {
      id: generateId(),
      schemaType: 'component',
      name: componentConfig.name,
      dependency: componentConfig.dependency,
    };
    if (componentConfig.propsConfig.children) {
      componentSchema.children = [];
    }
    return componentSchema;
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
