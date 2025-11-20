import React, {
  cloneElement,
  FC,
  PropsWithChildren,
  Reducer,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer
} from 'react';
import { observer } from 'mobx-react';
import { reaction, toJS } from 'mobx';
import { ErrorBoundary } from 'react-error-boundary';
import { cloneDeep } from 'lodash';
import IPropsSchema, { TemplateKeyPathsReg } from '@/types/props.schema';
import IComponentSchema from '@/types/component.schema';
import { isDifferent, isWeb, typeOf } from '@/util';
import IComponentConfig from '@/types/component-config';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { ComponentId, PropsId, TemplateInfo } from '@/types';
import IActionSchema, { HttpActionOption, PageDirectionOption, StateTransitionOption } from '@/types/action.schema';
import ActionType from '@/types/action-type';
import { open } from '@tauri-apps/api/shell';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import ComponentManager from '@/service/component-manager';
import ComponentPlaceHolder from '@/pages/editor/place-holder';
import { DesignMode } from '@/service/editor-store';
import Page from '@/pages/editor/page';
import VoltronAttributeContainer, { VoltronAttributes } from '@/components/voltron-attribute-container';
import { findKeyIndices, findNodeByIndices, NodeKey } from '@/pages/components/draggable-tree/utils';
import DSLStore from '@/service/dsl-store';
import { postVoltronCommonProxy } from '@/api';
import dayjs from 'dayjs';
import { ConfigProvider as AntdConfigProvider } from 'antd';
import antdZhCN from 'antd/locale/zh_CN';

export interface IPageRendererProps {
  extraStore?: DSLStore;
  onRender?: () => void;
}

