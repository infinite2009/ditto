import React, { FC, PropsWithChildren, useEffect } from 'react';
import IPropsSchema, { TemplateKeyPathsReg } from '@/types/props.schema';
import IComponentSchema from '@/types/component.schema';
import { fetchComponentConfig, generateSlotId, typeOf } from '@/util';
import cloneDeep from 'lodash/cloneDeep';
import EditWrapper from '@/pages/editor/edit-wrapper';
import ComponentFeature from '@/types/component-feature';
import DSLStore from '../../../service/dsl-store';
import { observer } from 'mobx-react-lite';
import IComponentConfig from '@/types/component-config';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { nanoid } from 'nanoid';
import { TemplateInfo } from '@/types';
import { toJS } from 'mobx';

export interface IPageRendererProps {
  mode?: 'edit' | 'preview';
  dslStore: DSLStore;
}

export default observer((props: IPageRendererProps) => {
  if (!props) {
    return null;
  }

  const { mode = 'preview', dslStore } = props;

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
    // 未防止 dsl props 部分被修改，导致渲染出问题，这里选择深拷贝
    const valueCopy = cloneDeep(value);
    // 使用 wrapper 的原因是要能够拿到 cp 的引用，cp 可能会被完全替换为一个新对象，而 convertTemplateInfo 不能返回新对象。
    const wrapper = { valueCopy };
    if (valueSource === 'editorInput') {
      if (templateKeyPathsReg?.length) {
        // data: undefined,
        // keyPathRegs: [],
        // parent: undefined,
        // key: '',
        // currentKeyPath: '',
        // nodeId: undefined
        convertTemplateInfo({
          data: valueCopy,
          keyPathRegs: templateKeyPathsReg,
          parent: wrapper,
          key: 'valueCopy',
          currentKeyPath: '',
          nodeId: nodeId
        });
      }
    }
    return wrapper.valueCopy;
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
          // data: undefined,
          // keyPathRegs: [],
          // parent: undefined,
          // key: '',
          // currentKeyPath: '',
          // nodeId: undefined
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
    const node = dslStore.dsl.componentIndexes[nodeRef.current];

    // 处理组件
    const { props = {} } = dslStore.dsl;
    const {
      parentId,
      configName,
      callingName,
      name,
      dependency,
      children = [],
      propsRefs = [],
      id
    } = node as IComponentSchema;
    let Component: string | FC<PropsWithChildren<any>> = callingName || name;
    let componentConfig: IComponentConfig | undefined;
    if (dependency) {
      componentConfig = fetchComponentConfig(configName || name, dependency);
    }
    if (componentConfig) {
      Component = componentConfig.component;
    }
    const componentProps = props[id] ? extractProps(props[id], propsRefs, id) : {};
    const childrenTemplate = children.map(c => (c.isText ? c.current : recursivelyRenderTemplate(c)));

    const childrenId = children.filter(c => !c.isText).map(c => c.current);

    let rootProps = {};
    if (isRoot) {
      rootProps = {
        id,
        childrenId,
        parentId: dslStore.dsl.id
      };
    }

    const tpl = (
      <Component key={id} {...componentProps} {...rootProps}>
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
      <EditWrapper key={id} id={id} parentId={parentId} childrenId={childrenId} feature={feature}>
        {tpl}
      </EditWrapper>
    ) : (
      tpl
    );
  }

  function render() {
    const { child } = toJS(dslStore.dsl);
    return recursivelyRenderTemplate(child, true, true);
  }

  // 为什么加上这句，就可以让表格插槽重绘？
  // console.log(toJS(dslStore.dsl));

  return dslStore.dsl ? <>{render()}</> : <div>未获得有效的DSL</div>;
});
