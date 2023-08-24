import { useCombinedRefs } from '@dnd-kit/utilities';
import React, { CSSProperties } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import styles from './index.module.less';
import ComponentFeature from '@/types/component-feature';

export interface IEditorProps {
  id: string;
  childrenId?: string[];
  children: React.ReactNode;
  direction?: 'row' | 'column';
  type?: ComponentFeature;
}

export default function EditWrapper({ id, childrenId, children, direction = 'column', type = ComponentFeature.solid }: IEditorProps) {
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id,
    data: {
      childrenId,
      direction: direction || 'column'
    }
  });
  const {
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging
  } = useDraggable({
    id,
    data: {
      childrenId
    }
  });

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

  let setNodeRef;
  switch (type) {
    case ComponentFeature.slot:
      setNodeRef = setDroppableNodeRef;
      style.backgroundColor = '#4f0';
      break;
    case ComponentFeature.container:
      setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
      style.backgroundColor = '#fa0';
      break;
    default:
      setNodeRef = setDraggableNodeRef;
      style.backgroundColor = '#0ff';
      break;
  }

  return (
    <div className={styles.main} ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </div>
  );
}
