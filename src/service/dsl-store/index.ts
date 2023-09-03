import { makeAutoObservable } from 'mobx';
import IPageSchema from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';
import { fetchComponentConfig, generateId, typeOf } from '@/util';
import IAnchorCoordinates from '@/types/anchor-coordinate';
import { ValueType } from '@/types/value-type';

export default class DSLStore {
  private static instance = new DSLStore();
  dsl: IPageSchema;
  componentStats: { [key: string]: number } = {};
  anchor: IAnchorCoordinates = { top: 0, left: 0, width: 0, height: 0 };

  private constructor(dsl: IPageSchema | undefined = undefined) {
    makeAutoObservable(this);
    if (dsl) {
      this.dsl = dsl;
    }
  }

  static createInstance(dsl: IPageSchema | undefined = undefined) {
    if (dsl) {
      DSLStore.instance.initDSL(dsl);
    }
    return DSLStore.instance;
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
    this.dsl.child = this.createEmptyContainer();
  }

  createComponent(name: string, dependency: string): IComponentSchema {
    if (this.componentStats[name] === undefined) {
      this.componentStats[name] = 0;
    } else {
      this.componentStats[name]++;
    }
    const componentId = `${name}${this.componentStats[name]}`;
    const componentConfig = fetchComponentConfig(name, dependency);
    let children;
    if (componentConfig.isContainer) {
      children = [];
    } else if (componentConfig.children) {
      const { value } = componentConfig.children;
      const typeOfChildren = typeOf(value);
      if (typeOfChildren === 'array') {
        children = [this.createEmptyContainer()];
      } else {
        children = value;
      }
    }

    const componentSchema: IComponentSchema = {
      id: componentId,
      schemaType: 'component',
      name: componentConfig.name,
      dependency: componentConfig.dependency,
      propsRefs: [],
      children
    };
    const { propsConfig } = componentConfig;
    this.dsl.props[componentId] = {};
    const props = this.dsl.props[componentId];
    Object.values(propsConfig).forEach(item => {
      const { name, value, templateKeyPathsReg } = item;
      if (templateKeyPathsReg && templateKeyPathsReg.length) {
        // TODO: 初始化插槽
      } else {
        props[name] = {
          id: name,
          schemaType: 'props',
          name: name,
          valueType: typeOf(value) as ValueType,
          valueSource: 'editorInput',
          value
        };
      }
      componentSchema.propsRefs.push(name);
    });
    return componentSchema;
  }

  /**
   * 插入一个新的组件
   */
  insertComponent(parentId: string, name: string, dependency: string, insertIndex = -1) {
    const newComponentNode = this.createComponent(name, dependency);
    const parentNode = this.fetchComponentInDSL(parentId);
    if (parentNode) {
      // 如果没有 children，初始化一个，如果需要初始化，说明初始化父节点的代码有 bug
      parentNode.children = parentNode.children || [];
      if (insertIndex === -1) {
        (parentNode.children as IComponentSchema[]).push(newComponentNode);
      } else {
        (parentNode.children as IComponentSchema[]).splice(insertIndex, 0, newComponentNode);
      }
    } else {
      throw new Error(`未找到有效的父节点：${parentId}`);
    }
  }

  deleteComponent(id: string) {
    let q: IComponentSchema[] = [this.dsl.child];
    while (q.length) {
      const node = q.shift();
      if (node) {
        if (typeOf(node.children) === 'array' && node.children?.length) {
          const index = (node.children as IComponentSchema[]).findIndex(item => item.id === id);
          if (index > -1) {
            return (node.children as IComponentSchema[]).splice(index, 1)[0];
          }
          q = q.concat(node.children as IComponentSchema[]);
        }
      }
    }
    return null;
  }

  moveComponent(parentId: string, childId: string, insertIndex = -1) {
    const parentNode = this.fetchComponentInDSL(parentId);
    if (parentNode) {
      if (typeOf(parentNode.children) !== 'array') {
        return;
      }
      const children = parentNode.children as IComponentSchema[];
      const childIndex = children.length ? children.findIndex(item => item.id === childId) : -1;
      if (childIndex > -1) {
        const [child] = children.splice(childIndex, 1);
        if (insertIndex > childIndex) {
          // 向后移动
          children.splice(insertIndex - 1, 0, child);
        } else {
          // 向前移动
          children.splice(insertIndex, 0, child);
        }
      } else {
        const childComponent = this.deleteComponent(childId);
        if (childComponent) {
          if (insertIndex === -1) {
            (parentNode.children as IComponentSchema[]).push(childComponent);
          } else {
            (parentNode.children as IComponentSchema[]).splice(insertIndex, 0, childComponent);
          }
        }
      }
    } else {
      throw new Error(`未找到有效的父节点：${parentId}`);
    }
  }

  updateComponentProps(id: string, propsPartial: { [key: string]: any }) {
    console.log('update component props works');
  }

  exportAsTemplate(id: string) {
    console.log('export as template works');
  }

  fetchComponentInDSL(id: string) {
    let q: IComponentSchema[] = [this.dsl.child];
    while (q.length) {
      const node = q.shift();
      if (node) {
        if (node.id === id) {
          return node;
        }
        if (typeOf(node.children) === 'array' && node.children?.length) {
          q = q.concat(node.children as IComponentSchema[]);
        }
      }
    }
    return null;
  }

  createEmptyContainer() {
    return this.createComponent('div', 'html');
  }
}
