import {useCombinedRefs} from '@dnd-kit/utilities';
import React, {CSSProperties} from 'react';
import {useDraggable, useDroppable} from '@dnd-kit/core';

export interface IEditorProps {
  id: string;
  childrenId?: string[];
  children: React.ReactNode;
  direction?: 'row' | 'column';
}

export default function EditWrapper({
  id,
  childrenId,
  children,
  direction = 'column',
}: IEditorProps) {
  const {isOver, setNodeRef: setDroppableNodeRef} = useDroppable({
    id,
    data: {
      childrenId,
      direction: direction || 'column',
    },
  });
  const {
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
  } = useDraggable({
    id,
    data: {
      childrenId,
    },
  });
  const setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);

  const style: CSSProperties = {
    // transform: CSS.Transform.toString(transform),
    // cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    outline: isOver ? '2px solid #7193f1' : undefined,
    transition: 'border 0.5s ease-in-out',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: direction || 'column',
    margin: 10
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </div>
  );
}
