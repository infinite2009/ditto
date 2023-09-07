import { useCombinedRefs } from '@dnd-kit/utilities';
import React, { CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';

export interface IEditorProps {
  id: string;
  parentId: string;
  childrenId?: string[];
  children: React.ReactNode;
  direction?: 'row' | 'column';
  feature?: ComponentFeature;
}

export default function EditWrapper({ id, parentId, childrenId, children, feature }: IEditorProps) {
  const direction = useMemo(() => {
    const wrapperElement = document.getElementById(id);
    if (!wrapperElement) {
      return;
    }
    const childElement: HTMLElement = wrapperElement.children?.[0] as HTMLElement;
    return childElement.style.flexDirection;
  }, [children]);

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id,
    data: {
      childrenId,
      parentId,
      direction: direction || 'column',
      feature: feature || ComponentFeature.solid,
      dndType: 'move'
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

  const childrenProcessed = useRef<boolean>(false);

  useEffect(() => {
    const wrapperElement = document.getElementById(id);
    if (!wrapperElement) {
      return;
    }
    const childElement: HTMLElement = wrapperElement.children?.[0] as HTMLElement;
    if (!childrenProcessed.current) {
      processBFC(wrapperElement, childElement);
      childrenProcessed.current = true;
    }
  }, []);

  function processBFC(wrapperElement: HTMLElement, childElement: HTMLElement) {
    const display = childElement.style.display;
    const width = childElement.style.width;
    const flexBasis = childElement.style.flexBasis;
    const flexReg = /^-?\d+(\.\d+)?$/;
    switch (display) {
      case 'block':
      case 'initial':
      case '':
        // 如果有具体宽度
        if (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && flexReg.test(width)) {
          wrapperElement.style.display = 'inline-block';
        } else {
          wrapperElement.style.display = 'block';
        }
        break;
      case 'flex':
        if (
          (flexBasis.indexOf('px') !== -1 && flexBasis.indexOf('%') !== -1 && flexReg.test(flexBasis)) ||
          (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && flexReg.test(width))
        ) {
          wrapperElement.style.display = 'inline-block';
        } else {
          wrapperElement.style.display = 'block';
        }
        break;
      default:
        wrapperElement.style.display = 'inline';
        break;
    }

    // 处理定位问题
    if (childElement.style.position === 'absolute') {
      wrapperElement.style.position = childElement.style.position;
      wrapperElement.style.top = childElement.style.top;
      wrapperElement.style.right = childElement.style.right;
      wrapperElement.style.bottom = childElement.style.bottom;
      wrapperElement.style.left = childElement.style.left;
      wrapperElement.style.inset = childElement.style.inset;
      childElement.style.position = 'static';
    }

    // 处理margin
    wrapperElement.style.marginLeft = childElement.style.marginLeft;
    wrapperElement.style.marginRight = childElement.style.marginRight;
    childElement.style.marginLeft = '0px';
    childElement.style.marginRight = '0px';
  }

  const style: CSSProperties = useMemo(() => {
    let backgroundColor;
    switch (feature) {
      case ComponentFeature.slot:
        backgroundColor = '#4f0';
        break;
      case ComponentFeature.container:
        backgroundColor = '#fa0';
        break;
      default:
        backgroundColor = '#0ff';
        break;
    }
    return {
      opacity: isDragging ? 0.5 : 1,
      outline: isOver ? '2px solid #7193f1' : undefined,
      outlineOffset: isOver ? -2 : undefined,
      transition: 'border 0.5s ease-in-out',
      boxSizing: 'border-box',
      backgroundColor
    };
  }, [feature]);

  let setNodeRef: React.LegacyRef<HTMLDivElement> | undefined;
  switch (feature) {
    case ComponentFeature.slot:
      setNodeRef = setDroppableNodeRef;
      break;
    case ComponentFeature.container:
      setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
      break;
    default:
      // 为了让 dnd-kit 可以测量这个元素的尺寸，需要设置为 droppable
      setNodeRef = useCombinedRefs(setDroppableNodeRef, setDraggableNodeRef);
      break;
  }

  return (
    <div id={id} ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </div>
  );
}
