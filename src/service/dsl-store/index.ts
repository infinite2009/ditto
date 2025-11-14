import { makeAutoObservable, toJS } from 'mobx';
import IPageSchema, { VariableInfo } from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';
import {
  flattenObject,
  generateId,
  getParentKeyPath,
  getValueByPath,
  hyphenToCamelCase,
  isEmpty,
  typeOf
} from '@/util';
import cloneDeep from 'lodash/cloneDeep';
import { nanoid } from 'nanoid';
import IComponentConfig, { IPropsConfigItem } from '@/types/component-config';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { ComponentId, TemplateInfo } from '@/types';
import IPropsSchema, { TemplateKeyPathsReg } from '@/types/props.schema';
import IFormConfig from '@/types/form-config';
import { CSSProperties } from 'react';
import mergeWith from 'lodash/mergeWith';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { detailedDiff } from 'deep-object-diff';
import ComponentFeature from '@/types/component-feature';
import InsertType from '@/types/insert-type';
import ComponentManager from '@/service/component-manager';
import IActionSchema from '@/types/action.schema';
import ActionType from '@/types/action-type';
import IEventSchema from '@/types/event.schema';
import DynamicObject from '@/types/dynamic-object';
import { intersection, omit, uniq, without } from 'lodash';
import { DiffPropsFnResult, FormValue, IDSLStore, TemplateTree } from './types';
import {
  replaceComponentWithBusiness,
  ReplaceComponentWithBusinessValues
} from './services/replaceComponentWithBusiness';
import isEqual from 'lodash/isEqual';

export type { DiffPropsFnResult };

function execute(target: any, name: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const oldDsl = toJS(this.dsl);
    const result = originalMethod.apply(this, args);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newDsl = toJS(this.dsl);
    const diff = detailedDiff(newDsl, oldDsl);
    const { added, updated, deleted } = diff;
    if (isEmpty(added) && isEmpty(updated) && isEmpty(deleted)) {
      return;
    }
    // 有 diff，标记为应该保存
    this.setShouldSave(true);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.undoStack.push(diff);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.redoStack = [];
    return result;
  };
}

const checkPropsItemIsEqual = (oldProps: IPropsSchema, newProps: IPropsSchema) => {
  const omitKeys = ['value', 'title', 'eventTrackingInfo'];
  // 补丁：防止一方的值是 undefined, 另一方没有这个 key
  Object.keys(oldProps).forEach(key => {
    if (oldProps[key] === undefined && !(key in newProps)) {
      omitKeys.push(key);
    }
  });
  Object.keys(newProps).forEach(key => {
    if (newProps[key] === undefined && !(key in oldProps)) {
      omitKeys.push(key);
    }
  });
  return isEqual(omit(oldProps, omitKeys), omit(newProps, omitKeys));
};
const diffComponentProps = (
  currentProps: DynamicObject<IPropsSchema>,
  newProps: DynamicObject<IPropsSchema>
): DiffPropsFnResult => {
  const currentKeys = Object.keys(currentProps);
  const newKeys = Object.keys(newProps);
  const add = without(newKeys, ...currentKeys);
  const remove = without(currentKeys, ...newKeys);
  const same = intersection(currentKeys, newKeys);
  const update = same.filter(i => !checkPropsItemIsEqual(currentProps[i], newProps[i])).map(i => i);

  const result = [
    ...add.map(i => ({
      type: 'add',
      key: i,
      oldProps: undefined,
      newProps: newProps[i]
    })),
    ...remove.map(i => ({
      type: 'remove',
      key: i,
      oldProps: currentProps[i],
      newProps: undefined
    })),
    ...update.map(i => ({
      type: 'update',
      key: i,
      oldProps: currentProps[i],
      newProps: newProps[i]
    }))
  ] as DiffPropsFnResult;

  return result?.length ? result : null;
};

export default class DSLStore implements IDSLStore {
  componentsIsRenderedMap: Record<string, boolean> = {};
  componentsRef: Record<string, React.MutableRefObject<HTMLElement>> = {};
  currentPageId: string;
  currentParentNode: IComponentSchema | IPageSchema | null = null;
  dsl: IPageSchema;
  // 存储组件的隐藏状态
  hiddenComponentDict: Record<ComponentId, boolean> = {};
  id: string;
  // 是否在进行数据更新，如果正在更新，不可以继续向对方同步数据
  isSyncing: boolean;
  selectedComponent: IComponentSchema;
  // 用户关闭项目或者切换页面时，执行保存
  shouldSave: boolean;
  // 组件展示名字库出现过的名字设置为 true，名字被改掉之后，删除
  private componentDisplayNameDict: Record<string, boolean> = {};
  private componentKeyMap: Record<string, string> = {};
  private redoStack: any[] = [];
  private totalFormConfig: Record<string, Record<string, IFormConfig>>;
  private undoStack: any[] = [];

  constructor(dsl: IPageSchema | undefined = undefined) {
    makeAutoObservable(this);
    this.id = nanoid();
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

  get formConfigOfSelectedComponent(): null | IFormConfig {
    if (!this.totalFormConfig) {
      return null;
    }
    if (!this.selectedComponent) {
      return null;
    }
    const { configName, name, dependency } = this.selectedComponent;
    if (!(dependency in this.totalFormConfig)) {
      console.error('formConfigOfSelectedComponent: ', `${dependency} no found`);
    }
    return this.totalFormConfig[dependency][configName || name];
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
          result.style = value;
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
      result.basic.children = this.selectedComponent?.children?.[0]?.current || undefined;
    }
    return result;
  }

  /**
   * 创建动作
   *
   * @param type
   * @param name
   * @param desc
   * @param options
   */
  addAction(type: ActionType, name: string, desc: string, options: any) {
    const action: IActionSchema = {
      id: nanoid(),
      schemaType: 'action',
      name,
      desc,
      type,
      options
    };
    this.dsl.actions[action.id] = action;
  }

  // 新增一个 props 上的 key
  @execute
  addComponentPropsKey(key: string, value: string) {
    this.dsl.props[this.selectedComponent.id][key] = {
      id: key,
      schemaType: 'props',
      value: value,
      category: 'basic',
      name: key,
      title: value,
      valueSource: 'editorInput',
      valueType: 'string'
    };
  }

  @execute
  batchMergeComponentProps() {
    const componentIds = Object.keys(this.diffAllComponentProps());
    componentIds.forEach(id => {
      this.mergeSingleComponentProps(id);
    });
  }

  clearComponentsIsRenderedMap() {
    this.componentsIsRenderedMap = {};
  }

  /**
   *
   */
  @execute
  clearPage() {
    if (Object.keys(this.dsl.componentIndexes).length === 1) {
      return;
    }
    this.hiddenComponentDict = {};
    this.currentParentNode = null;
    this.createEmptyDSL(this.dsl.name);
    this.resetSelectedComponent();
  }

  /**
   * 克隆组件
   *
   * @param id 要克隆的组件 id
   * @param relativeId 相对组件 id，它 和 insertType 将决定克隆组件插入的位置
   * @param insertType
   */
  @execute
  cloneAndInsertComponent(id: ComponentId, relativeId: ComponentId, insertType: InsertType) {
    let relativeIdInner = relativeId;
    let insertTypeInner = insertType;

    if (!(this.componentExists(id) && this.componentExists(relativeIdInner))) {
      // 如果找不到相对的组件，就用页面 id 替代
      relativeIdInner = this.dsl.child.current;
    }
    if (this.isPageRoot(relativeIdInner)) {
      insertTypeInner = InsertType.insertInLast;
    }
    let index = -1;
    // 插入目标组件
    let target = null;

    // 根据插入类型，决定插入的位置索引 index
    switch (insertTypeInner) {
      case InsertType.insertAfter:
        // 插入目标组件的后边，所以先去拿到它在父组件中的位置
        index = this.findIndexInParent(relativeIdInner) + 1;
        // 因为是往后插，所以必须要大于 0
        if (index > 0) {
          target = this.dsl.componentIndexes[this.dsl.componentIndexes[relativeIdInner].parentId];
        }
        break;
      case InsertType.insertBefore:
        index = this.findIndexInParent(relativeIdInner);
        if (index > -1) {
          target = this.dsl.componentIndexes[this.dsl.componentIndexes[relativeIdInner].parentId];
        }
        break;
      case InsertType.insertInFirst:
        target = this.dsl.componentIndexes[relativeIdInner];
        index = 0;
        break;
      case InsertType.insertInLast:
        target = this.dsl.componentIndexes[relativeIdInner];
        index = target.children.length;
        break;
      default:
        index = 0;
        break;
    }

    if (target && index > -1) {
      const clonedSubtree = this.cloneComponentSchema(id, target.id);
      if (!clonedSubtree) {
        return;
      }
      target.children.splice(index, 0, {
        current: clonedSubtree.id,
        configName: clonedSubtree.configName,
        isText: false
      });
    }
  }

