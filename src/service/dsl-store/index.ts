import { makeAutoObservable, toJS } from 'mobx';
import IPageSchema from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';
import {
  flattenObject,
  generateId,
  generateSlotId,
  getParentKeyPath,
  getValueByPath,
  hyphenToCamelCase,
  typeOf
} from '@/util';
import cloneDeep from 'lodash/cloneDeep';
import IComponentConfig, { IPropsConfigItem } from '@/types/component-config';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { ComponentId, TemplateInfo } from '@/types';
import IPropsSchema, { TemplateKeyPathsReg } from '@/types/props.schema';
import IFormConfig from '@/types/form-config';
import { CSSProperties, ReactNode } from 'react';
import { isArray, isObject, mergeWith } from 'lodash';
import { detailedDiff } from 'deep-object-diff';
import ComponentFeature from '@/types/component-feature';
import InsertType from '@/types/insert-type';
import fileManager from '@/service/file';
import { exists } from '@tauri-apps/api/fs';
import ComponentManager from '@/service/component-manager';

type FormValue = {
  style: CSSProperties;
  basic: Record<string, any>;
  event: Record<string, any>;
  data: Record<string, any>;
  children: ReactNode;
  // 纯为了避免类型检查错误
  [key: string]: any;
};

interface TemplateTree {
  configName: string;
  dependency: string;
  children?: TemplateTree[];
}

function execute(target: any, name: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    // 延时保存
    this.shouldSave = true;
    if (this.autoSavePid !== null) {
      window.clearTimeout(this.autoSavePid);
    }
    this.autoSavePid = setTimeout(() => {
      this.savePageDSLFile();
    }, 10000);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const oldDsl = toJS(this.dsl);
    const result = originalMethod.apply(this, args);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newDsl = toJS(this.dsl);
    const diff = detailedDiff(newDsl, oldDsl);
    if (!diff) {
      return;
    }
    const { added, updated, deleted } = diff;
    if (
      Object.keys(added || {}).length === 0 &&
      Object.keys(updated || {}).length === 0 &&
      Object.keys(deleted || {}).length === 0
    ) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.undoStack.push(diff);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.redoStack = [];
    return result;
  };
}

export default class DSLStore {
  currentParentNode: IComponentSchema | IPageSchema | null = null;
  dsl: IPageSchema;
  selectedComponent: IComponentSchema;
  shouldSave = false;

  // 存储组件的隐藏状态
  private hiddenComponentDict: Record<ComponentId, boolean> = {};
  private redoStack: any[] = [];
  private totalFormConfig: Record<string, IFormConfig>;
  private undoStack: any[] = [];
  private filePath: string;
  private autoSavePid: number = null;

  constructor(dsl: IPageSchema | undefined = undefined) {
    makeAutoObservable(this);
    if (dsl) {
      this.initDSL(dsl);
    }
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get formConfigOfSelectedComponent() {
    if (!this.totalFormConfig) {
      return null;
    }
    if (!this.selectedComponent) {
      return null;
    }
    const { configName, name } = this.selectedComponent;
    return this.totalFormConfig[configName || name];
  }

  /**
   * 页面是否为空
   */
  get isEmpty() {
    // 如果尚未初始化，则不认为是空的
    if (!this.dsl?.componentIndexes) {
      return false;
    }
    const pageRoot = this.dsl.componentIndexes[this.dsl.child.current];
    if (pageRoot) {
      return pageRoot.children.length === 0;
    }
    return false;
  }

  get valueOfSelectedComponent() {
    if (!this.selectedComponent) {
      return null;
    }
    const props = this.dsl.props[this.selectedComponent.id];
    const result: Partial<FormValue> = {
      style: {},
      basic: {},
      event: {},
      data: {},
      hidden: {}
    };
    Object.keys(props || {}).forEach(key => {
      const propSchema: IPropsSchema = props[key];
      const { value, category } = propSchema;
      if (result[category]) {
        if (key === 'style') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          result[category] = value;
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          result[category][key] = value;
        }
      }
    });

    if (
      this.formConfigOfSelectedComponent?.schema?.basic &&
      'children' in this.formConfigOfSelectedComponent.schema.basic
    ) {
      result.basic.children = this.selectedComponent.children[0].current;
    }

    return result;
  }

