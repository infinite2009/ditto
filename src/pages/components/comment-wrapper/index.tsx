import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import { ReactNode, useContext, useLayoutEffect, useRef } from 'react';

import styles from './index.module.less';
import DbStore from '@/service/db-store';

export interface ICommentWrapperProps {
  componentId: string;
  children: ReactNode;
}

const CommentWrapper = observer(({ componentId, children }: ICommentWrapperProps) => {
  const containerRef = useRef<any>(null);

  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      editorStore.setComponentPosition(componentId, {
        top: rect.top,
        left: rect.left
      });
    }
    fetchComment();
  }, []);

  async function fetchComment() {
    const commentData = await DbStore.selectComment({
      dslId: dslStore.dsl.id,
      componentId
    });
  }

  function showComment(e: { stopPropagation: () => void; pageY: number; pageX: number }) {
    e.stopPropagation();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      editorStore.setCommentPosition({
        top: Math.abs(e.pageY - rect.top),
        left: Math.abs(e.pageX - rect.left)
      });
      editorStore.setComponentIdForComment(componentId);
      editorStore.showComment();
    }
  }

  return (
    <div ref={containerRef} className={styles.commentWrapper} onClick={showComment}>
      {children}
    </div>
  );
});

export default CommentWrapper;
