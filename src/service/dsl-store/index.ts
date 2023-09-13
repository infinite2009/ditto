import { makeAutoObservable, toJS } from 'mobx';
import IPageSchema from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';
import { fetchComponentConfig, generateId, typeOf } from '@/util';
import IAnchorCoordinates from '@/types/anchor-coordinate';
import cloneDeep from 'lodash/cloneDeep';
import IComponentConfig from '@/types/component-config';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { ComponentId } from '@/types';
import EditableText from '@/components/editable-text';
import { CodeSandboxOutlined } from '@ant-design/icons';

export default class DSLStore {
  private static instance = new DSLStore();
  dsl: IPageSchema;
  componentStats: { [key: string]: number } = {};
  anchor: IAnchorCoordinates = { top: 0, left: 0, width: 0, height: 0 };
  currentParentNode: IComponentSchema | IPageSchema | null = null;

  private constructor(dsl: IPageSchema | undefined = undefined) {
    makeAutoObservable(this);
    if (dsl) {
      this.initDSL(dsl);
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
    const pageId = generateId();
    this.dsl = {
      id: pageId,
      schemaType: 'page',
      name,
      desc,
      props: {},
      // 由于类型设计问题，这里需要初始化一个无效节点
      child: {
        current: '',
        isText: true
      },
      componentIndexes: {}
    };
    const pageRoot = this.createPageRoot();
    this.dsl.child = {
      current: pageRoot.id,
      isText: false
    };
  }

  /**
   * 生成组件
   *
   * @param name
   * @param dependency
   * @param extProps 定开场景支持
   */
  createComponent(
    name: string,
    dependency: string,
    extProps: { [key: string]: any } | undefined = undefined
  ): IComponentSchema {
    if (this.componentStats[name] === undefined) {
      this.componentStats[name] = 0;
    } else {
      this.componentStats[name]++;
    }
    const componentId = `${name}${this.componentStats[name]}`;
    const componentConfig = fetchComponentConfig(name, dependency);
    let children: ComponentSchemaRef[];
    if (componentConfig.isContainer) {
      children = [];
    } else if (componentConfig.children) {
      const { value } = componentConfig.children;
      const typeOfChildren = typeOf(value);
      if (typeOfChildren === 'array') {
        const emptyContainer = this.createEmptyContainer();
        children = [
          {
            current: emptyContainer.id,
            isText: false
          }
        ];
      } else {
        children = [
          {
            current: value as string,
            isText: true
          }
        ];
      }
    } else {
      // 即使这里是空数组，由于渲染的时候，不会插入 droppable 元素，所以也不会插入 dsl 导致 bug
      children = [];
    }

    const componentSchema: IComponentSchema = {
      id: componentId,
      parentId: (this.currentParentNode?.id || this.dsl.id) as string,
      schemaType: 'component',
      name: this.calculateComponentName(componentConfig),
      configName: componentConfig.configName,
      dependency: componentConfig.dependency,
      propsRefs: [],
      children
    };

    if (componentConfig.importName) {
      componentSchema.importName = componentConfig.importName;
    }
    if (componentConfig.callingName) {
      componentSchema.callingName = componentConfig.callingName;
    }

    const { propsConfig } = componentConfig;
    this.dsl.props[componentId] = {};
    const props = this.dsl.props[componentId];
    Object.values(propsConfig).forEach(item => {
      const { name, value, templateKeyPathsReg = [] } = item;
      props[name] = item;
      // 针对某些特殊情形
      if (extProps) {
        if (typeOf(props[name].value) === 'object') {
          Object.assign(props[name].value, extProps[name]);
        } else {
          props[name].value = extProps[name];
        }
      }
      if (templateKeyPathsReg.length) {
        const cp = cloneDeep(value);
        const wrapper = { cp };
        this.setTemplateTo(cp, templateKeyPathsReg, wrapper, 'cp', '');
        props[name].value = wrapper.cp;
      }
      componentSchema.propsRefs.push(name);
    });

    // 加入索引，必须要放最后，因为 this.dsl.componentIndexes[componentSchema.id] 和 componentSchema 不是一个引用
    this.dsl.componentIndexes[componentSchema.id] = componentSchema;
    return componentSchema;
  }

  /**
   * 插入一个新的组件
   */
  insertComponent(parentId: string, name: string, dependency: string, insertIndex = -1) {
    this.currentParentNode = this.fetchComponentInDSL(parentId);
    if (this.currentParentNode) {
      const newComponentNode = this.createComponent(name, dependency);

      // 如果没有 children，初始化一个，如果需要初始化，说明初始化父节点的代码有 bug
      this.currentParentNode.children = this.currentParentNode.children || [];
      const ref = {
        current: newComponentNode.id,
        isText: false
      };
      if (insertIndex === -1) {
        this.currentParentNode.children.push(ref);
      } else {
        this.currentParentNode.children.splice(insertIndex, 0, ref);
      }
    } else {
      throw new Error(`未找到有效的父节点：${parentId}`);
    }
  }

  /**
   * 由于 DSL 的设计特性，嵌套的 template 之间一定会有一层容器作为插槽，所以删除插槽内的节点，只需要遍历插槽的 children
   *
   * @param id
   */
  deleteComponent(id: ComponentId, removeIndex = true): IComponentSchema | null {
    const { componentIndexes } = this.dsl;
    const component = componentIndexes[id];
    const parent = componentIndexes[component.parentId];
    if (parent) {
      parent.children = parent.children.filter(item => item.current !== id);
      if (removeIndex) {
        delete componentIndexes[id];
      }
      return component;
    }
    return null;
  }

  moveComponent(parentId: string, childId: string, insertIndex = -1) {
    this.currentParentNode = this.fetchComponentInDSL(parentId);
    if (this.currentParentNode) {
      const { children } = this.currentParentNode;
      const childIndex = children.length ? children.findIndex(item => item.current === childId && !item.isText) : -1;
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
        const childComponent = this.deleteComponent(childId, false);
        if (childComponent) {
          const ref = {
            current: childComponent.id,
            isText: false
          };
          if (insertIndex === -1) {
            children.push(ref);
          } else {
            children.splice(insertIndex, 0, ref);
          }
          // 变更父节点
          childComponent.parentId = this.currentParentNode.id;
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
    const { componentIndexes } = this.dsl;
    return componentIndexes[id];
  }

  createEmptyContainer(ext: { [key: string]: any } | undefined = undefined) {
    return this.createComponent('column', 'html', ext);
  }

  setTemplateTo(
    data: any,
    keyPathRegs: {
      path: string;
      type: 'object' | 'function';
    }[] = [],
    parent: any,
    key = '',
    currentKeyPath = ''
  ) {
    const keyPathMatchResult =
      keyPathRegs.length &&
      keyPathRegs.find(pathObj => {
        return new RegExp(pathObj.path).test(currentKeyPath);
      });
    // 如果当前 keyPath 命中正则表达式
    if (keyPathMatchResult) {
      const node = this.createEmptyContainer();
      parent[key] = {
        current: node.id,
        isText: false
      };
    } else {
      const type = typeOf(data);
      if (type === 'object') {
        Object.entries(data).forEach(([key, val]) => {
          this.setTemplateTo(
            val,
            keyPathRegs,
            data,
            key,
            `${currentKeyPath ? currentKeyPath + '.' : currentKeyPath}${key}`
          );
        });
      } else if (type === 'array') {
        data.forEach((item: any, index: number) => {
          this.setTemplateTo(item, keyPathRegs, data, index.toString(), `${currentKeyPath}[${index}]`);
        });
      }
    }
  }

  private calculateComponentName(config: IComponentConfig) {
    const { callingName, importName, configName } = config;
    if (callingName) {
      // callingName 里可能有调用符，需要去掉
      return callingName.replace(/\./g, '');
    }
    return importName || configName;
  }

  private createPageRoot() {
    if (this.componentStats.pageRoot === undefined) {
      this.componentStats.pageRoot = 0;
    } else {
      this.componentStats.pageRoot++;
    }
    const componentId = `pageRoot${this.componentStats.pageRoot}`;
    const componentConfig = fetchComponentConfig('pageRoot', 'html');

    const componentSchema: IComponentSchema = {
      id: componentId,
      parentId: (this.currentParentNode?.id || this.dsl.id) as string,
      schemaType: 'component',
      name: this.calculateComponentName(componentConfig),
      configName: componentConfig.configName,
      dependency: componentConfig.dependency,
      propsRefs: [],
      children: []
    };

    if (componentConfig.importName) {
      componentSchema.importName = componentConfig.importName;
    }
    if (componentConfig.callingName) {
      componentSchema.callingName = componentConfig.callingName;
    }

    this.dsl.componentIndexes[componentSchema.id] = componentSchema;
    return componentSchema;
  }
}
