import classnames from 'classnames';

/**
 * 自动处理 CSS Module 类名的组合
 * @param styles CSS Module 的 styles 对象
 * @param classNames 类名数组或对象
 * @returns 组合后的类名字符串
 */
export function withClassName(styles: Record<string, string>) {
  return (...classNames: (string | { [key: string]: boolean })[]) => {
    const processedClassNames = classNames.map(className => {
      if (typeof className === 'string') {
        return styles[className];
      }
      if (typeof className === 'object') {
        const result: { [key: string]: boolean } = {};
        Object.entries(className).forEach(([key, value]) => {
          if (styles[key]) {
            result[styles[key]] = value;
          }
        });
        return result;
      }
      return className;
    });

    return classnames(...processedClassNames);
  };
}
