import { ReactNode, useMemo } from 'react';

import styles from './index.module.less';
import classNames from 'classnames';
import { Flex } from 'antd';

export interface IContainerProps {
  // style: CSSProperties;
  children: ReactNode[];
  vertical: boolean;
  wrap: 'nowrap' | 'wrap';
  align: 'normal' | 'start' | 'center' | 'end' | 'stretch';
  justify: 'normal' | 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch';
  gap: number;
}

export default function Container({ children, vertical, gap, wrap, justify, align }: IContainerProps) {
  const classes = useMemo(() => {
    return classNames({
      [styles.rowWithoutChildren]: !vertical,
      [styles.columnWithoutChildren]: vertical
    });
  }, [children]);

  function renderChildren() {
    if (children?.length) {
      return children;
    }
    return <div className={classes}>请拖入任意元素</div>;
  }

  return (
    <Flex vertical={vertical} gap={gap} wrap={wrap} justify={justify} align={align} style={{ padding: 8 }}>
      {renderChildren()}
    </Flex>
  );
}
