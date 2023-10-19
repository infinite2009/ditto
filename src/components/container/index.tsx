import { ReactNode, useMemo } from 'react';

import styles from './index.module.less';
import classNames from 'classnames';
import { Flex } from 'antd';

export interface IContainerProps {
  // style: CSSProperties;
  children: ReactNode[];
  vertical: boolean;
  wrap: 'nowrap' | 'wrap';
  align: 'start' | 'center' | 'end' | 'stretch';
  justify: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch';
  gap: number;
}

export default function Container({ children, vertical = true, gap = 8 }: IContainerProps) {
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
    <Flex vertical={vertical} gap={gap}>
      {renderChildren()}
    </Flex>
  );
}
