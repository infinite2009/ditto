import { ReactNode, useMemo } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';
import { useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';

export interface IPageRootProps {
  id: string;
  childrenId: string[];
  parentId: string;
  children: ReactNode[];
}

export default function PageRoot({ id, childrenId, parentId, children }: IPageRootProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      childrenId,
      parentId,
      direction: 'column',
      feature: ComponentFeature.slot,
      dndType: 'root'
    }
  });

  console.log('page root id: ', id);

  const classes = useMemo(() => {
    return classNames({
      [styles.withoutChildren]: !children?.length,
      [styles.main]: true,
      [styles.outline]: isOver
    });
  }, [children]);

  return (
    <div className={classes} ref={setNodeRef}>
      {children}
    </div>
  );
}