const PageRenderer: FC<IPageRendererProps> = observer((props: IPageRendererProps) => {
  if (!props) {
    return null;
  }

  const { extraStore, onRender } = props;

  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);
  const dsl = useMemo(() => {
    return toJS(extraStore?.dsl || dslStore?.dsl);
  }, [extraStore?.dsl, dslStore?.dsl]);

  const [transferredComponentState, componentStateDispatch] = useReducer<
    Reducer<Record<ComponentId, Record<PropsId, any>>, any>
  >(stateTransitionReducer, {});
  const [componentVisibilityState, componentVisibilityDispatch] = useReducer<
    Reducer<Record<ComponentId, boolean>, any>
  >(componentVisibilityReducer, {});

  useEffect(() => {
    reaction(
      () => toJS(dslStore.dsl?.variableDict),
      (data, oldData) => {
        if (!isDifferent(data, oldData)) {
          return;
        }
        editorStore.initStateDict(data || {});
      },
      {
        fireImmediately: true
      }
    );
  }, []);

  useLayoutEffect(() => {
    if (onRender && extraStore) {
      onRender();
    }
  }, [extraStore]);

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

  function componentVisibilityReducer(
    state: Record<ComponentId, boolean>,
    action: { target: ComponentId; visible: boolean }
  ): Record<ComponentId, boolean> {
    const { target, visible } = action;
    if (visible) {
      dslStore.showComponent(target);
    } else {
      dslStore.hideComponent(target);
    }
    return {
      ...state,
      [target]: visible
    };
  }

  function executeStateTransition(options: StateTransitionOption) {
    const { value, useFunction, name } = options as StateTransitionOption;
    if (useFunction) {
      const fn = new Function('states', value);
      editorStore.setState(name, fn(editorStore.stateDict));
    } else {
      editorStore.setState(name, value);
    }
  }

  async function executeHttpRequest(options: HttpActionOption) {
    const { name, requestOpt } = options;
    const res = await postVoltronCommonProxy(requestOpt);
    if (name) {
      editorStore.setState(name, res.data);
    }
  }

  function executePageDirection(options: PageDirectionOption) {
      window.open(options.url, options.target);
  }

  function executeComponentEvent(actionSchema: IActionSchema) {
    const { type, options } = actionSchema;
    switch (type) {
      case ActionType.PAGE_DIRECTION:
      case ActionType.EXTERNAL_PAGE_OPEN:
        executePageDirection(options as PageDirectionOption);
        break;
      case ActionType.STATE_TRANSITION:
        // componentStateDispatch(options);
        executeStateTransition(options as StateTransitionOption);
        break;
      case ActionType.HTTP_REQUEST:
        executeHttpRequest(options as HttpActionOption).then();
        break;
      case ActionType.OPEN_LAYER:
        executeStateTransition(options as StateTransitionOption);
        break;
      case ActionType.CLOSE_LAYER:
        executeStateTransition(options as StateTransitionOption);
        break;
      default:
        console.error('unknown action type: ', type);
        break;
    }
  }

  function typeNotCompatible(ref: string, propsSchema: IPropsSchema, props: Record<string, any>) {
    // 针对日期进行特殊处理，可以放行
    if (typeOf(props[ref]) === 'string' && propsSchema.valueType === 'dayjs') {
      return false;
    }
    return (
      (typeOf(propsSchema.valueType) === 'array' &&
        !(propsSchema.valueType as string[]).includes(typeOf(props[ref]))) ||
      (typeOf(propsSchema.valueType) === 'string' && typeOf(props[ref]) !== propsSchema.valueType)
    );
  }

  function extractProps(propsDict: { [key: string]: IPropsSchema }, propsRefs: string[], nodeId: string) {
    const propsDictClone = cloneDeep(propsDict);
    const result: { [key: string]: any } = {};
    const props = Object.fromEntries(Object.keys(propsDictClone).map(i => [i, propsDictClone[i].value]));
    propsRefs.forEach(ref => {
      const propsSchema = propsDictClone[ref];
      if (propsSchema && props[ref] !== undefined) {
        // bugfix: 校验真值属性的类型兼容性，不兼容的类型会被忽略，且抛出后台错误
        if (propsSchema.valueSource !== 'state' && propsSchema.valueSource !== 'handler') {
          if (typeNotCompatible(ref, propsSchema, props)) {
            console.warn(
              `Invalid prop type for ${ref}: expected ${propsSchema.valueType}, but got ${typeOf(props[ref])}`
            );
            return;
          }
        }
        result[ref] = extractSingleProp(propsSchema, nodeId, props);
      }
    });
    return result;
  }

  function extractSingleProp(propsSchema: IPropsSchema, nodeId: string, props: Record<string, unknown>): any {
    const { templateKeyPathsReg, value, valueSource } = propsSchema;
    const wrapper = { value };
    if (valueSource === 'editorInput') {
      if (templateKeyPathsReg?.length) {
        convertTemplateInfo({
          data: value,
          keyPathRegs: templateKeyPathsReg,
          parent: wrapper,
          key: 'value',
          currentKeyPath: '',
          nodeId: nodeId,
          componentProps: props
        });
      } else if (propsSchema.valueType === 'dayjs' && typeOf(value) === 'string') {
        // 针对日期值进行转换
        wrapper.value = dayjs(value, 'YYYY-MM-DD');
      }
    } else if (valueSource === 'handler') {
      if (value && dsl.actions[value.action]) {
        wrapper.value = () => {
          executeComponentEvent(dsl.actions[value.action]);
        };
      } else {
        wrapper.value = undefined;
      }
    } else if (valueSource === 'state') {
      // 值来源是 state，value 的值是一个状态的名称
      if (propsSchema.valueType === 'dayjs' && typeOf(value) === 'string') {
        wrapper.value = dayjs(editorStore.getState(value)?.value, 'YYYY-MM-DD');
      } else {
        wrapper.value = editorStore.getState(value)?.value;
      }
    }
    return toJS(wrapper.value);
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
      currentKeyPath: '',
      componentProps: {}
    };
    const fullTplInfo: TemplateInfo = Object.assign(basicTplInfo, tplInfo);
    const { data, keyPathRegs, parent, key, currentKeyPath, nodeId, componentProps } = fullTplInfo;
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
        const { indexKey, repeatType } = keyPathMatchResult as TemplateKeyPathsReg;
        if (repeatType === 'list') {
          // Dirty: 这里其实依赖了 antd list 组件本身的接口定义，出现了耦合
          parent[key] = (item: any) => {
            // TODO：这里输入的 nodeRef 是不可观察的
            const list = dsl.componentIndexes[nodeId].children;
            return recursivelyRenderTemplate(list[item[indexKey]], true);
          };
        } else if (repeatType === 'table') {
          if (data.length) {
            const repeatProp = componentProps[keyPathMatchResult.repeatPropRef] as any[];
            // 如果data不为空，则生成函数
            parent[key] = (_: any, record: { key: NodeKey }) => {
              const indices = findKeyIndices(repeatProp, record.key);
              const nodeRef = findNodeByIndices(data as ComponentSchemaRef[], indices);
              return recursivelyRenderTemplate(nodeRef, true);
            };
          } else {
            parent[key] = undefined;
          }
        } else if (repeatType === 'transfer') {
          parent[key] = (item: { description: string; title: string }) => {
            if (item.description) {
              return `${item.title}-${item.description}`;
            }
            return item.title;
          };
        } else if (repeatType === 'eeApprovalFooter') {
          parent[key] = (node: any) => {
            return node;
          };
        } else if (repeatType === 'getContainer') {
          // console.log(data);
          // parent[key] = () => {
          //   return document.querySelector(data);
          // };
        } else {
          parent[key] = () => {
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
            nodeId: nodeId,
            componentProps
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
            nodeId,
            componentProps
          });
        });
      }
    }
  }

  /**
   * 递归渲染组件
   * @param nodeRef
   * @param isSlot 当前组件是否是一个插槽
   * @param isRoot
   */
  function recursivelyRenderTemplate(nodeRef: ComponentSchemaRef, isSlot = false, isRoot = false) {
    if (!nodeRef) {
      return null;
    }
    // 判断节点的类型
    if (nodeRef.isText) {
      return nodeRef.current;
    }
    const node = dsl.componentIndexes[nodeRef.current];

    // 防御性编程，由于其他dsl操作错误，导致的部分组件删除不完整
    if (!node) {
      return null;
    }

    // 检查组件的运行时显隐情况，如果是隐藏状态，则不予渲染。（通过组件 props 控制的组件不在此列）
    if (componentVisibilityState[node.id] === false) {
      return null;
    }

    // 处理组件
    const { props: dslProps = {} } = dsl;
    const {
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
      componentConfig = ComponentManager.fetchComponentConfig(configName || name, dependency);
    }
    if (componentConfig) {
      Component = componentConfig.component;
    }

    if (!Component) {
      return <div>无法解析的组件: {Component as unknown as undefined}</div>;
    }

    if (editorStore.mode !== DesignMode.preview && dslStore?.isHidden(componentId)) {
      return null;
    }

    // 预览态（前者为新开预览页，后者editorStore.mode为当前页切换预览状态）
    const isPreviewMode = editorStore.mode === DesignMode.preview;

    const componentProps = dslProps[componentId] ? extractProps(dslProps[componentId], propsRefs, componentId) : {};

    // 将事件修改的 props 合并到 componentProps，为了表达简洁，没有判断额外的属性是否存在
    Object.assign(componentProps, transferredComponentState[componentId], editorStore.componentPropsDict[componentId]);

    // 剔除 props 中的 children
    delete componentProps.children;

    // 补丁：如果是图层组件，要设置 open 属性为 true
    if (editorStore.mode === DesignMode.edit && componentConfig.isLayer) {
      componentProps.open = !dslStore?.isHidden(componentId);
    }

    // 对于 children 是纯文本的组件，如果事件动作修改了它的 children，讲替换掉 schema 中描述的 children。这是运行时的改动，不会影响 dsl 存储
    const childrenTemplate = componentConfig?.children?.noRendering
      ? []
      : transferredComponentState[componentId]?.children ||
        children.map(c => {
          if (c.isText) {
            return c.current;
          }
          return recursivelyRenderTemplate(c);
        });

    if (!isPreviewMode && 'affix' in componentProps && componentProps.affix) {
      componentProps.affix = false;
    }

    if (isPreviewMode) {
      componentProps.id = componentId;
    }

    const voltronAttributes: Partial<VoltronAttributes> = generateVoltronAttributes(
      node,
      componentConfig,
      componentProps
    );

    const tpl =
      childrenTemplate?.length > 0 ? (
        <ErrorBoundary key={componentId} fallback={<div>组件{componentConfig.name}渲染错误</div>}>
          <VoltronAttributeContainer
            selectedComponentId={dslStore.selectedComponent?.id}
            voltronAttributes={voltronAttributes as VoltronAttributes}
            configName={componentConfig.name}
            componentProps={componentProps}
          >
            <Component>{childrenTemplate}</Component>
          </VoltronAttributeContainer>
        </ErrorBoundary>
      ) : componentConfig?.children?.type === 'template' ? (
        <ErrorBoundary key={componentId} fallback={<div>组件{componentConfig.name}渲染错误</div>}>
          <VoltronAttributeContainer
            selectedComponentId={dslStore.selectedComponent?.id}
            voltronAttributes={voltronAttributes as VoltronAttributes}
            configName={componentConfig.name}
            componentProps={componentProps}
          >
            <Component>
              <ComponentPlaceHolder componentDisplayName={node.displayName} />
            </Component>
          </VoltronAttributeContainer>
        </ErrorBoundary>
      ) : (
        <ErrorBoundary key={componentId} fallback={<div>组件{componentConfig.name}渲染错误</div>}>
          <VoltronAttributeContainer
            selectedComponentId={dslStore.selectedComponent?.id}
            voltronAttributes={voltronAttributes as VoltronAttributes}
            configName={componentConfig.name}
            component={Component}
            componentProps={componentProps}
          >
            <Component />
          </VoltronAttributeContainer>
        </ErrorBoundary>
      );

    if (isRoot) {
      // 新开预览页需撑满屏幕
      return (
        <Page pageWidth={editorStore.pageWidth} mode={editorStore.mode}>
          {tpl}
        </Page>
      );
    }
    return cloneElement(tpl, { compid: componentId });
  }

  function render() {
    try {
      // Dangerous: 这里强制根据当前选择的组件库进行国际化配置，不是很合理，除非修改创建页面的规则，从一开始就固定组件库
      return <I18NWrapper>{recursivelyRenderTemplate(dsl.child, true, true)}</I18NWrapper>;
    } catch (e) {
      console.error('render: ', e);
      return <div>渲染存在异常，已终止</div>;
    }
  }

  const I18NWrapper = useMemo(() => {
    const providerDict = {
      antd: {
        ConfigProvider: AntdConfigProvider,
        locale: antdZhCN
      },
    };
    const { ConfigProvider, locale } = providerDict[editorStore.selectedComponentLib];
    if (!ConfigProvider) {
      return ({ children }) => {
        return children;
      };
    }
    const Wrapper = ({ children }) => {
      return <ConfigProvider locale={locale}>{children}</ConfigProvider>;
    };
    Wrapper.displayName = 'I18NWrapper';
    return Wrapper;
  }, [editorStore.selectedComponentLib]);

  function generateVoltronAttributes(
    componentSchema: IComponentSchema,
    componentConfig: IComponentConfig,
    componentProps: any
  ) {
    const { id, feature } = componentSchema;
    const voltronAttributes: Partial<VoltronAttributes> = {};
    voltronAttributes.voltronId = id;
    voltronAttributes.voltronComponent = componentConfig.name || componentConfig.callingName;
    voltronAttributes.voltronFeature = feature;
    voltronAttributes.voltronIsLayer = !!componentConfig?.isLayer;

    if (['root', 'slot', 'container'].includes(feature)) {
      voltronAttributes.voltronDroppable = true;
    }
    if (feature === 'root' || feature === 'slot') {
      voltronAttributes.voltronDirection = 'vertical';
    } else if (feature === 'container') {
      if (componentProps.style?.flexDirection === 'column') {
        voltronAttributes.voltronDirection = 'vertical';
      } else {
        voltronAttributes.voltronDirection = 'horizontal';
      }
    }
    return voltronAttributes;
  }

  return dsl ? (
    <ErrorBoundary fallback={<div>渲染存在异常，已终止</div>}>{render()}</ErrorBoundary>
  ) : (
    <div>未获得有效的DSL</div>
  );
});

PageRenderer.displayName = 'PageRenderer';

export default PageRenderer;
