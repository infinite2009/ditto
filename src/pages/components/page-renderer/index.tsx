import React, { CSSProperties, FC, PropsWithChildren, Reducer, useContext, useReducer } from 'react';
import IPropsSchema, { TemplateKeyPathsReg } from '@/types/props.schema';
import IComponentSchema from '@/types/component.schema';
import { fetchComponentConfig, generateSlotId, typeOf } from '@/util';
import EditWrapper from '@/pages/editor/edit-wrapper';
import ComponentFeature from '@/types/component-feature';
import { observer } from 'mobx-react-lite';
import IComponentConfig from '@/types/component-config';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { ComponentId, PropsId, TemplateInfo } from '@/types';
import { toJS } from 'mobx';
import IActionSchema from '@/types/action.schema';
import ActionType from '@/types/action-type';
import { open } from '@tauri-apps/api/shell';
import { DSLStoreContext } from '@/hooks/context';
import cloneDeep from 'lodash/cloneDeep';

export interface IPageRendererProps {
  mode?: 'edit' | 'preview';
  scale?: number;
}

export default observer((props: IPageRendererProps) => {
  if (!props) {
    return null;
  }

  const dslStore = useContext(DSLStoreContext);

  const { mode = 'preview', scale } = props;

  const dslObj = toJS(dslStore.dsl);

  const [transferredComponentState, componentStateDispatch] = useReducer<
    Reducer<Record<ComponentId, Record<PropsId, any>>, any>
  >(stateTransitionReducer, {});
  const [componentVisibilityState, componentVisibilityDispatch] = useReducer<
    Reducer<Record<ComponentId, boolean>, any>
  >(componentHiddenReducer, {});

  function stateTransitionReducer(
    state: Record<ComponentId, Record<PropsId, any>>,
    action: { target: ComponentId; props: Record<PropsId, { name: string; value: any }> }
  ): Record<ComponentId, Record<PropsId, any>> {
    const { target, props } = action;
    return {
      ...state,
      [target]: {
        ...props
      }
    };
  }

  function componentHiddenReducer(
    state: Record<ComponentId, boolean>,
    action: { target: ComponentId; visible: boolean }
  ): Record<ComponentId, boolean> {
    const { target, visible } = action;
    return {
      ...state,
      [target]: visible
    };
  }

  function executeComponentEvent(actionSchema: IActionSchema) {
    const { type, payload } = actionSchema;
    switch (type) {
      case ActionType.pageRedirection:
        if (payload.isExternal) {
          open(payload.href);
        } else {
          // TODO: 这里 href 是页面的 id，需要用户填，得找个地方展示页面的 id
        }
        break;
      case ActionType.visibilityToggle:
        componentVisibilityDispatch(payload);
        break;
      case ActionType.stateTransition:
        componentStateDispatch(payload);
        break;
      case ActionType.httpRequest:
        // TODO: need implementation
        break;
      default:
        console.error('unknown action type: ', type);
        break;
    }
  }

  function extractProps(propsDict: { [key: string]: IPropsSchema }, propsRefs: string[], nodeId: string) {
    const result: { [key: string]: any } = {};
    propsRefs.forEach(ref => {
      const propsSchema = propsDict[ref];
      if (propsSchema) {
        result[ref] = extractSingleProp(propsSchema, nodeId);
      }
    });
    return result;
  }

  function extractSingleProp(propsSchema: IPropsSchema, nodeId: string): any {
    const { templateKeyPathsReg, name, valueType, value, valueSource } = propsSchema;
    const wrapper = { value };
    if (valueSource === 'editorInput') {
      if (templateKeyPathsReg?.length) {
        convertTemplateInfo({
          data: value,
          keyPathRegs: templateKeyPathsReg,
          parent: wrapper,
          key: 'value',
          currentKeyPath: '',
          nodeId: nodeId
        });
      }
    } else if (valueSource === 'handler') {
      // 获取 eventSchema
      const eventSchema = dslObj.events[value as string];
      if (eventSchema) {
        const handlerSchema = dslObj.handlers[eventSchema.handlerRef];
        if (handlerSchema) {
          const actionsSchema = handlerSchema.actionRefs.map(ref => dslObj.actions[ref]);
          wrapper.value = () => {
            actionsSchema.forEach(action => {
              executeComponentEvent(action);
            });
          };
        }
      }
    }
    return wrapper.value;
  }

  /**
   * 把模板信息转换为 tsx
   * @param tplInfo
   */
  function convertTemplateInfo(tplInfo: TemplateInfo) {
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
      if (keyPathMatchResult.type === 'object') {
        parent[key] = recursivelyRenderTemplate(data, true);
      } else {
        const { itemIndexInArgs, indexKey, repeatType, columnKey } = keyPathMatchResult as TemplateKeyPathsReg;
        if (repeatType === 'list' && indexKey) {
          parent[key] = (...args: any[]) => {
            const item = args[itemIndexInArgs as number];
            // TODO：这里输入的 nodeRef 是不可观察的
            return recursivelyRenderTemplate({ current: generateSlotId(nodeId, item[indexKey]), isText: false }, true);
          };
        } else if (repeatType === 'table') {
          parent[key] = (...args: any[]) => {
            const item = args[itemIndexInArgs as number];
            if (indexKey && columnKey) {
              return recursivelyRenderTemplate(
                { current: generateSlotId(nodeId, item[indexKey], parent[columnKey]), isText: false },
                true
              );
            }
            return recursivelyRenderTemplate(data, true);
          };
        } else {
          parent[key] = (...args: any[]) => {
            return recursivelyRenderTemplate(data, true);
          };
        }
      }
    } else {
      const type = typeOf(data);
      if (type === 'object') {
        Object.entries(data).forEach(([key, val]) => {
          convertTemplateInfo({
            data: val,
            keyPathRegs,
            parent: data,
            key,
            currentKeyPath: `${currentKeyPath ? currentKeyPath + '.' : currentKeyPath}${key}`,
            nodeId: nodeId
          });
        });
      } else if (type === 'array') {
        data.forEach((item: any, index: number) => {
          convertTemplateInfo({
            data: item,
            keyPathRegs,
            parent: data,
            key: index.toString(),
            currentKeyPath: `${currentKeyPath}[${index}]`,
            nodeId
          });
        });
      }
    }
  }

  /**
   *
   * @param nodeRef
   * @param isSlot 当前组件是否是一个插槽
   * @param isRoot
   */
  function recursivelyRenderTemplate(nodeRef: ComponentSchemaRef, isSlot = false, isRoot = false) {
    // 判断节点的类型
    if (nodeRef.isText) {
      return nodeRef.current;
    }
    const node = dslObj.componentIndexes[nodeRef.current];

    // 检查组件的运行时显隐情况，如果是隐藏状态，则不予渲染。（通过组件 props 控制的组件不在此列）
    if (componentVisibilityState[node.id] === false) {
      return null;
    }

    // 处理组件
    const { props = {} } = dslObj;
    const {
      parentId,
      configName,
      callingName,
      name,
      dependency,
      children = [],
      propsRefs = [],
      id: componentId
    } = node as IComponentSchema;
    let Component: string | FC<PropsWithChildren<any>> = callingName || name;
    let componentConfig: IComponentConfig | undefined;
    if (dependency) {
      componentConfig = fetchComponentConfig(configName || name, dependency);
    }
    if (componentConfig) {
      Component = componentConfig.component;
    }
    const componentProps = props[componentId] ? extractProps(props[componentId], propsRefs, componentId) : {};

    // 将事件修改的 props 合并到 componentProps，为了表达简洁，没有判断额外的属性是否存在
    Object.assign(componentProps, transferredComponentState[componentId]);

    // 剔除 props 中的 children
    delete componentProps.children;

    // 对于 children 是纯文本的组件，如果事件动作修改了它的 children，讲替换掉 schema 中描述的 children。这是运行时的改动，不会影响 dsl 存储
    const childrenTemplate =
      transferredComponentState[componentId]?.children ||
      children.map(c => (c.isText ? c.current : recursivelyRenderTemplate(c)));

    const childrenId = children.filter(c => !c.isText).map(c => c.current);

    let rootProps = {};
    if (isRoot) {
      rootProps = {
        id: componentId,
        childrenId,
        parentId: dslObj.id,
        scale
      };
    }

    const componentPropsWithoutMargin = cloneDeep(componentProps);
    const marginStyleNames: (keyof CSSProperties)[] = [
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft'
    ];
    marginStyleNames.forEach(name => {
      if (componentPropsWithoutMargin?.style) {
        delete componentPropsWithoutMargin?.style[name];
      }
    });

    const tpl = (
      <Component key={componentId} {...componentPropsWithoutMargin} {...rootProps}>
        {childrenTemplate}
      </Component>
    );
    let feature;
    if (isSlot) {
      feature = ComponentFeature.slot;
    } else if (componentConfig?.isContainer) {
      feature = ComponentFeature.container;
    } else {
      feature = ComponentFeature.solid;
    }

    return mode === 'edit' && !isRoot ? (
      <EditWrapper
        key={componentId}
        id={componentId}
        parentId={parentId}
        childrenId={childrenId}
        feature={feature}
        childrenStyle={componentProps?.style}
      >
        {tpl}
      </EditWrapper>
    ) : (
      tpl
    );
  }

  function render() {
    return recursivelyRenderTemplate(dslObj.child, true, true);
  }

  return dslStore.dsl ? <>{render()}</> : <div>未获得有效的DSL</div>;
});
