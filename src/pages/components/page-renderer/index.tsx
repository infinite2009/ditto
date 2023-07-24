import React from 'react';
import IPageSchema from '@/types/page.schema';
import componentConfig from '@/data/component-dict';
import IPropsSchema from '@/types/props.schema';
import IComponentSchema from '@/types/component.schema';
import { typeOf } from '@/util';
import cloneDeep from 'lodash/cloneDeep';

export interface IPageRendererProps {
  dsl: IPageSchema;
  mode?: 'edit' | 'preview';
}

export default function PageRenderer(props: IPageRendererProps) {
  if (!props) {
    return null;
  }
  const { dsl, mode = 'preview' } = props;

  function fetchComponent(name: string, dependency: string) {
    if (!dependency) {
      return name;
    }
    return componentConfig[dependency][name].component;
  }

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
        parent[key] = recursivelyRenderTemplate(data);
      } else {
        parent[key] = () => {
          return recursivelyRenderTemplate(data);
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

  function recursivelyRenderTemplate(node: IComponentSchema | string) {
    // 判断节点的类型
    const nodeType = typeOf(node);
    // 如果是字符串类型，直接返回，它不会有子节点了
    if (nodeType === 'string') {
      return node as string;
    }

    // 处理组件
    const { props } = dsl;
    const { callingName, name, dependency, children = [], propsRefs = [], id } = node as IComponentSchema;
    const Component = fetchComponent(callingName || name, dependency);
    const componentProps = props[id] ? extractProps(props[id], propsRefs) : {};
    let childrenTemplate = null;
    if (children.length) {
      childrenTemplate = children.map(c => recursivelyRenderTemplate(c));
    }
    return (
      <Component key={id} {...(componentProps as any)}>
        {childrenTemplate}
      </Component>
    );
  }

  return dsl ? <div>{recursivelyRenderTemplate(dsl.child)}</div> : null;
}
