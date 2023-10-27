import { CSSProperties, ReactNode, useMemo } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';
import { useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';
import { Flex } from 'antd';

export interface IPageRootProps {
  id: string;
  childrenId: string[];
  parentId: string;
  children: ReactNode[];
  scale?: number;
}

export default function PageRoot({ id, childrenId, parentId, children, scale = 1 }: IPageRootProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      childrenId,
      parentId,
      vertical: true,
      feature: ComponentFeature.slot,
      dndType: 'root'
    }
  });

  const classes = useMemo(() => {
    return classNames({
      [styles.withoutChildren]: !children?.length,
      [styles.main]: true,
      [styles.outline]: isOver
    });
  }, [children]);

  const composedStyle: CSSProperties = useMemo(() => {
    return { transform: `scale(${scale})`, transformOrigin: 'top left' };
  }, [scale]);

  return (
    <div className={classes} ref={setNodeRef} style={composedStyle}>
      <Flex vertical>{children}</Flex>
    </div>
  );
}
