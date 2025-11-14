import { CSSProperties, MouseEvent, ReactNode, useContext } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { observer } from 'mobx-react';
import { EditorStoreContext } from '@/hooks/context';

export interface IDraggableFavoriteComponentItemProps {
  name: string;
  isLayer?: boolean;
  children: ReactNode;
  dsl: any;
  dependency?: string;
}

export default observer(function DraggableFavoriteComponentItem({
  name,
  dsl,
  children,
  dependency = '',
  isLayer = false
}: IDraggableFavoriteComponentItemProps) {
  const editorStore = useContext(EditorStoreContext);
  let timeoutId: NodeJS.Timeout;
  const style: CSSProperties = {
    opacity:
      editorStore.componentDraggingInfo?.name === name && editorStore.componentDraggingInfo?.dependency === dependency
        ? 0.5
        : 1,
    transition: 'border 0.5s ease-in-out',
    boxSizing: 'border-box'
  };

  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    clearTimeout(timeoutId);
    if (e.button !== 0) {
      return;
    }
    // e.preventDefault();
    timeoutId = setTimeout(() => {
      editorStore.setComponentDraggingInfo({
        name,
        dndType: 'insertFragment',
        title: dsl,
        isLayer,
        dependency,
        top: e.clientY,
        left: e.clientX,
        initialTop: e.clientY,
        initialLeft: e.clientX,
        isMoving: false,
        isInCanvas: false
      });
    }, 80);
  }

  return children ? (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={() => {
        clearTimeout(timeoutId);
      }}
      style={style}
    >
      {children}
    </div>
  ) : null;
});
