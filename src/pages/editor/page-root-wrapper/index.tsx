import { CSSProperties, ReactNode, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';
import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';

import styles from './index.module.less';

export interface IPageRootProps {
  children?: ReactNode[];
  childrenId?: string[];
  id?: string;
  pageWidth?: number;
  parentId?: string;
  scale?: number;
}
export default observer(function PageRoot({
  id,
  childrenId,
  parentId,
  children,
  scale = 100,
  pageWidth
}: IPageRootProps) {
  const dslStore = useContext(DSLStoreContext);

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
      [styles.outline]: isOver,
      [styles.selected]: id === dslStore?.selectedComponent?.id,
      [styles.showOutline]: isParentOfSelected()
    });
  }, [children, id, dslStore?.selectedComponent?.id]);

  const composedStyle: CSSProperties = useMemo(() => {
    return {
      transform: `scale(${scale / 100}) `,
      transformOrigin: 'top left',
      width: pageWidth === 0 ? 'initial' : pageWidth,
      margin: pageWidth === 0 ? '0' : '0 auto'
    };
  }, [scale, pageWidth]);

  function handleSelecting(e) {
    e.stopPropagation();
    dslStore.selectComponent(id);
  }

  function isParentOfSelected() {
    const selected = dslStore.selectedComponent;
    if (!selected) {
      return false;
    }
    const parentId = selected.parentId;
    if (!parentId) {
      return false;
    }
    return parentId === id;
  }

  return (
    <div className={classes} ref={setNodeRef} style={composedStyle} onClick={handleSelecting}>
      {children}
    </div>
  );
});
