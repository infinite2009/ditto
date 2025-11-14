import { ReactNode, useContext, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';
import { observer } from 'mobx-react';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';

import styles from './index.module.less';

export interface IPageRootProps {
  children?: ReactNode[];
  childrenId?: string[];
  id?: string;
  parentId?: string;
  setNode?: (node: HTMLElement) => void;
}

export default observer(function PageRootWrapper({
  id,
  childrenId,
  parentId,
  children,
  setNode
}: IPageRootProps) {
  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);

  const { isOver, setNodeRef, node } = useDroppable({
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
      [styles.withoutChildren]: dslStore.isEmpty,
      [styles.pageRootWrapper]: true,
      [styles.outline]: isOver,
      [styles.showOutline]: isParentOfSelected()
    });
  }, [children, id, dslStore?.selectedComponent?.id]);

  function handleSelecting(e) {
    e.stopPropagation();
    dslStore.selectComponent(id);
    editorStore.clearComponentIdForComment();
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

  useEffect(() => {
    setNode?.(node.current);
  }, []);

  useEffect(() => {
    editorStore.setPageRootWrapperRef(node.current);
    dslStore.setComponentsIsRenderedMap(id);
  }, [id, parentId]);

  return (
    <div className={classes} id="pageMain" ref={setNodeRef} onClick={handleSelecting}>
      {children}
    </div>
  );
});
