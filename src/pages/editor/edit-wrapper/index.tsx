import { useCombinedRefs } from '@dnd-kit/utilities';
import React, { CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';

export interface IEditorProps {
  id: string;
  childrenId?: string[];
  children: React.ReactNode;
  direction?: 'row' | 'column';
  type?: ComponentFeature;
}

export default function EditWrapper({ id, childrenId, children, direction = 'column', type }: IEditorProps) {
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id,
    data: {
      childrenId,
      direction: direction || 'column',
      type: type || ComponentFeature.solid
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

  useEffect(() => {
    const wrapperElement = document.getElementById(id);
    if (!wrapperElement) {
      return;
    }
    const childElement: HTMLElement = wrapperElement.children?.[0] as HTMLElement;
    processBFC(wrapperElement, childElement);
  }, []);

  function processBFC(targetElement: HTMLElement, childElement: HTMLElement) {
    const display = childElement.style.display;
    const width = childElement.style.width;
    const flexBasis = childElement.style.flexBasis;
    const floatReg = /^-?\d+(\.\d+)?$/;
    switch (display) {
      case 'block':
        // 如果有具体宽度
        if (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && floatReg.test(width)) {
          targetElement.style.display = 'inline-block';
        } else {
          targetElement.style.display = 'block';
        }
        break;
      case 'flex':
        if (
          (flexBasis.indexOf('px') !== -1 && flexBasis.indexOf('%') !== -1 && floatReg.test(flexBasis)) ||
          (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && floatReg.test(width))
        ) {
          targetElement.style.display = 'inline-block';
        } else {
          targetElement.style.display = 'block';
        }
        break;
      default:
        targetElement.style.display = 'inline';
        break;
    }
  }

  const style: CSSProperties = useMemo(() => {
    let backgroundColor;
    switch (type) {
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
  }, [type]);

  let setNodeRef: React.LegacyRef<HTMLDivElement> | undefined;
  switch (type) {
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
