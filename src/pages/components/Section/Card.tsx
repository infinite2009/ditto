import React from 'react';
import { HolderOutlined, MinusOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import isNull from 'lodash/isNull';
import styles from './index.module.less';

export interface CardProps {
  title: string;
  /**
   * 传入后，会开启拖拽排序功能
   * 如果传入的是数字，必须大于 0，否则无法拖拽
   */
  sortableId?: string | number;
  onRemove?: () => void;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = props => {
  const { sortableId, title, children, onRemove } = props;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: sortableId });

  return (
    <div
      className={styles['card']}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      <div className={styles['header']}>
        {!isNull(sortableId) ? (
          <HolderOutlined className={styles['drag-handle']} {...attributes} {...listeners} />
        ) : null}
        <span className={styles['title']}>{title}</span>
        <MinusOutlined onClick={onRemove} />
      </div>
      {children}
    </div>
  );
};

export default Card;
