import React from 'react';
import IPageSchema from '@/types/page.schema';
import componentConfig from '@/data/component-dict';
import IPropsSchema from '@/types/props.schema';
import IComponentSchema from '@/types/component.schema';
import { typeOf } from '@/util';

export interface IPageRendererProps {
  dsl: IPageSchema;
}

export default function PageRenderer({ dsl }: IPageRendererProps) {
  function fetchComponent(name: string, dependency: string) {
    if (!dependency) {
      return name;
    }
    return componentConfig[dependency][name].component;
  }

  function extractProps(propsRefs: string[]) {
    return {};
  }

  function recursivelyRenderTemplate(node: IComponentSchema | string) {
    // 判断节点的类型
    const nodeType = typeOf(node);
    // 如果是字符串类型，直接返回，它不会有子节点了
    if (nodeType === 'string') {
      return node as string;
    }

    // 处理组件
    const { callingName, name, dependency, children = [], propsRefs = [] } = node as IComponentSchema;
    const Component = fetchComponent(callingName || name, dependency);
    const componentProps = extractProps(propsRefs);
    let childrenTemplate = null;
    if (children.length) {
      childrenTemplate = children.map(c => recursivelyRenderTemplate(c));
    }
    return <Component {...(componentProps as any)}>{childrenTemplate}</Component>;
  }

  return <div>{recursivelyRenderTemplate(dsl.child)}</div>;
}
