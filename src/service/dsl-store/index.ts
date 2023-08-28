import { makeAutoObservable } from 'mobx';
import IPageSchema from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';
import { fetchComponentConfig, generateId, typeOf } from '@/util';
import IAnchorCoordinates from '@/types/anchor-coordinate';

export default class DSLStore {
  dsl: IPageSchema;

  anchor: IAnchorCoordinates = { top: 0, left: 0, width: 0, height: 0 };

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

  setAnchorCoordinates(anchor: IAnchorCoordinates) {
    this.anchor = anchor;
  }

  createEmptyPage(name: string, desc: string) {
    this.dsl = {
      id: generateId(),
      schemaType: 'page',
      name,
      desc,
      props: {},
      // 由于类型设计问题，这里需要初始化一个无效节点
      child: {
        id: '',
        name: '',
        dependency: '',
        schemaType: 'component',
        propsRefs: []
      }
    };
    this.dsl.child = this.createComponent('div', 'html');
  }

  createComponent(name: string, dependency: string): IComponentSchema {
    const componentId = generateId();
    const componentConfig = fetchComponentConfig(name, dependency);
    const componentSchema: IComponentSchema = {
      id: componentId,
      schemaType: 'component',
      name: componentConfig.name,
      dependency: componentConfig.dependency,
      propsRefs: [],
      children: componentConfig.propsConfig.children ? [] : undefined
    };
    const { propsConfig } = componentConfig;
    this.dsl.props[componentId] = {};
    const props = this.dsl.props[componentId];
    Object.values(propsConfig).forEach(item => {
      const { name, initialValue } = item;
      props[name] = {
        id: name,
        schemaType: 'props',
        name: name,
        valueType: typeOf(initialValue) as 'string' | 'number' | 'boolean' | 'object' | 'function' | 'array',
        valueSource: 'editorInput',
        value: initialValue
      };
      componentSchema.propsRefs.push(name);
    });
    return componentSchema;
  }

  /**
   * 插入一个新的组件
   */
  insertComponent(parentId: string, name: string, dependency: string, insertIndex = undefined) {
    console.log('insert component works');
    const newComponentNode = this.createComponent(name, dependency);
    const parentNode = this.fetchComponentInDSL(parentId);
    if (parentNode) {
      // 如果没有 children，初始化一个，如果需要初始化，说明初始化父节点的代码有 bug
      parentNode.children = parentNode.children || [];
      if (insertIndex === undefined) {
        parentNode.children.push(newComponentNode);
      } else {
        parentNode.children.splice(insertIndex, 0, newComponentNode);
      }
    } else {
      throw new Error(`未找到有效的父节点：${parentId}`);
    }
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

  fetchComponentInDSL(id: string) {
    // TODO: 广度遍历
    let q: IComponentSchema[] = [this.dsl.child];
    while(q.length) {
      const node = q.shift();
      if (node) {
        if (node.id === id) {
          return node;
        }
        if (node.children?.length) {
          q = q.concat(node.children);
        }
      }
    }
    return null;
  }
}
