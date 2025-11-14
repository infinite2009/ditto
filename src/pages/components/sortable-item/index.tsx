import React, { CSSProperties, ReactNode } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import customFormStyle from '@/pages/components/index.module.less';
import { Draggable } from '@/components/icon';

export interface ISortableFormItem {
  id: string;
  children: ReactNode;
  footer?: ReactNode;
  style?: CSSProperties;
  styles?: {
    header?: CSSProperties;
    dragItem?: CSSProperties;
  };
  dragAlign?: 'left' | 'right';
}

export default function SortableItem({ id, children, footer = null, style, styles = {}, dragAlign = 'left' }: ISortableFormItem) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const innerStyle = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={innerStyle}>
      <div className={customFormStyle.draggableFromItem} style={style}>
        <div className={customFormStyle.header} style={styles?.header}>
          {dragAlign === 'left' && <>
            <Draggable className={customFormStyle.draggableIcon} style={styles?.dragItem} {...attributes} {...listeners} />
            {children}
          </>}
          {dragAlign === 'right' && <>
            {children}
            <Draggable className={customFormStyle.draggableIcon} style={styles?.dragItem} {...attributes} {...listeners} />
          </>}

        </div>
        {footer}
      </div>
    </div>
  );
}
