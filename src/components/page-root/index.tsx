import { CSSProperties, ReactNode, useMemo } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';
import { observer } from 'mobx-react-lite';

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
      dndType: 'move'
    }
  });

  const classes = useMemo(() => {
    return classNames({
      [styles.withoutChildren]: !children?.length,
      [styles.main]: true
      // [styles.outline]: isOver
    });
  }, [children]);

  console.log('isOver', isOver);

  return (
    <div>
      <div ref={setNodeRef}>{children}</div>
    </div>
  );
}
