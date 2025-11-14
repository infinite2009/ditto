import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import styles from './index.module.less';

export interface IIframeDragOverlayProps {
  left: number;
  top: number;
}

export default function IframeDragOverlay({ top, left }: IIframeDragOverlayProps) {
  const coordinates = useMemo(() => {
    const buffer = 4;
    const width = 134;
    const height = 45;

    return {
      anchorTop: Math.min(Math.max(0, top), window.innerHeight - buffer),
      anchorLeft: Math.min(Math.max(0, left), window.innerWidth - buffer),
      placeholderTop: window.innerHeight - height - buffer - top > 3 ? 3 : -height,
      placeholderLeft: window.innerWidth - width - buffer - left > 3 ? 3 : -width
    };
  }, [top, left]);

  return createPortal(
    <div
      className={styles.dragOverlay}
      style={{ transform: `translate(${coordinates.anchorLeft}px, ${coordinates.anchorTop}px)` }}
    >
      <div className={styles.dragOverlayAnchor} />
      <div
        className={styles.componentPlaceholder}
        style={{ top: coordinates.placeholderTop, left: coordinates.placeholderLeft }}
      />
    </div>,
    document.body
  );
}
