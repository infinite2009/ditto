import { memoizeWith } from 'ramda';
import { useMemo } from 'react';

export interface CreateListComponentParams<T> {
  /** 组件的名称 */
  componentName: string;
  /** 获取列表长度的函数 */
  useLength: () => number;
  /** 获取列表的函数 */
  getList: () => T[];
  /** 获取列表项的 key 的函数 */
  getKey: (item: T) => string;
  /** 渲染列表项的函数 */
  renderItem: (item: T) => React.ReactNode;
}

/**
 * 创建一个列表组件，组件的子元素是根据列表项的 key 缓存的
 */
export function createListComponentWithLength<T>({
  componentName,
  useLength,
  getList,
  getKey,
  renderItem
}: CreateListComponentParams<T>) {
  function Component() {
    const propsLen = useLength();
    const propsForms = useMemo(() => getList().map(mapItem), [propsLen]);
    return propsForms;
  }
  const mapItem = memoizeWith(getKey, renderItem);
  Component.displayName = componentName;
  return Component;
}
