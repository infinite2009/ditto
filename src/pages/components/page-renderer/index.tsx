import React, { FC, PropsWithChildren, useContext } from 'react';
import IPropsSchema from '@/types/props.schema';
import IComponentSchema from '@/types/component.schema';
import { fetchComponentConfig, typeOf } from '@/util';
import cloneDeep from 'lodash/cloneDeep';
import EditWrapper from '@/pages/editor/edit-wrapper';
import ComponentFeature from '@/types/component-feature';
import DslProcessor from '@/service/dsl-process';
import { observer } from 'mobx-react-lite';

export interface IPageRendererProps {
  mode?: 'edit' | 'preview';
  dslStore: DslProcessor;
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
    const cp = cloneDeep(value);
    const wrapper = { cp };
    if (valueSource === 'editorInput') {
      if (templateKeyPathsReg?.length) {
        convertTemplateInfo(cp, templateKeyPathsReg, wrapper, 'cp');
      }
    }
    return wrapper.cp;
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
    const { callingName, name, dependency, children = [], propsRefs = [], id } = node as IComponentSchema;
    let Component: string | FC<PropsWithChildren<any>> = callingName || name;
    let componentConfig;
    if (dependency) {
      componentConfig = fetchComponentConfig(callingName || name, dependency);
    }
    if (componentConfig) {
      Component = componentConfig.component;
    }
    const componentProps = props[id] ? extractProps(props[id], propsRefs) : {};
    let childrenTemplate = null;
    if (children.length) {
      childrenTemplate = children.map(c => recursivelyRenderTemplate(c));
    }

    const tpl = (
      <Component key={id} {...componentProps}>
        {childrenTemplate}
      </Component>
    );
    let feature = ComponentFeature.solid;
    if (isSlot) {
      feature = ComponentFeature.slot;
    } else if (componentConfig?.isContainer) {
      feature = ComponentFeature.container;
    }

    const childId = children?.map(c => c.id);
    return mode === 'edit' ? <EditWrapper key={id} id={id} childrenId={childId} type={feature}>{tpl}</EditWrapper> : tpl;
  }

  return dslStore.dsl ? <div>{recursivelyRenderTemplate(dslStore.dsl.child, true)}</div> : <div>未获得有效的DSL</div>;
});
