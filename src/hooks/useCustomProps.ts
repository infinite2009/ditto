import { useMemo } from 'react';

/**
 * 为组件添加自定义属性(data)
 *
 * @param props 含有自定义属性的 props 对象
 * @param prefix 自定义属性前缀，默认是 data-
 */
export default function useCustomProps(props: Record<string, any>, prefix = 'data-') {
  return useMemo(() => {
    const result = { };
    for (const key in props) {
      if (key.startsWith(prefix)) {
        result[key] = props[key];
      }
    }
    result['key'] = props.key;
    return result;
  }, [props]);
}