  get pageRoot() {
    return this.dsl.componentIndexes[this.dsl.child.current];
  }

  setCurrentFile(filePath: string) {
    this.filePath = filePath;
  }

  async savePageDSLFile() {
    if (this.shouldSave) {
      if (this.filePath && (await exists(this.filePath))) {
        await fileManager.savePageDSLFile(this.filePath, this.dsl);
        this.shouldSave = false;
        console.log('已自动保存');
      } else {
        console.error(`文件路径 ${this.filePath} 不存在`);
      }
    } else {
      console.log('已经保存过了');
    }
  }

  /**
   * 应用模板，仅应该对空页面进行应用
   * @param path
   */
  async applyTemplate(path: string) {
    try {
      const content = await fileManager.readFile(path);
      if (content) {
        this.initDSL(JSON.parse(content));
      } else {
        console.error('模板文件为空');
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   *
   */
  @execute
  clearPage() {
    if (Object.keys(this.dsl.componentIndexes).length === 1) {
      return;
    }
    this.createEmptyDSL(this.dsl.name);
  }

  /**
   * 克隆组件
   *
   * @param id
   * @param relatedId
   * @param index
   */
  @execute
  cloneComponent(id: ComponentId, relatedId: ComponentId, insertType: InsertType) {
    const clonedSubtree = this.cloneSubtree(id);
    if (!clonedSubtree) {
      return;
    }
    let index;
    let target;

    switch (insertType) {
      case InsertType.insertAfter:
        // 插入目标组件的后边，所以先去拿到它在父组件中的位置
        index = this.findIndexInParent(relatedId) + 1;
        // 因为是往后插，所以必须要大于 0
        if (index > 0) {
          target = this.dsl.componentIndexes[this.dsl.componentIndexes[relatedId].parentId];
        }
        break;
      case InsertType.insertBefore:
        index = this.findIndexInParent(relatedId);
        if (index > -1) {
          target = this.dsl.componentIndexes[this.dsl.componentIndexes[relatedId].parentId];
        }
        break;
      case InsertType.insertInFirst:
        target = this.dsl.componentIndexes[relatedId];
        index = 0;
        break;
      case InsertType.insertInLast:
        target = this.dsl.componentIndexes[relatedId];
        index = target.children.length;
        break;
      default:
        index = 0;
        break;
    }

    if (target && index > -1) {
      target.children.splice(index, 0, {
        current: clonedSubtree.id,
        isText: false
      });
    }
  }

  /**
   * 生成组件
   *
   * @param name
   * @param dependency
   * @param customId
   * @param extProps 定开场景支持
   */
  createComponent(
    name: string,
    dependency: string,
    customId = '',
    extProps: { [key: string]: any } | undefined = undefined
  ): IComponentSchema {
    let componentId = '';
    if (customId) {
      componentId = customId;
    } else {
      componentId = this.generateComponentIdByName(name);
    }

    const componentConfig = ComponentManager.fetchComponentConfig(name, dependency);
    let children: ComponentSchemaRef[];
    if (componentConfig?.isContainer) {
      children = [];
    } else if (componentConfig?.children) {
      // 给当前组件的 children 节点初始化一个空插槽
      const { value, type } = componentConfig?.children;
      if (type === 'slot') {
        const emptyContainer = this.createEmptyContainer('', { feature: ComponentFeature.slot });
        // 修正父节点 id
        emptyContainer.parentId = componentId;
        children = [
          {
            current: emptyContainer.id,
            isText: false
          }
        ];
      } else if (type === 'text') {
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

    this.dsl.componentIndexes[componentId] = {
      id: componentId,
      // 默认都设置为 solid
      feature: ComponentFeature.solid,
      schemaType: 'component',
      name: this.calculateComponentName(componentConfig),
      displayName: `${componentConfig?.title}${this.dsl.componentStats[name]}`,
      configName: componentConfig?.configName,
      importName: componentConfig?.importName,
      dependency: componentConfig?.dependency,
      noImport: componentConfig?.noImport || false,
      propsRefs: [],
      children
    } as IComponentSchema;

    const componentSchema = this.dsl.componentIndexes[componentId];

    // pageRoot 不用赋值
    if (this.currentParentNode?.id) {
      componentSchema.parentId = this.currentParentNode?.id;
    }

    if (componentConfig?.importName) {
      componentSchema.importName = componentConfig.importName;
    }
    if (componentConfig?.callingName) {
      componentSchema.callingName = componentConfig.callingName;
    }

    if (componentConfig?.isContainer) {
      // 可能有 bug，就是把本该设置为插槽的组件，设置为 container
      componentSchema.feature = ComponentFeature.container;
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
          Object.assign(props[name].value as object, extProps[name]);
        } else {
          props[name].value = extProps[name];
        }
      }
      if (templateKeyPathsReg.length) {
        const cp = cloneDeep(value);
        const wrapper = { cp };
        this.setTemplateTo(
          {
            value: cp,
            keyPathRegs: templateKeyPathsReg,
            parent: wrapper,
            key: 'cp',
            currentKeyPath: '',
            nodeId: componentId
          },
          propsConfig
        );
        props[name].value = wrapper.cp;
      }
      componentSchema.propsRefs.push(name);
    });

    return componentSchema;
  }

  /**
   * 创建一个空的容器，可以配置选项来表明它是容器还是插槽
   *
   * @param customId
   * @param opt
   */
  createEmptyContainer(
    customId = '',
    opt: { feature: ComponentFeature; data?: { [key: string]: any } } | undefined = undefined
  ) {
    const component = this.createComponent('VerticalFlex', 'antd', customId, opt?.data);
    if (opt?.feature === ComponentFeature.slot) {
      component.feature = ComponentFeature.slot;
    }
    return component;
  }

  createEmptyDSL(name: string, desc = '') {
    const pageId = generateId();
    this.dsl = {
      actions: {},
      events: {},
      handlers: {},
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
      componentIndexes: {},
      componentStats: {}
    };
    const pageRoot = this.createPageRoot();
    this.dsl.child = {
      current: pageRoot.id,
      isText: false
    };
  }

  /**
   * 由于 DSL 的设计特性，嵌套的 template 之间一定会有一层容器作为插槽，所以删除插槽内的节点，只需要遍历插槽的 children
   *
   * @param id
   * @param removeIndex
   */
  @execute
  deleteComponent(id: ComponentId): IComponentSchema | null {
    return this.dangerousDeleteComponent(id);
  }

  deleteChild(id: ComponentId, index: number): IComponentSchema | null {
    if (index < 0) {
      return;
    }
    const currentComponent = this.dsl.componentIndexes[id];
    if (!currentComponent.children || typeOf(currentComponent.children) !== 'array') {
      return;
    }
    if (index >= currentComponent.children.length) {
      return;
    }
    this.deleteComponent(currentComponent.children[index].current);
  }

  /**
   * 插入一个新的组件
   */
  @execute
  insertComponent(parentId: string, name: string, dependency: string, insertIndex = -1) {
    return this.dangerousInsertComponent(parentId, name, dependency, insertIndex);
  }

  fetchComponentInDSL(id: string) {
    const { componentIndexes } = this.dsl;
    return componentIndexes[id];
  }

  findChildren(id: ComponentId): IComponentSchema[] {
    if (!id || !this.dsl.componentIndexes) {
      return [];
    }
    return Object.values(this.dsl.componentIndexes).filter(cmp => cmp.parentId === id);
  }

  hideComponent(id: ComponentId) {
    if (id) {
      this.hiddenComponentDict[id] = true;
      // 子节点也隐藏下
      const children = this.findChildren(id);
      if (children.length) {
        children.forEach(child => {
          this.hideComponent(child.id);
        });
      }
      if (id === this.selectedComponent?.id) {
        this.resetSelectedComponent();
      }
    }
  }

  // /**
  //  * 导入模板，必须用在创建空页面之后用，选中空页面，然后应用此函数
  //  * @param templatePath
  //  */
  // async importTemplate(templatePath: string) {
  //   try {
  //     const dslContent = await fileManager.readFile(templatePath);
  //     // 1. 解析内容为对象
  //     const templateDSL = JSON.parse(dslContent);
  //     // 2. 删除 pageId
  //     templateDSL.id = '';
  //     // 3. 移除 根节点的父节点 id
  //     const root = templateDSL.componentIndexes[templateDSL.child.current];
  //     root.parentId = '';
  //     // 4. 覆盖当前的 dsl
  //     this.dsl = templateDSL;
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  @execute
  initDSL(dsl: IPageSchema = undefined) {
    if (dsl) {
      this.dsl = dsl;
      this.selectComponent(this.dsl.child.current);
      // 隐藏图层组件
      Object.values(this.dsl.componentIndexes).forEach(item => {
        const config = ComponentManager.fetchComponentConfig(item.configName, item.dependency);
        if (config?.isLayer) {
          this.hideComponent(item.id);
        }
      });
    } else {
      this.selectedComponent = undefined;
      this.dsl = undefined;
    }
  }

  initTotalFormConfig(formConfig: Record<string, IFormConfig>) {
    this.totalFormConfig = formConfig;
  }

  @execute
  replaceChild(componentId: string, index: number, name: string, dependency: string) {
    if (index < 0) {
      return;
    }
    const currentComponent = this.dsl.componentIndexes[componentId];
    if (!currentComponent.children || typeOf(currentComponent.children) !== 'array') {
      return;
    }
    if (index >= currentComponent.children.length) {
      return;
    }
    this.dangerousInsertComponent(currentComponent.id, name, dependency, index);
    // 找到需要删除的组件
    this.dangerousDeleteComponent(currentComponent.children[index + 1].current);
  }

  private dangerousDeleteComponent(id: ComponentId): IComponentSchema | null {
    const componentToDelete = this.dsl.componentIndexes[id];
    if (!componentToDelete) {
      return;
    }
    if (componentToDelete.feature === 'root') {
      return;
    }
    const deleted = this.deleteSubtree(id);
    // 如果当前已选中的组件，已经被删除了，就清空
    if (this.selectedComponent?.id && !this.dsl.componentIndexes[this.selectedComponent.id]) {
      this.resetSelectedComponent();
    }
    return deleted;
  }

  private dangerousInsertComponent(parentId: string, name: string, dependency: string, insertIndex = -1) {
    // 检查传入的组件是否有对应的配置
    const componentConfig = ComponentManager.fetchComponentConfig(name, dependency);
    if (!componentConfig) {
      console.error('未找到有效的组件配置: ', `name: ${name}, dependency: ${dependency}`);
      return;
    }
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
      this.currentParentNode = null;
      return newComponentNode;
    } else {
      this.currentParentNode = null;
      throw new Error(`未找到有效的父节点：${parentId}`);
    }
  }

  /**
   * 判断当前组件是否是隐藏的
   * @param id
   */
  isHidden(id: ComponentId) {
    return this.hiddenComponentDict[id];
  }

  isInLayer(id: ComponentId) {
    const componentSchema = this.dsl.componentIndexes[id];
    if (!componentSchema) {
      return false;
    }
    let parentId = componentSchema.parentId;
    while (parentId) {
      const parent = this.dsl.componentIndexes[parentId];
      const parentConfig = ComponentManager.fetchComponentConfig(parent.configName, parent.dependency);
      if (parentConfig.isLayer) {
        return true;
      } else {
        parentId = parent.parentId;
      }
    }
    return false;
  }

  /**
   * 判断一个组件是不是在一个 solid 组件内，如果是，则它不会被 EditorWrapper 包装
   * @param componentId
   */
  isInSolid(componentId: ComponentId) {
    const component = this.dsl.componentIndexes[componentId];
    if (!component) {
      return true;
    }
    let parent = this.dsl.componentIndexes[component.parentId];
    while (parent) {
      if (parent.feature === ComponentFeature.solid) {
        return true;
      }
      if (!parent.parentId) {
        return false;
      }
      parent = this.dsl.componentIndexes[parent.parentId];
    }
    return false;
  }

  isLayerShown(): boolean {
    if (!this.dsl?.componentIndexes) {
      return false;
    }
    return Object.values(this.dsl.componentIndexes).some(item => {
      const componentConfig = ComponentManager.fetchComponentConfig(item.configName, item.dependency);
      return !!(!this.isHidden(item.id) && componentConfig?.isLayer);
    });
  }

  @execute
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
        const childComponent = this.dsl.componentIndexes[childId];
        if (childComponent) {
          this.removeReferenceFromParent(childId);
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
      this.currentParentNode = null;
      throw new Error(`未找到有效的父节点：${parentId}`);
    }
    this.currentParentNode = null;
  }