  /**
   * 克隆组件的 schema，包括它相关的事件
   */
  cloneComponentSchema(componentId: ComponentId, parentId: string, dsl = this.dsl, suffix = '副本') {
    if (!this.componentExists(componentId, dsl)) {
      return null;
    }
    const componentSchema = dsl.componentIndexes[componentId];
    // 克隆组件的schema，此时组件及其后代的 id 都是重复的
    const clonedComponentSchema: IComponentSchema = cloneDeep(componentSchema);
    // 使用新的组件 id
    clonedComponentSchema.id = this.generateComponentIdByName(componentSchema.configName);
    // 使用新的组件展示名
    clonedComponentSchema.displayName = this.generateNewComponentDisplayName(componentSchema.displayName, suffix);
    // 使用新的父组件 id
    clonedComponentSchema.parentId = parentId;
    // 处理子组件
    if (clonedComponentSchema.children) {
      clonedComponentSchema.children.forEach(child => {
        // 文本节点不用特殊处理
        if (child.isText) {
          return;
        }
        if (!this.componentExists(child.current, dsl)) {
          return;
        }
        const clonedChildComponentSchema = this.cloneComponentSchema(
          child.current,
          clonedComponentSchema.id,
          dsl,
          suffix
        );
        child.current = clonedChildComponentSchema.id;
      });
    }
    // 处理 props
    // 防御性初始化
    this.dsl.props[clonedComponentSchema.id] = {};
    (clonedComponentSchema.propsRefs || []).forEach(propRef => {
      const propsSchema = dsl.props[componentSchema.id][propRef];
      const clonedPropsSchema = cloneDeep(propsSchema);
      const { templateKeyPathsReg, value } = clonedPropsSchema;
      if (templateKeyPathsReg?.length) {
        for (const regInfo of templateKeyPathsReg) {
          const templateRefs: { current: string }[] = [];
          if (regInfo.path !== '') {
            const flattenedObject = flattenObject(value);
            for (const keyPath in flattenedObject) {
              if (new RegExp(`^${regInfo.path}$`).test(keyPath)) {
                const templateRef = getValueByPath(value, keyPath);
                if (isArray(templateRef)) {
                  templateRefs.push(...templateRef);
                } else if (isObject(templateRef)) {
                  templateRefs.push(templateRef as any);
                }
              }
            }
          } else {
            if (value) {
              // 特殊情况：如果模板的 key path 是 空字符串，直接去 value 做为组件节点
              templateRefs.push(value);
            }
          }
          templateRefs.forEach(item => {
            if (item?.current && this.componentExists(item?.current, dsl)) {
              const node = this.cloneComponentSchema(item.current, clonedComponentSchema.id, dsl, suffix);
              if (node?.id) {
                item.current = node.id;
              }
            }
          });
        }
      }

      // 挂载克隆的 prop
      this.dsl.props[clonedComponentSchema.id][propRef] = clonedPropsSchema;
    });
    // 处理事件
    const eventSchemaList = dsl?.events?.[componentSchema.id];
    if (eventSchemaList?.length) {
      const clonedEventSchemaList = cloneDeep(eventSchemaList);
      clonedEventSchemaList.forEach(eventSchema => {
        eventSchema.id = nanoid();
        eventSchema.componentId = clonedComponentSchema.id;
        eventSchema.actionList = eventSchema.actionList.map(actionId => {
          // 克隆动作
          const clonedAction = cloneDeep(dsl?.actions?.[actionId]);
          if (!clonedAction) return;
          clonedAction.id = nanoid();
          this.dsl.actions[clonedAction.id] = clonedAction;
          return clonedAction.id;
        });
      });
      // 将克隆的事件挂载到事件索引上
      this.dsl.events[clonedComponentSchema.id] = clonedEventSchemaList;
    }

    // 将组件的克隆挂载到组件索引上
    this.dsl.componentIndexes[clonedComponentSchema.id] = clonedComponentSchema;
    return clonedComponentSchema;
  }

