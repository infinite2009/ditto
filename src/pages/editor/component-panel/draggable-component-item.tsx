import { CSSProperties, MouseEvent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react';
import { EditorStoreContext } from '@/hooks/context';

export interface IDraggableComponentItemProps {
  children: ReactNode;
  dependency: string;
  isLayer?: boolean;
  name: string;
  title: string;
}

export default observer(function DraggableComponentItem({
  name,
  title,
  dependency,
  children,
  isLayer = false
}: IDraggableComponentItemProps) {
  const editorStore = useContext(EditorStoreContext);

  const style: CSSProperties = {
    opacity: editorStore.componentDraggingInfo?.name === name && editorStore.componentDraggingInfo?.dependency === dependency ? 0.5 : 1,
    transition: 'border 0.5s ease-in-out',
    boxSizing: 'border-box'
  };

  function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) {
      return;
    }
    e.preventDefault();
    console.log('set');
    editorStore.setComponentDraggingInfo({
      name,
      dndType: 'insert',
      title,
      isLayer,
      dependency,
      top: e.clientY,
      left: e.clientX,
      initialTop: e.clientY,
      initialLeft: e.clientX,
      isMoving: false,
      isInCanvas: false
    });
  }

  return children ? (
    <div onMouseDown={handleMouseDown} style={style}>
      {children}
    </div>
  ) : null;
});
