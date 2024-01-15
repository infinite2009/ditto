import { CSSProperties, ReactNode, useContext, useMemo } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';
import { useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';
import { Flex } from 'antd';
import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';
import { FlexProps } from 'antd/lib';

export interface IPageRootProps extends FlexProps {
  children: ReactNode[];
  childrenId: string[];
  id: string;
  pageWidth?: number;
  parentId: string;
  scale?: number;
}

class DslStore {}

export default observer(function PageRoot({
  id,
  childrenId,
  parentId,
  children,
  scale = 100,
  pageWidth,
  justify,
  align,
  gap,
  style
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
      <Flex vertical justify={justify} align={align} gap={gap} style={style}>
        {children}
      </Flex>
    </div>
  );
});
