import { CSSProperties } from 'react';

export interface IProcessBFC {
  id: string;
  childrenStyle: CSSProperties;
  isDragging?: boolean;
}

export function processBFC({ id, childrenStyle, isDragging }: IProcessBFC): CSSProperties {
  const result: CSSProperties = {};
  const styleNames: (keyof CSSProperties)[] = [
    'display',
    // 'height',
    // 'width',
    // 'maxWidth',
    // 'maxHeight',
    // 'minWidth',
    // 'minHeight',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'inset',
    'flexGrow',
    'flexShrink',
    'alignSelf',
    'flex',
  ];

  // const childStyleNames: (keyof CSSProperties)[] = [
  // ];
  // const childStyleNamesWithUnit: (keyof CSSProperties)[] = [
  //   'columnGap',
  // ];
  styleNames.forEach(name => {
    if (childrenStyle?.[name] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result[name] = childrenStyle[name];
    }
  });

  const wrapperElement = document.getElementById(id);
  if (!wrapperElement) {
    return result;
  }
  const childElement: HTMLElement = wrapperElement.children?.[0] as HTMLElement;
  if (!childElement) {
    return result;
  }

  // childStyleNames.forEach((name) => {
  //   if (childrenStyle?.[name] !== undefined) {
  //     childElement.style[name] = childrenStyle?.[name];
  //   }
  // });

  // childStyleNamesWithUnit.forEach((name) => {
  //   if (childrenStyle?.[name] !== undefined) {
  //     childElement.style[name] = `${childrenStyle?.[name]}px`;
  //   }
  // });


  const computedChildStyle = getComputedStyle(childElement);

  // const marginStyleNames: (keyof CSSProperties)[] = [
  //   'margin',
  //   'marginTop',
  //   'marginRight',
  //   'marginBottom',
  //   'marginLeft'
  // ];
  // marginStyleNames.forEach(name => {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   // @ts-ignore
  //   if (result[name] === undefined && computedChildStyle[name] !== '') {
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     result[name] = computedChildStyle[name];
  //   }
  // });
  // childElement.style.margin = '0px';

  if (!result.display) {
    const display = computedChildStyle.getPropertyValue('display');
    const width = computedChildStyle.getPropertyValue('width');
    const flexBasis = childElement.style.flexBasis;
    const flexReg = /^-?\d+(\.\d+)?$/;
    switch (display) {
      case 'block':
        // 如果有具体宽度
        if (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && flexReg.test(width)) {
          result.display = 'inline-block';
        } else {
          result.display = 'block';
        }
        break;
      case 'flex':
        if (
          (flexBasis.indexOf('px') !== -1 && flexBasis.indexOf('%') !== -1 && flexReg.test(flexBasis)) ||
          (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && flexReg.test(width))
        ) {
          result.display = 'inline-block';
        } else {
          result.display = 'block';
        }
        break;
      default:
        result.display = display || 'inline-block';
        // if (result.display === 'inline-block') {
        //   result.width = '100%';
        // }
        break;
    }
  }

  if (result.display === 'flex') {
    // 父容器
    result.display = 'block';
    childElement.style.flexGrow = '1';
    childElement.style.alignItems = childrenStyle.alignItems;
  }

  // if (result.display === 'inline') {
  // TODO: sky - avatar组件宽度不能设置100%，会导致设置size后的宽度不生效，这里先注释掉
  // childElement.style.width = '100%';
  // childElement.style.height = '100%';

  // childElement.style.maxWidth = '100%';
  // childElement.style.maxHeight = '100%';
  // childElement.style.minWidth = '0%';
  // childElement.style.minHeight = '0%';
  // }

  // 处理定位问题
  if (!result.position) {
    if (childElement.style.position === 'absolute') {
      result.position = childElement.style.position;
    }
  }
  if (!result.top && childElement.style.top !== '') {
    result.top = childElement.style.top;
    childElement.style.top = '0px';
  }

  if (!result.right && childElement.style.right !== '') {
    result.right = childElement.style.right;
    childElement.style.right = '0px';
  }

  if (!result.bottom && childElement.style.bottom !== '') {
    result.bottom = childElement.style.bottom;
    childElement.style.bottom = '0px';
  }

  if (!result.left && childElement.style.left !== '') {
    result.left = childElement.style.left;
    childElement.style.left = '0px';
  }

  return {
    opacity: isDragging ? 0.5 : 1,
    ...result
  } as CSSProperties;
}
