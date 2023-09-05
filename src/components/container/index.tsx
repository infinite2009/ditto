import { CSSProperties, ReactNode, useMemo } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';

export interface IContainerProps {
  style: CSSProperties;
  children: ReactNode[];
}

export default function Container({ children, style }: IContainerProps) {
  const inlineStyle: CSSProperties = useMemo(() => {
    return {
      display: 'flex',
      ...style,
      backgroundColor: children?.length ? style.backgroundColor : '#eee'
    };
  }, [style, children]);

  const classes = useMemo(() => {
    return classNames({
      [styles.rowWithoutChildren]: (style.flexDirection as string) === 'column',
      [styles.columnWithoutChildren]: (style.flexDirection as string) === 'row'
    });
  }, [children]);

  function renderChildren() {
    if (children?.length) {
      return children;
    }
    return <div className={classes}>请拖入任意元素</div>;
  }

  return <div style={inlineStyle}>{renderChildren()}</div>;
}