  /**
   * 重做
   */
  redo() {
    const diff = this.redoStack.pop();
    if (!diff) {
      return;
    }
    this.mergeDiffAndProcessNewDiff(diff, this.undoStack);
  }

  /**
   * 重命名组件
   * @param componentId
   * @param newName
   */
  renameComponent(componentId: ComponentId, newName: string) {
    const componentSchema = this.dsl.componentIndexes[componentId];
    componentSchema.displayName = newName;
  }

  resetSelectedComponent(): void {
    this.selectComponent('pageRoot0');
  }

  selectComponent(componentId: ComponentId) {
    this.selectedComponent = this.dsl.componentIndexes[componentId];
  }

  setTemplateTo(tplInfo: TemplateInfo, propsConfig: { [key: string]: IPropsConfigItem }) {
    const basicTplInfo: Partial<TemplateInfo> = {
      value: undefined,
      keyPathRegs: [],
      parent: undefined,
      key: '',
      currentKeyPath: ''
    };
    const fullTplInfo: TemplateInfo = Object.assign(basicTplInfo, tplInfo);

    const { value, keyPathRegs, parent, key, currentKeyPath, nodeId } = fullTplInfo;
    const keyPathMatchResult =
      keyPathRegs.length &&
      keyPathRegs.find(pathObj => {
        return new RegExp(pathObj.path).test(currentKeyPath);
      });
    // 如果当前 keyPath 命中正则表达式
    if (keyPathMatchResult) {
      // 如果是重复渲染的 keyPath，那么前边 parent[key] 的值就不重要了
      const {
        repeatPropRef,
        indexKey = '',
        columnKey = '',
        repeatType = '',
        renderType = 'slot'
      } = keyPathMatchResult as TemplateKeyPathsReg;
      if (repeatPropRef) {
        // 找到这个 prop
        const dataSourcePropConfig = propsConfig[repeatPropRef];
        if (dataSourcePropConfig) {
          if (repeatType === 'list' && indexKey) {
            (dataSourcePropConfig.value as any[]).forEach((item, index) => {
              const component = this.createEmptyContainer(generateSlotId(nodeId, item[indexKey]), {
                feature: ComponentFeature.slot
              });
              component.parentId = nodeId;
              // 只保留第一行的render
              if (index === 0) {
                parent[key] = {
                  current: component.id,
                  isText: false
                };
              }
            });
          } else if (repeatType === 'table' && indexKey && columnKey) {
            (dataSourcePropConfig.value as any[]).forEach((item, index) => {
              const component = this.createEmptyContainer(generateSlotId(nodeId, item[indexKey], parent[columnKey]), {
                feature: ComponentFeature.slot
              });
              component.parentId = nodeId;
              // 只保留第一行的render
              if (index === 0) {
                parent[key] = {
                  current: component.id,
                  isText: false
                };
              }
            });
          }
        }
      } else {
        let component: IComponentSchema;
        // 如果 value 是非真值或者空对象，则插入插槽
        if (renderType === 'template') {
          // 如果不是空的，则插入一颗子树
          const recursiveMap = (
            tree: TemplateTree[],
            parentId: string,
            feature: ComponentFeature = undefined
          ): IComponentSchema[] => {
            return tree.map(node => {
              const { configName, dependency } = node;
              // 创建组件
              this.currentParentNode = this.dsl.componentIndexes[parentId];
              const component = this.createComponent(configName, dependency);
              // 顶部的节点的 feature 需要被修正为 solid，防止 editor 拖入其他的元素
              if (feature) {
                component.feature = feature;
              }
              if (node.children.length) {
                component.children = recursiveMap(node.children, component.id).map(item => {
                  return {
                    current: item.id,
                    isText: false
                  };
                });
              }
              return component;
            });
          };
          component = recursiveMap([value], nodeId, ComponentFeature.solid)[0];
        } else {
          component = this.createEmptyContainer('', {
            feature: ComponentFeature.slot
          });
          component.parentId = nodeId;
        }
        parent[key] = {
          current: component.id,
          isText: false
        };
      }
    } else {
      const type = typeOf(value);
      if (type === 'object') {
        Object.entries(value).forEach(([key, val]) => {
          this.setTemplateTo(
            {
              value: val,
              keyPathRegs,
              parent: value,
              key,
              currentKeyPath: `${currentKeyPath ? currentKeyPath + '.' : currentKeyPath}${key}`,
              nodeId
            },
            propsConfig
          );
        });
      } else if (type === 'array') {
        value.forEach((item: any, index: number) => {
          this.setTemplateTo(
            {
              value: item,
              keyPathRegs,
              parent: value,
              key: index.toString(),
              currentKeyPath: `${currentKeyPath}[${index}]`,
              nodeId
            },
            propsConfig
          );
        });
      }
    }
  }

