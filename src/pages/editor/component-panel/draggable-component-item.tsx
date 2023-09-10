import { CSSProperties, ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';

export interface IDraggableComponentItemProps {
  name: string;
  title: string;
  isLayer?: boolean;
  dependency: string;
  children: ReactNode;
}

export default function DraggableComponentItem({
  name,
  title,
  dependency,
  children,
  isLayer = false
}: IDraggableComponentItemProps) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: name,
    data: {
      dndType: 'insert',
      name,
      title,
      isLayer,
      dependency
    }
  });

  const style: CSSProperties = {
    // transform: CSS.Transform.toString(transform),
    // cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    transition: 'border 0.5s ease-in-out',
    boxSizing: 'border-box'
  };

  return children ? (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </div>
  ) : null;
}
