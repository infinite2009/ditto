import React, { FC, PropsWithChildren, useContext } from 'react';
import IPropsSchema from '@/types/props.schema';
import IComponentSchema from '@/types/component.schema';
import { fetchComponentConfig, typeOf } from '@/util';
import cloneDeep from 'lodash/cloneDeep';
import EditWrapper from '@/pages/editor/edit-wrapper';
import ComponentFeature from '@/types/component-feature';
import DSLStore from '../../../service/dsl-store';
import { observer } from 'mobx-react-lite';
import IComponentConfig from '@/types/component-config';

export interface IPageRendererProps {
  mode?: 'edit' | 'preview';
  dslStore: DSLStore;
}

export default observer((props: IPageRendererProps) => {
  if (!props) {
    return null;
  }

  const { mode = 'preview', dslStore } = props;

  function extractProps(propsDict: { [key: string]: IPropsSchema }, propsRefs: string[]) {
    const result: { [key: string]: any } = {};
    propsRefs.forEach(ref => {
      const propsSchema = propsDict[ref];
      if (propsSchema) {
        result[ref] = extractSingleProp(propsSchema);
      }
    });
    return result;
  }

  function extractSingleProp(propsSchema: IPropsSchema): any {
    const { templateKeyPathsReg, name, valueType, value, valueSource } = propsSchema;
    // 未防止 dsl props 部分被修改，导致渲染出问题，这里选择深拷贝
    const valueCopy = cloneDeep(value);
    // 使用 wrapper 的原因是要能够拿到 cp 的引用，cp 可能会被完全替换为一个新对象，而 convertTemplateInfo 不能反悔新对象。
    const wrapper = { valueCopy };
    if (valueSource === 'editorInput') {
      if (templateKeyPathsReg?.length) {
        convertTemplateInfo(valueCopy, templateKeyPathsReg, wrapper, 'valueCopy');
      }
    }
    return wrapper.valueCopy;
  }

  /*
   * 把模板信息转换为 tsx
   */
  function convertTemplateInfo(
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
      if (keyPathMatchResult.type === 'object') {
        parent[key] = recursivelyRenderTemplate(data, true);
      } else {
        parent[key] = () => {
          return recursivelyRenderTemplate(data, true);
        };
      }
    } else {
      const type = typeOf(data);
      if (type === 'object') {
        Object.entries(data).forEach(([key, val]) => {
          convertTemplateInfo(
            val,
            keyPathRegs,
            data,
            key,
            `${currentKeyPath ? currentKeyPath + '.' : currentKeyPath}${key}`
          );
        });
      } else if (type === 'array') {
        data.forEach((item: any, index: number) => {
          convertTemplateInfo(item, keyPathRegs, data, index.toString(), `${currentKeyPath}[${index}]`);
        });
      }
    }
  }

  /**
   *
   * @param node
   * @param isSlot 当前组件是否是一个插槽
   */
  function recursivelyRenderTemplate(node: IComponentSchema | string, isSlot = false) {
    // 判断节点的类型
    const nodeType = typeOf(node);
    // 如果是字符串类型，直接返回，它不会有子节点了
    if (nodeType === 'string') {
      return node as string;
    }

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
    const componentProps = props[id] ? extractProps(props[id], propsRefs) : {};
    let childrenTemplate = null;

    const typeOfChildren = typeOf(children);

    if (typeOfChildren === 'array' && children.length) {
      childrenTemplate = (children as IComponentSchema[]).map(c =>
        recursivelyRenderTemplate(c, !componentConfig?.isContainer)
      );
    } else if (typeOfChildren === 'string') {
      childrenTemplate = children;
    }

    const tpl = (
      <Component key={id} {...componentProps}>
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

    const childId = typeOfChildren === 'array' ? (children as IComponentSchema[])?.map(c => c.id) || [] : undefined;
    return mode === 'edit' ? (
      <EditWrapper key={id} id={id} parentId={parentId} childrenId={childId} feature={feature}>
        {tpl}
      </EditWrapper>
    ) : (
      tpl
    );
  }

  return dslStore.dsl ? <div>{recursivelyRenderTemplate(dslStore.dsl.child, true)}</div> : <div>未获得有效的DSL</div>;
});