  showComponent(id: ComponentId) {
    delete this.hiddenComponentDict[id];
    const children = this.findChildren(id);
    if (children.length) {
      children.forEach(item => {
        this.showComponent(item.id);
      });
    }
    const componentSchema = this.dsl.componentIndexes[id];
    const componentConfig = ComponentManager.fetchComponentConfig(
      componentSchema.configName,
      componentSchema.dependency
    );
    if (componentConfig?.isLayer) {
      Object.values(this.dsl.componentIndexes).forEach(item => {
        const config = ComponentManager.fetchComponentConfig(item.configName, item.dependency);
        // 如果存在其他的图层类组件
        if (config.isLayer && item.id !== componentSchema.id) {
          this.hideComponent(item.id);
        }
      });
    }
  }

  /**
   * 撤销
   */
  undo() {
    const diff = this.undoStack.pop();
    if (!diff) {
      return;
    }
    this.mergeDiffAndProcessNewDiff(diff, this.redoStack);
  }

  unselectComponent() {
    this.selectComponent(this.dsl.child.current);
  }

  @execute
  updateComponentProps(propsPartial: Record<string, any> | CSSProperties, targetComponent: IComponentSchema) {
    const component = targetComponent || this.selectedComponent;
    const { id, configName, dependency } = component;
    const props = this.dsl.props[id];
    // const config = fetchComponentConfig(configName, dependency);
    // if (config) {
    //   Object.values(config.propsConfig || {}).forEach(prop => {
    //     // 如果当前这个属性不在变更的属性对象里，就用重置为默认值
    //     if (!(prop.name in propsPartial)) {
    //       props[prop.name].value = prop.value;
    //     }
    //   });
    // }
    Object.entries(propsPartial).forEach(([key, val]) => {
      // 这里是一个补丁，children 本不是 props，但是为了让某些子节点为 text 的组件能简便地设置 children，就先这么打补丁
      if (key === 'children') {
        const component = this.dsl.componentIndexes[id];
        if (component) {
          component.children = [
            {
              isText: true,
              current: val
            }
          ];
        }
      } else {
        if (props[key]) {
          props[key].value = val;
        }
      }
    });
  }

