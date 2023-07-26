import { DragSourceMonitor, useDrag } from 'react-dnd';
import { ReactNode } from 'react';
import { message } from 'antd';

export interface IDraggableComponentItemProps {
  name: string;
  children: ReactNode;
}

interface DropResult {
  allowedDropEffect: string;
  dropEffect: string;
  name: string;
}

export default function DraggableComponentItem({ name, children }: IDraggableComponentItemProps) {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: 'component',
      item: { name },
      end(item, monitor) {
        const dropResult = monitor.getDropResult() as DropResult;
        if (item && dropResult) {
          message.success(`拖入组件: ${name} 至 ${dropResult.name}成功！`);
        }
      },
      collect: (monitor: DragSourceMonitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1
      })
    })
  );

  return children ? (
    <div draggable={true} ref={drag} style={{ opacity }}>
      {children}
    </div>
  ) : null;
}