  /**
   * 生成组件
   *
   * @param name
   * @param dependency
   * @param opt
   * @param extProps 定开场景支持
   */
  createComponent(
    name: string,
    dependency: string,
    opt: { customId?: string; feature?: ComponentFeature } = {},
    extProps: { [key: string]: any } | undefined = undefined
  ): IComponentSchema {
    let componentId = '';
    const { customId = '', feature } = opt;
    if (customId) {
      componentId = customId;
    } else {
      componentId = this.generateComponentIdByName(name);
    }

    const componentConfig = ComponentManager.fetchComponentConfig(name, dependency);
    let children: ComponentSchemaRef[];
    if (componentConfig?.feature === ComponentFeature.container) {
      children = [];
    } else if (componentConfig?.children) {
      // 给当前组件的 children 节点初始化一个空插槽
      const { value, type } = componentConfig.children;
      if (type === 'slot') {
        const emptyContainer = this.createEmptyContainer(
          '',
          { feature: ComponentFeature.slot },
          { style: { padding: 0, height: '100%' } }
        );
        // 修正父节点 id
        emptyContainer.parentId = componentId;
        children = [
          {
            current: emptyContainer.id,
            configName: emptyContainer.configName,
            isText: false
          }
        ];
      } else if (type === 'text') {
        children = [
          {
            current: value as string,
            configName: 'Text',
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
      // 默认都设置为 solid，优先使用 opt 中的 feature 进行设置
      feature: feature || componentConfig?.feature || ComponentFeature.solid,
      schemaType: 'component',
      name: this.calculateComponentName(componentConfig),
      displayName: `${componentConfig?.title}${this.dsl.componentStats[name]}`,
      configName: componentConfig?.configName,
      importName: componentConfig?.importName,
      dependency: componentConfig?.dependency,
      callingName: componentConfig?.callingName,
      noImport: componentConfig?.noImport || false,
      isLayer: componentConfig?.isLayer || false,
      propsRefs: [],
      children
    } as IComponentSchema;

    const componentSchema = this.dsl.componentIndexes[componentId];

    // pageRoot 不用赋值
    if (this.currentParentNode?.id) {
      componentSchema.parentId = this.currentParentNode?.id;
    }

    const { propsConfig } = componentConfig;
    this.dsl.props[componentId] = {};
    const props = this.dsl.props[componentId];
    Object.values(propsConfig).forEach(item => {
      const { name, value, templateKeyPathsReg = [] } = item;
      props[name] = item;
      // 使用默认值配置进行属性值初始化
      const defaultValueObj = ComponentManager.fetchDefaultValueOf(
        componentConfig.configName,
        componentConfig.dependency
      );
      if (defaultValueObj !== null) {
        props[name].value = defaultValueObj[name];
      }
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
            data: cp,
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

    // 针对图层组件进行定开
    if (componentSchema.isLayer) {
      console.log(`${componentSchema.id}: `, componentSchema.isLayer);
      // 创建 open 属性对应的变量
      const variableName = `openStateOf${componentSchema.id}`;
      this.createVariable({
        key: variableName,
        initialValue: false,
        name: 'open属性变量',
        desc: '',
        type: 'boolean'
      });
      this.dangerousUpdateProps({ open: variableName }, { id: componentId });
    }

    return componentSchema;
  }

  /**
   * 创建一个空的容器，可以配置选项来表明它是容器还是插槽
   *
   * @param customId
   * @param opt
   * @param extProps
   */
  createEmptyContainer(
    customId = '',
    opt: { feature: ComponentFeature } | undefined = undefined,
    extProps: Record<string, any> | undefined = undefined
  ) {
    return this.createComponent('VerticalFlex', 'html', { customId, feature: opt.feature }, extProps);
  }

  createEmptyDSL(name: string, desc = '') {
    const pageId = generateId();
    this.dsl = {
      actions: {},
      events: {},
      // handlers 需要重构
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      handlers: {},
      id: pageId,
      schemaType: 'page',
      name,
      desc,
      props: {},
      // 由于类型设计问题，这里需要初始化一个无效节点
      child: {
        current: '',
        configName: '',
        isText: true
      },
      componentIndexes: {},
      componentStats: {}
    };
    const pageRoot = this.createPageRoot();
    this.dsl.child = {
      current: pageRoot.id,
      configName: pageRoot.configName,
      isText: false
    };
    // console.log('dsl: ', toJS(this.dsl));
  }

  /**
   * 创建一个新状态，如果同名的状态已经存在，则抛出异常
   *
   * @param variableInfo
   */
  createVariable(variableInfo: VariableInfo) {
    if (variableInfo.key in this.dsl.variableDict) {
      throw new Error(`状态 ${variableInfo.key} 已存在！`);
    }
    this.dsl.variableDict[variableInfo.key] = {
      ...variableInfo
    };
  }

  dangerousCloneAndInsertComponent(id: ComponentId, relativeId: ComponentId, insertType: InsertType, dsl = this.dsl) {
    let relativeIdInner = relativeId;
    let insertTypeInner = insertType;

    if (!(this.componentExists(id, dsl) && this.componentExists(relativeIdInner, this.dsl))) {
      // 如果找不到相对的组件，就用页面 id 替代
      relativeIdInner = this.dsl.child.current;
    }
    if (this.isPageRoot(relativeIdInner)) {
      insertTypeInner = InsertType.insertInLast;
    }
    let index = -1;
    // 插入目标组件
    let target = null;

    // 根据插入类型，决定插入的位置索引 index
    switch (insertTypeInner) {
      case InsertType.insertAfter:
        // 插入目标组件的后边，所以先去拿到它在父组件中的位置
        index = this.findIndexInParent(relativeIdInner, this.dsl) + 1;
        // 因为是往后插，所以必须要大于 0
        if (index > 0) {
          target = this.dsl.componentIndexes[this.dsl.componentIndexes[relativeIdInner].parentId];
        }
        break;
      case InsertType.insertBefore:
        index = this.findIndexInParent(relativeIdInner);
        if (index > -1) {
          target = this.dsl.componentIndexes[this.dsl.componentIndexes[relativeIdInner].parentId];
        }
        break;
      case InsertType.insertInFirst:
        target = this.dsl.componentIndexes[relativeIdInner];
        index = 0;
        break;
      case InsertType.insertInLast:
        target = this.dsl.componentIndexes[relativeIdInner];
        index = target.children.length;
        break;
      default:
        index = 0;
        break;
    }

    if (target && index > -1) {
      const clonedSubtree = this.cloneComponentSchema(id, target.id, dsl, '');
      if (!clonedSubtree) {
        return;
      }
      target.children.splice(index, 0, {
        current: clonedSubtree.id,
        configName: clonedSubtree.configName,
        isText: false
      });
    }
  }

  dangerousDeleteComponent(id: ComponentId, callback?: () => void): IComponentSchema | null {
    const componentToDelete = this.dsl.componentIndexes[id];
    if (!componentToDelete) {
      return;
    }
    if (componentToDelete.feature === 'root') {
      return;
    }
    const deleted = this.deleteSubtree(id);
    // 如果当前已选中的组件，已经被删除了，就清空
    if (this.selectedComponent?.id === deleted.id) {
      this.resetSelectedComponent();
    }
    if (callback) {
      callback();
    }
    // 清除名字
    delete this.componentDisplayNameDict[componentToDelete.displayName];
    // 删除其在父组件 children 中的引用
    const parent = this.fetchComponentInDSL(deleted.parentId);
    if (parent.children?.length) {
      const index = (parent.children || []).findIndex(child => child.current === id);
      if (index > -1) {
        parent.children.splice(index, 1);
      }
    }

    // 如果存在组件替换的情况，需要一并删除
    const { businessReplacement = {} } = this.dsl;
    const result = Object.entries(businessReplacement).find(([key, val]) => {
      return val.id === id;
    });
    if (result) {
      const hasRef = Object.values(this.dsl.componentIndexes).some(componentSchema => {
        return (componentSchema.children || []).some(childRef => {
          return childRef.replacement?.ref === result[0];
        });
      });
      // 如果不存在对这个替换组件的引用，则可以删除它
      if (!hasRef) {
        delete businessReplacement[result[0]];
      }
    }
    return deleted;
  }

  dangerousInsertComponent(
    parentId: string,
    name: string,
    dependency: string,
    insertIndex = -1,
    opt?: { customId?: string; feature?: ComponentFeature },
    callback?: () => void
  ) {
    // 检查传入的组件是否有对应的配置
    const componentConfig = ComponentManager.fetchComponentConfig(name, dependency);
    if (!componentConfig) {
      console.error('未找到有效的组件配置: ', `name: ${name}, dependency: ${dependency}`);
      return;
    }
    this.currentParentNode = this.fetchComponentInDSL(parentId);
    if (this.currentParentNode) {
      const newComponentNode = this.createComponent(name, dependency, opt);

      // 如果没有 children，初始化一个，如果需要初始化，说明初始化父节点的代码有 bug
      this.currentParentNode.children = this.currentParentNode.children || [];
      const ref: ComponentSchemaRef = {
        current: newComponentNode.id,
        isText: false,
        configName: componentConfig.configName
      };
      if (insertIndex === -1) {
        this.currentParentNode.children.push(ref);
      } else {
        this.currentParentNode.children.splice(insertIndex, 0, ref);
      }
      this.currentParentNode = null;
      if (callback) {
        callback();
      }
      return newComponentNode;
    } else {
      this.currentParentNode = null;
      throw new Error(`未找到有效的父节点：${parentId}`);
    }
  }

  dangerousMultiDeleteComponent(ids: ComponentId[], callback?: () => void): IComponentSchema[] | null {
    return ids
      ?.map(id => {
        return this.dangerousDeleteComponent(id, callback);
      })
      .filter(i => i);
  }

  dangerousUpdateComponentProps(
    propsPartial: Record<string, any> | CSSProperties,
    targetComponent?:
      | {
          id: IComponentSchema['id'];
        }
      | IComponentSchema
  ) {
    const component = targetComponent || this.selectedComponent;
    const { id } = component;
    const props = this.dsl.props[id];
    Object.entries(propsPartial).forEach(([key, val]) => {
      // 这里是一个补丁，children 本不是 props，但是为了让某些子节点为 text 的组件能简便地设置 children，就先这么打补丁
      if (key === 'children') {
        const component = this.dsl.componentIndexes[id];
        if (component) {
          component.children = [
            {
              isText: true,
              current: val,
              configName: 'Text'
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

  dangerousUpdateProps(
    propsPartial: Record<string, any> | CSSProperties,
    targetComponent?:
      | {
          id: IComponentSchema['id'];
        }
      | IComponentSchema
  ) {
    const component = targetComponent || this.selectedComponent;
    const { id } = component;
    const props = this.dsl.props[id];
    Object.entries(propsPartial).forEach(([key, val]) => {
      // 这里是一个补丁，children 本不是 props，但是为了让某些子节点为 text 的组件能简便地设置 children，就先这么打补丁
      if (key === 'children') {
        const component = this.dsl.componentIndexes[id];
        if (component) {
          component.children = [
            {
              isText: true,
              current: val,
              configName: 'Text'
            }
          ];
        }
      } else {
        if (props[key]) {
          props[key].value = val;
        }
      }
    });
    this.dsl = { ...this.dsl };
  }

  deleteAction(id: string) {
    if (!this.dsl.actions) {
      return;
    }
    delete this.dsl.actions[id];
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

  deleteColumnForTable(tableId: string, columnIndex: number, callback?: () => void) {
    const tableComponent = this.dsl.componentIndexes[tableId];
    if (tableComponent) {
      const rowComponents = tableComponent.children;
      if (rowComponents.length) {
        rowComponents.forEach(({ current }) => {
          const row = this.dsl.componentIndexes[current];
          this.deleteComponent(row.children[columnIndex].current);
        });
      }
      if (callback) {
        callback();
      }
    }
  }

  /**
   * 由于 DSL 的设计特性，嵌套的 template 之间一定会有一层容器作为插槽，所以删除插槽内的节点，只需要遍历插槽的 children
   *
   * @param id
   */
  @execute
  deleteComponent(id: ComponentId): IComponentSchema | null {
    return this.dangerousDeleteComponent(id);
  }

  // 删除一个 props 上的 key
  @execute
  deleteComponentPropsKey(key: string) {
    delete this.dsl.props[this.selectedComponent.id][key];
  }

  /**
   *
   * @param parentId
   * @param index 如果是 -1，则从尾部开始算，删除 count 个组件
   * @param count
   */
  @execute
  deleteComponentsInBatch(parentId: string, index: number, count = 1) {
    if (!this.componentExists(parentId)) {
      return;
    }
    const { children } = this.dsl.componentIndexes[parentId];
    if (!children?.length) {
      return;
    }
    const startIndex: number = index === -1 ? Math.max(children.length - count, 0) : index;
    const endIndex: number = index === -1 ? children.length - 1 : Math.min(index + count, children.length - 1);
    for (let i = startIndex; i <= endIndex; i++) {
      this.dangerousDeleteComponent(children[i].current);
    }
  }

  /**
   * 删除指定的状态
   *
   * @param stateName
   */
  deleteState(stateName: string) {
    delete this.dsl.variableDict[stateName];
  }

  diffAllComponentProps(): Record<string, DiffPropsFnResult> {
    if (this?.dsl?.componentIndexes) {
      const map = Object.fromEntries(
        Object.entries(this.dsl.componentIndexes).map(([componentId, component]) => {
          const props = this.dsl.props[componentId];
          const newConfig = ComponentManager.fetchComponentConfig(component.configName, component.dependency);
          if (newConfig) {
            return [componentId, diffComponentProps(props, newConfig.propsConfig)];
          }
          return [componentId, null];
        })
      );
      const result = Object.fromEntries(
        Object.keys(map)
          .filter(key => map[key])
          .map(k => [k, map[k]])
      );
      return Object.keys(result).length ? result : null;
    }
    return null;
  }

  /**
   * 对比props变化
   * @returns
   */
  diffComponentProps(componentId: string): DiffPropsFnResult {
    if (componentId) {
      const component = this.dsl.componentIndexes[componentId];
      const props = this.dsl.props[componentId];
      const newConfig = ComponentManager.fetchComponentConfig(component.configName, component.dependency);
      return diffComponentProps(props, newConfig.propsConfig);
    }
    return null;
  }

  fetchActionList(): IActionSchema[] {
    return Object.values(this.dsl?.actions || {});
  }

  /**
   * 寻找当前组件的所有祖先
   *
   * @params id ComponentId
   */
  fetchAncestors(id: ComponentId) {
    const result: IComponentSchema[] = [];
    let parent = this.fetchParentComponentInDSL(id);
    while (parent) {
      result.push(parent);
      parent = this.fetchParentComponentInDSL(parent.id);
    }
    return result;
  }

  fetchComponentInDSL(id: string) {
    if (!this.dsl) {
      return null;
    }
    const { componentIndexes } = this.dsl;
    return componentIndexes[id];
  }

  fetchComponentList() {
    return Object.values(this.dsl?.componentIndexes || {});
  }

  /**
   * 获取所有后代组件
   *
   * @params id ComponentId
   * @return IComponentSchema[]
   */
  fetchDescendants(id: ComponentId): IComponentSchema[] {
    const result: IComponentSchema[] = [];
    let component = this.fetchComponentInDSL(id);
    let q = (component.children || []).filter(child => !child.isText).map(child => child.current);
    while (q.length) {
      const componentId = q.shift();
      component = this.fetchComponentInDSL(componentId);
      result.push(component);
      q = q.concat((component.children || []).filter(child => !child.isText).map(child => child.current));
    }
    return result;
  }

  fetchEventList(componentId: ComponentId): IEventSchema[] {
    return Object.values(this.dsl?.events?.[componentId] || []);
  }

  /**
   * 获取指定组件的父组件
   *
   * @param id
   */
  fetchParentComponentInDSL(id: string) {
    const component = this.fetchComponentInDSL(id);
    return this.fetchComponentInDSL(component.parentId);
  }

  fetchPropsSchema(id: ComponentId | null, propsName: string) {
    if (id === null) {
      if (this.selectedComponent.id) {
        return this.dsl.props[this.selectedComponent.id][propsName];
      }
      return null;
    }
    return this.dsl.props[id]?.[propsName];
  }

  fetchPropsValue(id: ComponentId | null, propsName: string) {
    return this.fetchPropsSchema(id, propsName)?.value;
  }

  filterDSLByComponentId(componentId: string, options: { deep: boolean }) {
    const cloneDSL = cloneDeep(this.dsl);
    const newSimpleDSL: Partial<IPageSchema> = {
      props: {},
      child: {
        current: '',
        configName: '',
        isText: true
      },
      componentIndexes: {}
    };
    const child = this.dsl.componentIndexes[componentId];
    newSimpleDSL.child = {
      current: child.id,
      configName: child.configName,
      isText: false
    };
    const walk = (cmpId: string) => {
      newSimpleDSL.componentIndexes[cmpId] = cloneDSL.componentIndexes[cmpId];
      newSimpleDSL.props[cmpId] = cloneDSL.props[cmpId];
      if (!options?.deep && newSimpleDSL.componentIndexes[cmpId]?.children?.some(i => !i.isText)) {
        newSimpleDSL.componentIndexes[cmpId].children = newSimpleDSL.componentIndexes[cmpId].children.filter(
          i => i.isText
        );
      }

      const childrenIds = this.findNonSlotDescendant(cmpId).map(cmp => cmp.id);
      const internalComponents = this.findCustomComponentInProps(cmpId, this.dsl);
      if (childrenIds.length) {
        childrenIds.forEach(id => {
          if (options?.deep) {
            walk(id);
          }
        });
      }
      if (internalComponents.length) {
        internalComponents.forEach(node => {
          walk(node.current);
        });
      }
    };
    walk(componentId);
    return newSimpleDSL;
  }

  /**
   * 查询指定组件的所有父组件（不包含slot/transparent节点组件）
   * @param componentId
   */
  findAllParentsIdViaComponentId(componentId: ComponentId): IComponentSchema[] {
    const component = this.fetchComponentInDSL(componentId);
    if (!component) {
      return [];
    }

    let parentId = component.parentId;
    const parentList: IComponentSchema[] = [];

    while (parentId != null) {
      const parentComponent = this.fetchComponentInDSL(parentId);
      // 如果当前组件是一个插槽或者是透明的，这忽略
      if (!this.isIgnoreFeatureComponent(parentComponent)) {
        parentList.unshift(parentComponent);
      }
      parentId = parentComponent.parentId;
    }

    return parentList;
  }

  findChildren(id: ComponentId): IComponentSchema[] {
    if (!id || !this.dsl.componentIndexes) {
      return [];
    }
    const child = this.dsl.componentIndexes[id].children?.filter(i => !i.isText).map(i => i.current) ?? [];
    const allChild = Object.values(this.dsl.componentIndexes)
      .filter(cmp => cmp?.parentId === id)
      .map(i => i.id);
    const items = uniq([...child, ...allChild]).map(i => this.dsl.componentIndexes[i]);
    // fix: 过滤掉 undefined，不知道为什么会有这样的 child
    return items.filter(item => !!item);
  }

  /**
   * 递归查找当前节点及其父节点中首个非忽略的节点
   * 需做忽略处理的节点：feature === slot/transparent
   */
  findFirstRealComponent(componentId: ComponentId): IComponentSchema {
    const component = this.fetchComponentInDSL(componentId);
    if (!component) {
      return component;
    }
    // 当前节点是实际的节点，直接返回
    if (!this.isIgnoreFeatureComponent(component)) {
      return component;
    }

    // 查找父节点中，第一个实际节点返回
    let parentId = component.parentId;
    while (parentId) {
      const parentComponent = this.fetchComponentInDSL(parentId);
      // 如果当前组件是一个插槽或者是透明的，这忽略
      if (!this.isIgnoreFeatureComponent(parentComponent)) {
        return parentComponent;
      }
      parentId = parentComponent.parentId;
    }
  }

  /**
   * 查询指定组件在父组件下的索引
   * @param componentId
   * @param ignoreHiddenChildren 是否忽略隐藏组件
   */
  findIndex(componentId: ComponentId, ignoreHiddenChildren = false): number {
    const component = this.fetchComponentInDSL(componentId);
    if (!component) {
      return -1;
    }
    const parent = this.fetchComponentInDSL(component.parentId);
    return parent.children
      .filter(({ current }) => {
        return ignoreHiddenChildren ? !this.isHidden(current) : true;
      })
      .findIndex(({ current }) => {
        return current === componentId;
      });
  }

  /**
   * 找到非插槽的后代
   * @param id
   */
  findNonSlotDescendant(id: ComponentId) {
    const component = this.fetchComponentInDSL(id);
    if (!component) return [];
    // 如果是黑盒组件，则不返回它的后代节点
    if (component.feature === ComponentFeature.blackBox) {
      return [];
    }
    const children = this.findChildren(id);
    if (children.length) {
      let result = [];
      children.forEach(child => {
        // 如果当前组件是一个插槽或者是透明的，这忽略
        if (child.feature === ComponentFeature.slot || child.feature === ComponentFeature.transparent) {
          result = result.concat(this.findNonSlotDescendant(child.id));
        } else {
          result.push(child);
        }
      });
      return result;
    }
    return [];
  }

  // 强制更新组件
  public forceUpdateComponent(componentId: string = this.selectedComponent?.id) {
    if (componentId) {
      const key = this.generateComponentKey(componentId);
      this.setComponentKey(componentId, key);
    }
  }

  public getComponentKey(componentId: string) {
    if (this.componentKeyMap[componentId]) {
      return this.componentKeyMap[componentId];
    }
    const key = this.generateComponentKey(componentId);
    this.setComponentKey(componentId, key);
    return key;
  }

  getComponentProps(id: IComponentSchema['id']) {
    if (!this.componentExists(id)) {
      return {};
    }
    const props = Object.fromEntries(Object.entries(this.dsl.props[id]).map(([key, value]) => [key, value.value]));
    const children = this.dsl.componentIndexes[id].children;
    // if (children)
    if (children && children.length === 1 && children[0].isText) {
      return {
        ...props,
        children: children[0].current
      };
    }
    return props;
  }

  hideComponent(id: ComponentId) {
    if (id) {
      if (this.isPageRoot(id)) {
        return;
      }
      this.hiddenComponentDict[id] = true;
      // 子节点也隐藏下
      // const children = this.findChildren(id);
      // if (children.length) {
      //   children.forEach(child => {
      //     this.hideComponent(child.id);
      //   });
      // }
      if (id === this.selectedComponent?.id) {
        this.resetSelectedComponent();
      }
    }
  }

  /**
   * 组件配置有变化时，更新组件属性
   */
  initComponentPropsViaNewConfig(component: IComponentSchema) {
    const { propsRefs, configName, dependency, id: componentId } = component;
    // 刷新当前组件的 props，因为组件的 props 配置表可能存在扩展，需要给 dsl 进行 props 补全
    const componentConfig = ComponentManager.fetchComponentConfig(configName, dependency);

    const { propsConfig } = componentConfig;
    const props = this.dsl.props[this.selectedComponent.id];
    Object.values(propsConfig).forEach(item => {
      const { name, value, templateKeyPathsReg = [] } = item;
      if (propsRefs.includes(name)) {
        return;
      }
      props[name] = item;
      // 使用默认值配置进行属性值初始化
      const defaultValueObj = ComponentManager.fetchDefaultValueOf(
        componentConfig.configName,
        componentConfig.dependency
      );
      if (defaultValueObj !== null) {
        props[name].value = defaultValueObj[name];
      }

      if (templateKeyPathsReg.length) {
        const cp = cloneDeep(value);
        const wrapper = { cp };
        this.setTemplateTo(
          {
            data: cp,
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
      propsRefs.push(name);
    });
  }

  initDSL(dsl: IPageSchema = undefined) {
    // 重置名字字典
    this.componentDisplayNameDict = {};
    if (dsl) {
      this.dsl = dsl;
      this.selectComponent(this.dsl.child.current);
      // 隐藏图层组件
      Object.values(this.dsl.componentIndexes).forEach(item => {
        const config = ComponentManager.fetchComponentConfig(item.configName, item.dependency);
        if (config?.isLayer) {
          this.hideComponent(item.id);
        }
        // 把每个名字都写进去
        this.componentDisplayNameDict[item.displayName] = true;
      });
    } else {
      this.selectedComponent = undefined;
      this.dsl = undefined;
    }
  }

  @execute
  initDSLFromTemplate(dsl: IPageSchema = undefined) {
    this.initDSL(dsl);
  }

  initTotalFormConfig(formConfig: Record<string, Record<string, IFormConfig>>) {
    this.totalFormConfig = formConfig;
  }

  insertColumnForTable(
    column: { configName: string; dependency: string },
    tableComponentId: string,
    columnIndex?: number,
    callback?: () => void
  ) {
    const tableComponent = this.dsl.componentIndexes[tableComponentId];
    if (tableComponent) {
      const { configName, dependency } = column;
      // 先插入一个垂直容器作为列的容器，它不会被渲染
      tableComponent.children = tableComponent.children || [];
      const rowComponents = tableComponent.children;
      if (rowComponents.length === 0) {
        // 如果不存在行，直接创建一行
        this.insertRowForTable([column], tableComponentId, callback);
      } else {
        // 已经存在行，就逐行插入新的列
        rowComponents.forEach(({ current }) => {
          if (configName === 'HorizontalFlex') {
            const buttonContainer = this.dangerousInsertComponent(
              current,
              'HorizontalFlex',
              'html',
              columnIndex !== undefined ? columnIndex : -1
            );
            this.dangerousInsertComponent(buttonContainer.id, 'Button', tableComponent.dependency);
          } else {
            this.dangerousInsertComponent(
              current,
              configName,
              dependency,
              columnIndex !== undefined ? columnIndex : -1
            );
          }
        });
      }
      if (callback) {
        callback();
      }
    }
  }

  /**
   * 插入一个新的组件
   */
  @execute
  insertComponent(
    parentId: string,
    name: string,
    dependency: string,
    insertIndex = -1,
    opt?: { customId: string },
    callback?: () => void
  ) {
    return this.insertComponentWithConfig({
      parentId,
      name,
      dependency,
      insertIndex,
      opt,
      callback
    });
  }

  @execute
  insertComponentWithConfig(config: {
    parentId: string;
    name: string;
    dependency: string;
    insertIndex?: number;
    opt?: { customId: string };
    callback?: () => void;
    autoSelect?: boolean;
    feature?: ComponentFeature;
  }) {
    const { parentId, name, dependency, insertIndex = -1, opt, callback, autoSelect = true, feature } = config;
    const component = this.dangerousInsertComponent(parentId, name, dependency, insertIndex, opt, callback);
    // 打个补丁
    if (feature) {
      component.feature = feature;
    }
    if (autoSelect) {
      this.selectComponent(component.id);
    }
    return component;
  }

  @execute
  insertComponentsInBatch(
    parentId: string,
    componentConfig: {
      name: string;
      dependency: string;
      id?: string;
    }[],
    insertIndex = -1
  ) {
    if (!componentConfig?.length) {
      return;
    }
    componentConfig.forEach(({ name, dependency, id }, index) => {
      this.dangerousInsertComponent(parentId, name, dependency, insertIndex === -1 ? -1 : insertIndex + index, {
        customId: id
      });
    });
  }

  @execute
  insertDSLFragment({
    parentId,
    dsl,
    insertIndex = -1,
    opt,
    callback
  }: {
    parentId: string;
    dsl: Pick<IPageSchema, 'child' | 'componentIndexes' | 'props'>;
    insertIndex: number;
    opt?: { customId: string };
    callback?: () => void;
  }) {
    const { child } = dsl;
    const parent = this.fetchComponentInDSL(parentId);
    if (parent.children.length) {
      const preSiblingId = parent.children[insertIndex - 1]?.current;
      this.dangerousCloneAndInsertComponent(child.current, preSiblingId, InsertType.insertAfter, dsl as any);
    } else {
      this.dangerousCloneAndInsertComponent(child.current, parentId, InsertType.insertInFirst, dsl as any);
    }
  }

  /**
   * 为表格类组件插入整行数据
   */
  insertRowForTable(
    columns: { configName: string; dependency: string }[],
    tableComponentId: string,
    callback: () => void
  ): void {
    const tableComponent = this.dsl.componentIndexes[tableComponentId];
    if (tableComponent) {
      tableComponent.children = tableComponent.children || [];
      const rows = tableComponent.children;
      if (rows.length) {
        // 如果不止一行，则直接复制
        this.cloneAndInsertComponent(
          rows[rows.length - 1].current,
          rows[rows.length - 1].current,
          InsertType.insertAfter
        );
      } else {
        // 先插入一个水平容器作为行的容器，它不会被渲染
        const rowComponent = this.dangerousInsertComponent(tableComponentId, 'HorizontalFlex', 'html');
        columns.forEach(({ configName, dependency }) => {
          if (configName === 'HorizontalFlex') {
            const buttonContainer = this.dangerousInsertComponent(rowComponent.id, 'HorizontalFlex', 'html');
            this.dangerousInsertComponent(buttonContainer.id, 'Button', tableComponent.dependency);
          } else {
            this.dangerousInsertComponent(rowComponent.id, configName, dependency);
          }
        });
      }
      if (callback) {
        callback();
      }
    }
  }

  /**
   * 判断源组件是否是目标组件的后代
   *
   * @param source 源组件
   * @param target 目标组件
   */
  isDescendant(source: string, target: string) {
    if (source === target) {
      return false;
    }
    let currentParent = this.fetchParentComponentInDSL(source);
    let count = 0;
    const maxLoopingCount = 500;
    while (currentParent) {
      if (count >= maxLoopingCount) {
        console.error('isDescendant方法死循环告警！');
        break;
      }
      count++;
      // 目标组件和 source 某个祖先是同一个组件
      if (target === currentParent.id) {
        return true;
      }
      currentParent = this.fetchParentComponentInDSL(currentParent.id);
    }
    return false;
  }

  /**
   * 判断一个组件是不是在一个 solid 组件内，如果是，则它不会被 EditorWrapper 包装
   * @param componentId
   */
  isDraggable(componentId: ComponentId) {
    // const component = this.dsl.componentIndexes[componentId];
    // if (!component) {
    //   return false;
    // }
    // let parent = this.dsl.componentIndexes[component.parentId];
    // while (parent) {
    //   const parentConfig = ComponentManager.fetchComponentConfig(parent.configName, parent.dependency);
    //   if (!parentConfig) {
    //     return true;
    //   }
    //   if (!parentConfig.children) {
    //     return true;
    //   }
    //   if (parentConfig.children.notDraggable) {
    //     return false;
    //   }
    //   if (!parent.parentId) {
    //     return true;
    //   }
    //   parent = this.dsl.componentIndexes[parent.parentId];
    // }
    // return true;
    const feature = this.whereIsIt(componentId);
    return feature !== ComponentFeature.blackBox;
  }

  /**
   * 判断当前组件是否是隐藏的
   * @param id
   */
  isHidden(id: ComponentId) {
    return this.hiddenComponentDict[id];
  }

  /**
   * 判断当前组件是否是隐藏的
   * @param id
   */
  isHiddenOrInHiddenAncestor(id: ComponentId) {
    const component = this.fetchComponentInDSL(id);
    if (this.hiddenComponentDict[id]) {
      return true;
    }
    let parent = this.fetchComponentInDSL(component.parentId);
    while (parent) {
      if (this.hiddenComponentDict[parent.id]) {
        return true;
      }
      parent = this.fetchComponentInDSL(parent.parentId);
    }
    return false;
  }

  /**
   * 需做忽略处理的节点：slot/transparent
   * @returns
   */
  isIgnoreFeatureComponent(component: IComponentSchema) {
    if (component.feature === ComponentFeature.slot || component.feature === ComponentFeature.transparent) {
      return true;
    }
    return false;
  }

  /**
   * 判断一个组件是否在一个黑盒组件中
   *
   */
  isInBlackBox(id: ComponentId) {
    const component = this.fetchComponentInDSL(id);
    let parent = this.fetchComponentInDSL(component.parentId);
    while (parent) {
      if (parent.feature === ComponentFeature.blackBox) {
        return true;
      } else {
        parent = this.fetchComponentInDSL(parent.parentId);
      }
    }
    return false;
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

  isLayerShown(): boolean {
    if (!this.dsl?.componentIndexes) {
      return false;
    }
    return Object.values(this.dsl.componentIndexes).some(item => {
      const componentConfig = ComponentManager.fetchComponentConfig(item.configName, item.dependency);
      return !!(!this.isHidden(item.id) && componentConfig?.isLayer);
    });
  }

  /**
   * 判断一个组件是不是 page root 组件
   * @param id
   */
  isPageRoot(id: ComponentId) {
    return this.dsl.child.current === id;
  }

  /**
   * 检测一个动作是否被组件引用了
   */
  isUsingByComponent(actionId: string) {
    // TODO:
  }

  @execute
  mergeComponentProps(componentId: string) {
    this.mergeSingleComponentProps(componentId);
  }

  mergeSingleComponentProps(componentId: string) {
    if (componentId) {
      const component = this.dsl.componentIndexes[componentId];
      const props = this.dsl.props[componentId];
      const newConfig = ComponentManager.fetchComponentConfig(component.configName, component.dependency);
      const newProps = newConfig.propsConfig;
      Object.keys(newProps).forEach(key => {
        if (props[key] && checkPropsItemIsEqual(props[key], newProps[key])) {
          newProps[key] = props[key];
        }
      });
      this.dsl.props[componentId] = newProps;
      this.dsl.componentIndexes[componentId].propsRefs = Object.keys(newProps);
    }
  }

  @execute
  moveComponent(parentId: string, childId: string, insertIndex: number | 'start' | 'end' = -1) {
    this.currentParentNode = this.fetchComponentInDSL(parentId);
    if (this.currentParentNode) {
      const { children } = this.currentParentNode;
      const childIndex = children.length ? children.findIndex(item => item.current === childId && !item.isText) : -1;
      if (childIndex > -1) {
        const [child] = children.splice(childIndex, 1);
        if (insertIndex === 'start') {
          children.unshift(child);
        } else if (insertIndex === -1 || insertIndex === 'end') {
          children.push(child);
        } else if (insertIndex > childIndex) {
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
            configName: childComponent.configName,
            isText: false
          };
          if (insertIndex === 'start') {
            children.unshift(ref);
          } else if (insertIndex === -1 || insertIndex === 'end') {
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

  @execute
  overrideDSL(dsl: IPageSchema = undefined) {
    this.initDSL(dsl);
  }

  /**
   * 重做
   */
  redo() {
    if (!this.canRedo) {
      return;
    }
    const diff = this.redoStack.pop();
    if (!diff) return;
    if (isEmpty(diff.added) && isEmpty(diff.deleted) && isEmpty(diff.updated)) {
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
    // 新名字和老名字一样直接忽略
    if (componentSchema.displayName === newName) {
      return;
    }
    // 删除旧名字记录
    delete this.componentDisplayNameDict[componentSchema.displayName];
    // 增加新名字记录
    this.componentDisplayNameDict[newName] = true;
    // 名字覆盖
    componentSchema.displayName = newName;
  }

  /**
   * 替换掉当前组件下，指定索引的子组件
   *
   * @param parentId
   * @param index
   * @param name
   * @param dependency
   */
  @execute
  replaceChild(parentId: string, index: number, name: string, dependency: string) {
    if (index < 0) {
      return;
    }
    const currentComponent = this.dsl.componentIndexes[parentId];
    if (!currentComponent.children || typeOf(currentComponent.children) !== 'array') {
      return;
    }
    if (index >= currentComponent.children.length) {
      return;
    }
    const newComponent = this.dangerousInsertComponent(currentComponent.id, name, dependency, index);
    // 找到需要删除的组件
    this.dangerousDeleteComponent(currentComponent.children[index + 1].current);
    return newComponent;
  }

  @execute
  replaceComponentWithBusiness(
    id: ComponentId,
    values: {
      name: string;
      props: string[];
      children: string[];
    } | null
  ) {
    replaceComponentWithBusiness(this, id, values as ReplaceComponentWithBusinessValues);
  }

  resetComponentsRef() {
    this.componentsRef = {};
  }

  resetSelectedComponent(): void {
    this.selectComponent(this.dsl.child.current);
  }

  /**
   * 选中当前节点（若是需做忽略处理的节点，则递归查找其父节点中首个非忽略节点）
   */
  selectComponent(componentId: ComponentId) {
    this.selectedComponent = this.findFirstRealComponent(componentId);
  }

  setAllActions(actions: IActionSchema[]) {
    if (!actions) {
      return;
    }
    const oldDsl = toJS(this.dsl);
    this.dsl.actions = {};
    actions.forEach(item => {
      this.dsl.actions[item.id] = item;
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newDsl = toJS(this.dsl);
    const diff = detailedDiff(newDsl, oldDsl);
    const { added, updated, deleted } = diff;
    if (isEmpty(added) && isEmpty(updated) && isEmpty(deleted)) {
      return;
    }
    // 有 diff，标记为应该保存
    this.setShouldSave(true);
  }

  setComponentsIsRenderedMap(componentId: string) {
    this.componentsIsRenderedMap[componentId] = true;
  }

  setComponentsRef(componentId: string, componentRef: React.MutableRefObject<HTMLElement>) {
    const componentsRef = { ...this.componentsRef };
    if (!componentRef) {
      delete componentsRef[componentId];
    } else {
      componentsRef[componentId] = componentRef;
    }
    this.componentsRef = {
      ...componentsRef
    };
  }

  setCurrentPageId(pageId: string) {
    this.currentPageId = pageId;
    this.resetComponentsRef();
    this.clearComponentsIsRenderedMap();
  }

  setDSL(dsl: IPageSchema) {
    if (dsl) {
      this.dsl = dsl;
      // 外源性的修改 dsl，会导致 selectedComponent 丢失
      this.selectComponent(this.selectedComponent?.id || this.dsl.child.current);
      // 重置字典，把名字重新录入一遍
      this.componentDisplayNameDict = {};
      Object.values(this.dsl.componentIndexes).forEach(item => {
        this.componentDisplayNameDict[item.name] = true;
      });
    }
  }

  setEventsForComponent(id: ComponentId, eventList: IEventSchema[]) {
    if (!eventList) {
      return;
    }
    const oldDsl = toJS(this.dsl);
    this.dsl.events[id] = eventList;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newDsl = toJS(this.dsl);
    const diff = detailedDiff(newDsl, oldDsl);
    const { added, updated, deleted } = diff;
    if (isEmpty(added) && isEmpty(updated) && isEmpty(deleted)) {
      return;
    }
    // 有 diff，标记为应该保存
    this.setShouldSave(true);
  }

  setHiddenComponentDict(componentDict: Record<ComponentId, boolean>) {
    this.hiddenComponentDict = componentDict;
  }

  setShouldSave(val: boolean) {
    this.shouldSave = val;
  }

  setTemplateTo(tplInfo: TemplateInfo, propsConfig: { [key: string]: IPropsConfigItem }) {
    const basicTplInfo: Partial<TemplateInfo> = {
      data: undefined,
      keyPathRegs: [],
      parent: undefined,
      key: '',
      currentKeyPath: ''
    };
    const fullTplInfo: TemplateInfo = Object.assign(basicTplInfo, tplInfo);

    const { data, keyPathRegs, parent, key, currentKeyPath, nodeId } = fullTplInfo;
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
        renderType = 'slot',
        customGenerateCode = undefined
      } = keyPathMatchResult as TemplateKeyPathsReg;
      if (customGenerateCode) {
        parent[key] = {
          _type: 'customGenerateCode',
          _value: customGenerateCode
        };
      } else if (repeatPropRef) {
        //   if (repeatType === 'list' && indexKey) {
        //     (dataSourcePropConfig.value as any[]).forEach((item, index) => {
        //       const component = this.createEmptyContainer(generateSlotId(nodeId, item[indexKey]), {
        //         feature: ComponentFeature.slot
        //       });
        //       component.parentId = nodeId;
        //       // 只保留第一行的render
        //       if (index === 0) {
        //         parent[key] = {
        //           current: component.id,
        //           configName: component.configName,
        //           isText: false
        //         };
        //       }
        //     });
        //   } else if (repeatType === 'table' && indexKey && columnKey) {
        //     (dataSourcePropConfig.value as any[]).forEach((item, index) => {
        //       const component = this.createEmptyContainer(generateSlotId(nodeId, item[indexKey], parent[columnKey]), {
        //         feature: ComponentFeature.slot
        //       });
        //       component.parentId = nodeId;
        //       // 只保留第一行的render
        //       if (index === 0) {
        //         parent[key] = {
        //           current: component.id,
        //           configName: component.configName,
        //           isText: false
        //         };
        //       }
        //     });
        //   }
        // }
      } else {
        // 如果模板的默认值是 null 或者 false，说明默认状态下不需要拖入组件，此时配置的表单也应该关闭这个功能
        if (!data) {
          return;
        }
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
              // TODO：这里需要重构，配置将来是用户设置的，它的名字 (configName) 不见得能用
              const component = this.createComponent(configName, dependency);
              // 顶部的节点的 feature 需要被修正为 solid，防止 editor 拖入其他的元素
              if (feature) {
                component.feature = feature;
              }
              if (node.children.length) {
                component.children = recursiveMap(node.children, component.id).map(item => {
                  return {
                    current: item.id,
                    configName: item.configName,
                    isText: false
                  };
                });
              }
              return component;
            });
          };
          component = recursiveMap([data], nodeId, ComponentFeature.solid)[0];
        } else {
          component = this.createEmptyContainer(
            '',
            { feature: ComponentFeature.slot },
            {
              style: {
                padding: 0,
                height: '100%'
              }
            }
          );
          component.parentId = nodeId;
        }
        parent[key] = {
          current: component.id,
          configName: component.configName,
          isText: false
        };
      }
    } else {
      const type = typeOf(data);
      if (type === 'object') {
        Object.entries(data).forEach(([key, val]) => {
          this.setTemplateTo(
            {
              data: val,
              keyPathRegs,
              parent: data,
              key,
              currentKeyPath: `${currentKeyPath ? currentKeyPath + '.' : currentKeyPath}${key}`,
              nodeId
            },
            propsConfig
          );
        });
      } else if (type === 'array') {
        data.forEach((item: any, index: number) => {
          this.setTemplateTo(
            {
              data: item,
              keyPathRegs,
              parent: data,
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

  /**
   * 设置状态的值
   *
   * @param stateName 状态变量名
   * @param value 状态值
   */
  setVariable(stateName: string, value: any) {
    if (this.dsl.variableDict[stateName]) {
      return;
    }
    this.dsl.variableDict[stateName].initialValue = value;
  }

  showComponent(id: ComponentId) {
    delete this.hiddenComponentDict[id];
    // const children = this.findChildren(id);
    // if (children.length) {
    //   children.forEach(item => {
    //     this.showComponent(item.id);
    //   });
    // }
    //
    // const ancestors = this.fetchAncestors(id);
    // const descendants = this.fetchDescendants(id);
    // [...ancestors, ...descendants].forEach(component => {
    //   delete this.hiddenComponentDict[component.id];
    // });

    // 展示本组件
    const componentSchema = this.dsl.componentIndexes[id];
    if (!componentSchema) {
      return;
    }
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

  syncExternalData(key: string, value: any) {
    this.isSyncing = true;
    this[key] = value;
    this.isSyncing = false;
  }

  syncVariables(variables: Record<string, any>) {
    this.dsl.variableDict = variables;
  }

  /**
   * 撤销
   */
  undo() {
    if (!this.canUndo) {
      return;
    }
    const diff = this.undoStack.pop();
    if (!diff) return;
    if (isEmpty(diff.added) && isEmpty(diff.deleted) && isEmpty(diff.updated)) {
      return;
    }
    this.mergeDiffAndProcessNewDiff(diff, this.redoStack);
  }

  unselectComponent() {
    this.selectComponent(this.dsl.child.current);
  }

  /**
   * 更新动作
   *
   * @param id
   * @param opt
   */
  updateAction(id: string, opt: { name?: string; desc?: string; actionType?: ActionType; payload?: any }) {
    // TODO: 更新动作
    if (!this.dsl.actions[id]) {
      throw new Error(`不存在的 action: ${id}`);
    }
    const action = this.dsl.actions[id];
    Object.assign(action, opt);
  }

  /**
   * 更新指定组件的propsConfig
   */
  @execute
  updateComponentProps(
    propsPartial: Record<string, any> | CSSProperties,
    targetComponent?:
      | {
          id: IComponentSchema['id'];
        }
      | IComponentSchema
  ) {
    return this.dangerousUpdateProps(propsPartial, targetComponent);
  }

  updateComponentStats(componentName: string) {
    if (this.dsl.componentStats[componentName] === undefined) {
      this.dsl.componentStats[componentName] = 0;
    } else {
      this.dsl.componentStats[componentName]++;
    }
  }

  /**
   * 查询变量使用的情况，如果有使用，则返回组件的 id，否则返回 null
   * @param key
   * @return { propsName: string; componentId: string } | null
   */
  variableUsageInfo(key: string): { propsName: string; componentId: string } | null {
    // 遍历每一个 state 类型的 props
    let result = null;
    Object.entries(this.dsl.props).some(([componentId, propsDict]) => {
      return Object.entries(propsDict).some(([propsName, propsSchema]) => {
        if (propsSchema.value === key && propsSchema.valueSource === 'state') {
          result = {
            propsName,
            componentId
          };
          return true;
        }
        return false;
      });
    });
    return result;
  }

  /**
   * 找到第一个既不是 solid 也不是 transparent 的祖先组件
   *
   * @param id
   */
  whereIsIt(id: ComponentId) {
    const component = this.fetchComponentInDSL(id);
    let parent = this.fetchComponentInDSL(component.parentId);
    while (parent) {
      if (parent.feature !== ComponentFeature.solid && parent.feature !== ComponentFeature.transparent) {
        return parent.feature;
      }
      parent = this.fetchComponentInDSL(parent.parentId);
    }
    return ComponentFeature.root;
  }

  private calculateComponentName(config: IComponentConfig) {
    const { callingName, importName, configName } = config;
    if (callingName) {
      // callingName 里可能有调用符，需要去掉
      return callingName.replace(/\./g, '');
    }
    return importName || configName;
  }

  private cloneSubtree(id: ComponentId, parentId: string) {
    const componentSchema = this.dsl.componentIndexes[id];
    if (!componentSchema) {
      return null;
    }
    // 1. 复制 component schema 本身
    const clonedComponentSchema = cloneDeep(componentSchema);
    // 2. 生成新的 component id
    clonedComponentSchema.id = this.generateComponentIdByName(clonedComponentSchema.configName);
    // 3. 修改 parentId
    clonedComponentSchema.parentId = parentId;
    // 4. 生成新的 displayName
    const componentConfig = ComponentManager.fetchComponentConfig(
      clonedComponentSchema.configName,
      clonedComponentSchema.dependency
    );
    clonedComponentSchema.displayName = `${componentConfig?.title}${
      this.dsl.componentStats[clonedComponentSchema.configName]
    }`;
    // 5. 复制子树，并重新替换父组件的 children
    if (clonedComponentSchema?.children) {
      clonedComponentSchema.children = clonedComponentSchema.children.map(child => {
        if (child.isText) {
          return cloneDeep(child);
        } else {
          const clonedSubtree = this.cloneSubtree(child.current, clonedComponentSchema.id);

          if (!clonedSubtree) {
            return {
              current: '',
              configName: componentConfig.configName,
              isText: false
            };
          }
          return {
            current: clonedSubtree.id,
            configName: componentConfig.configName,
            isText: false
          };
        }
      });
    }
    // 6. 复制 props
    this.dsl.props[clonedComponentSchema.id] = cloneDeep(this.dsl.props[id]);
    // 7. 遍历每一个 prop，如果它存在插槽，递归复制以插槽为根节点的子树
    const clonedPropsDict = this.dsl.props[clonedComponentSchema.id];
    clonedComponentSchema.propsRefs.forEach(ref => {
      const clonedPropsSchema: IPropsSchema = clonedPropsDict[ref];
      const { templateKeyPathsReg, value } = clonedPropsSchema;
      if (templateKeyPathsReg?.length) {
        const flattenedObject = flattenObject(value);
        Object.entries(flattenedObject).forEach(([keyPath, val]) => {
          const matchKeyPath = templateKeyPathsReg.some(regInfo => {
            return new RegExp(`^${regInfo.path}$`).test(keyPath);
          });
          if (matchKeyPath) {
            const oldSubtreeId = getValueByPath(clonedPropsSchema.value as IComponentSchema, keyPath)?.current;
            const clonedSubtree = this.cloneSubtree(
              // 用 keyPath 找到那个需要克隆的 ReactNode 的 id
              oldSubtreeId,
              clonedComponentSchema.id
            );
            const clonedNode = {
              current: clonedSubtree?.id || '',
              configName: componentConfig.configName,
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
    // 8. 将节点挂载到 componentIndexes
    this.dsl.componentIndexes[clonedComponentSchema.id] = clonedComponentSchema;
    return this.dsl.componentIndexes[clonedComponentSchema.id];
  }

  private componentExists(id: ComponentId, dsl = this.dsl) {
    return id in dsl.componentIndexes;
  }

  private createPageRoot() {
    const component = this.createComponent('PageRoot', 'html');
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
        configName: item.configName,
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
    if (!propsDict) {
      return;
    }
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
            if (val) {
              this.deleteSubtree((val as any).id);
            }
          }
        });
      }
    });

    // 3. 删除 props
    delete this.dsl.props[id];

    // 4. 删除 event
    delete this.dsl.events[id];

    // 5. 从父节点的 children 中删除对这个组件的引用
    this.removeReferenceFromParent(id);

    // 6. 从索引中删除组件信息
    delete componentIndexes[id];

    return component;
  }

  // 递归组件props，找到自定义组件
  private findCustomComponentInProps(componentId: ComponentId, dsl: IPageSchema) {
    const componentSchema = dsl.componentIndexes[componentId];
    const componentNodes: ComponentSchemaRef[] = [];
    (componentSchema.propsRefs || []).forEach(propRef => {
      const propsSchema = dsl.props[componentId][propRef];
      const clonedPropsSchema = cloneDeep(propsSchema);
      const { templateKeyPathsReg, value } = clonedPropsSchema;
      if (templateKeyPathsReg?.length) {
        for (const regInfo of templateKeyPathsReg) {
          if (regInfo.path !== '') {
            const flattenedObject = flattenObject(value);
            for (const keyPath in flattenedObject) {
              if (new RegExp(`^${regInfo.path}$`).test(keyPath)) {
                const templateRef = getValueByPath(value, keyPath);
                if (isArray(templateRef)) {
                  componentNodes.push(...templateRef);
                } else {
                  componentNodes.push(templateRef);
                }
              }
            }
          } else {
            // 特殊情况：如果模板的 key path 是 空字符串，直接去 value 做为组件节点
            if (value) {
              componentNodes.push(value);
            }
          }
        }
      }
    });
    return componentNodes.filter(i => i?.current && this.componentExists(i.current, dsl));
  }

  private findIndexInParent(componentId: ComponentId, dsl = this.dsl): number {
    if (!componentId) {
      return -1;
    }
    const component = dsl.componentIndexes[componentId];
    const parent = dsl.componentIndexes[component.parentId];
    if (parent) {
      if (parent.children?.length > 0) {
        return parent.children.findIndex(child => child.current === component.id && !child.isText);
      }
      return -1;
    }
    return -1;
  }

  private generateComponentIdByName(name: string): string {
    // 删除里边的 “.”，会导致属性选择器失效
    this.updateComponentStats(name);
    const withNoDot = name.replace(/\./g, '');
    // console.log('this.dsl.componentStats: ', this.dsl.componentStats);
    return hyphenToCamelCase(`${withNoDot}${this.dsl.componentStats[name]}`);
  }

  private generateComponentKey(componentId: string) {
    return `${componentId}_${nanoid()}`;
  }

  private generateNewComponentDisplayName(name: string, suffix = '副本') {
    let newCandidateName = `${name} ${suffix}`;
    // 如果候选名字在字典中，继续追加副本后缀名，直到出现新名字
    if (suffix) {
      while (newCandidateName in this.componentDisplayNameDict) {
        newCandidateName += ` ${suffix}`;
      }
      // 录入新名字到字典里
      this.componentDisplayNameDict[newCandidateName] = true;
    }
    return newCandidateName;
  }

  private mergeDiffAndProcessNewDiff(
    diff: {
      added?: Record<string, any>;
      updated?: Record<string, any>;
      deleted?: Record<string, any>;
    },
    diffStack: any[]
  ) {
    // TODO: 这里toJS 大对象可能会导致表单渲染慢，后续可以换成 zustand
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
      // 后处理
      if (!this.componentExists(this.selectedComponent.id)) {
        this.resetSelectedComponent();
      }
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
      if (parent?.children?.length) {
        parent.children = parent.children.filter(item => item.current !== id);
      }
    }
  }

  private setComponentKey(componentId: string, key: string) {
    this.componentKeyMap[componentId] = key;
  }
}