  updateComponentStats(componentName: string) {
    if (this.dsl.componentStats[componentName] === undefined) {
      this.dsl.componentStats[componentName] = 0;
    } else {
      this.dsl.componentStats[componentName]++;
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

  private cloneSubtree(id: ComponentId) {
    const componentSchema = this.dsl.componentIndexes[id];
    if (!componentSchema) {
      return null;
    }
    // 1. 复制 component schema 本身
    const clonedComponentSchema = cloneDeep(componentSchema);
    // 2. 生成新的 component id
    clonedComponentSchema.id = this.generateComponentIdByName(clonedComponentSchema.name);
    // 3. 生成新的 displayName
    const componentConfig = ComponentManager.fetchComponentConfig(
      clonedComponentSchema.name,
      clonedComponentSchema.dependency
    );
    clonedComponentSchema.displayName = `${componentConfig?.title}${
      this.dsl.componentStats[clonedComponentSchema.name]
    }`;
    // 4. 复制子树，并重新替换父组件的 children
    clonedComponentSchema.children = clonedComponentSchema.children.map(child => {
      if (child.isText) {
        return cloneDeep(child);
      } else {
        const clonedSubtree = this.cloneSubtree(child.current);
        if (!clonedSubtree) {
          return {
            current: '',
            isText: false
          };
        }
        return {
          current: clonedSubtree.id,
          isText: false
        };
      }
    });
    // 5. 复制 props
    this.dsl.props[clonedComponentSchema.id] = cloneDeep(this.dsl.props[id]);
    // 6. 遍历每一个 prop，如果它存在插槽，递归复制以插槽为根节点的子树
    const clonedPropsDict = this.dsl.props[clonedComponentSchema.id];
    clonedComponentSchema.propsRefs.forEach(ref => {
      const clonedPropsSchema: IPropsSchema = clonedPropsDict[ref];
      const { templateKeyPathsReg, value } = clonedPropsSchema;
      if (templateKeyPathsReg?.length) {
        const flattenedObject = flattenObject(value);
        Object.entries(flattenedObject).forEach(([keyPath, val]) => {
          const matchKeyPath = templateKeyPathsReg.some(regInfo => {
            return new RegExp(regInfo.path).test(keyPath);
          });
          if (matchKeyPath) {
            const clonedSubtree = this.cloneSubtree((clonedPropsSchema.value as IComponentSchema).id);
            const clonedNode = {
              current: clonedSubtree?.id || '',
              isText: false
            };
            if (keyPath === '') {
              clonedPropsSchema.value = clonedNode;
            } else if (keyPath) {
              // 根据当前的 keyPath，计算出它的父路径，然后给在父路径上覆盖这个路径对应的值
              const parentKeyPath = getParentKeyPath(keyPath);
              const parent = getValueByPath(clonedPropsSchema.value, parentKeyPath);
              // 计算出当前这个属性的 key
              const keyWithAccessOperator = keyPath.substring(0, parentKeyPath.length);
              const key = keyWithAccessOperator.startsWith('.')
                ? keyWithAccessOperator.substring(1)
                : keyWithAccessOperator.substring(1, keyWithAccessOperator.length - 1);
              // 赋值
              parent[key] = clonedNode;
            }
          }
        });
      }
    });
    // 7. 将节点挂载到 componentIndexes
    this.dsl.componentIndexes[clonedComponentSchema.id] = clonedComponentSchema;
    return clonedComponentSchema;
  }

  private createPageRoot() {
    const component = this.createComponent('PageRoot', 'antd');
    component.feature = ComponentFeature.root;
    return component;
  }

  private deleteSubtree(id: ComponentId): IComponentSchema | null {
    const { componentIndexes } = this.dsl;
    const component = componentIndexes[id];

    if (!component) {
      return null;
    }

    const children = this.findChildren(id).map(item => {
      return {
        current: item.id,
        isText: false
      };
    });

    // 1. 如果存在子树，递归地删除子树
    if (children.length) {
      children.forEach(item => {
        // 如果不是文本节点，递归地删除子树
        if (!item.isText) {
          this.deleteSubtree(item.current);
        }
      });
    }

    // 2. 遍历每一个 prop，如果它存在插槽，递归删除以插槽为根节点的子树
    const propsDict = this.dsl.props[id];
    component.propsRefs.forEach(ref => {
      const propsSchema: IPropsSchema = propsDict[ref];
      const { templateKeyPathsReg, value } = propsSchema;
      if (templateKeyPathsReg?.length) {
        const flattenedObject = flattenObject(value);
        Object.entries(flattenedObject).forEach(([key, val]) => {
          const matchKeyPath = templateKeyPathsReg.some(regInfo => {
            return new RegExp(regInfo.path).test(key);
          });
          if (matchKeyPath) {
            this.deleteSubtree(val.id);
          }
        });
      }
    });

    // 3. 删除 props
    delete this.dsl.props[id];

    // 4. 删除 action
    const relatedActionIds = Object.entries(this.dsl.actions)
      .filter(([actionId, action]) => {
        return action.relatedComponentIds.includes(id);
      })
      .map(([actionId]) => actionId);
    relatedActionIds.forEach(actionId => {
      delete this.dsl.actions[actionId];
    });

    // 5. 删除 handler
    const relatedHandlerIds = Object.entries(this.dsl.handlers)
      .filter(([handlerId, handler]) => {
        return relatedActionIds.some(actionId => {
          return handler.actionRefs.includes(actionId);
        });
      })
      .map(([handlerId]) => handlerId);
    relatedHandlerIds.forEach(handlerId => delete this.dsl.handlers[handlerId]);

    // 6. 删除 event
    const relatedEventIds = Object.entries(this.dsl.events)
      .filter(([eventId, event]) => {
        return relatedHandlerIds.includes(eventId);
      })
      .map(([eventId, event]) => eventId);
    relatedEventIds.forEach(eventId => delete this.dsl.events[eventId]);

    // 7. 从父节点的 children 中删除对这个组件的引用
    this.removeReferenceFromParent(id);

    // 8. 从索引中删除组件信息
    delete componentIndexes[id];

    return component;
  }

  private findIndexInParent(componentId: ComponentId): number {
    if (!componentId) {
      return -1;
    }
    const component = this.dsl.componentIndexes[componentId];
    const parent = this.dsl.componentIndexes[component.parentId];
    if (parent) {
      if (parent.children?.length > 0) {
        return parent.children.findIndex(child => child.current === component.id && !child.isText);
      }
      return -1;
    }
    return -1;
  }

  private generateComponentIdByName(name: string): string {
    this.updateComponentStats(name);
    return hyphenToCamelCase(`${name}${this.dsl.componentStats[name]}`);
  }

  private mergeDiffAndProcessNewDiff(
    diff: {
      added?: Record<string, any>;
      updated?: Record<string, any>;
      deleted?: Record<string, any>;
    },
    diffStack: any[]
  ) {
    const oldDsl = toJS(this.dsl);
    const { added, updated, deleted } = toJS(diff);
    if (added) {
      mergeWith(this.dsl, added, (objValue: any, srcValue: any) => {
        if (isArray(objValue) && !isObject(srcValue)) {
          Object.keys(srcValue).forEach(key => {
            objValue[key as unknown as number] = srcValue[key];
          });
          return objValue;
        }
      });
    }

    if (updated) {
      mergeWith(
        this.dsl,
        updated,
        function customizer(objValue: any, srcValue: any, objKey: string, obj: any, src: any, stack: any[]) {
          if (isArray(objValue) && isObject(srcValue)) {
            Object.keys(srcValue).forEach(key => {
              objValue[key as unknown as number] = mergeWith(
                objValue[key as unknown as number],
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                srcValue[key],
                customizer
              );
            });
            return objValue;
          }
        }
      );
    }
    if (deleted) {
      mergeWith(
        this.dsl,
        deleted,
        function customizer(objValue: any, srcValue: any, objKey: string, obj: any, src: any, stack: any[]) {
          if (isArray(objValue)) {
            return objValue.filter((item, index) => !(index in srcValue));
          } else if (isObject(objValue) && isObject(srcValue)) {
            Object.keys(srcValue).forEach(key => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              if (srcValue[key] === undefined) {
                delete (objValue as Record<string, any>)[key];
              } else {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                mergeWith(objValue[key], srcValue[key], customizer);
              }
            });
            return objValue;
          }
        }
      );
    }
    const newDsl = toJS(this.dsl);
    const newDiff = detailedDiff(newDsl, oldDsl);
    diffStack.push(newDiff);
  }

  private removeReferenceFromParent(id: ComponentId): void {
    const { componentIndexes } = this.dsl;
    const component = componentIndexes[id];
    // 从父节点的 children 中删除对这个组件的引用
    const parent = componentIndexes[component.parentId];
    if (parent) {
      parent.children = parent.children.filter(item => item.current !== id);
    }
  }
}
