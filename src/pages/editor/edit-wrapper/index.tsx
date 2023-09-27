import { useCombinedRefs } from '@dnd-kit/utilities';
import React, { CSSProperties, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';
import { DSLStoreContext } from '@/hooks/context';
import { toJS } from 'mobx';

export interface IEditorProps {
  id: string;
  parentId: string;
  childrenId?: string[];
  children: React.ReactNode;
  direction?: 'row' | 'column';
  feature?: ComponentFeature;
  parentStyle?: CSSProperties;
  childrenStyle?: CSSProperties;
}

export default function EditWrapper({
  id,
  parentId,
  childrenId,
  children,
  feature,
  // 不要赋值默认值
  childrenStyle,
  // 不要赋值默认值
  parentStyle
}: IEditorProps) {
  const [styleState, setStyleState] = useState<CSSProperties>({});
  const dslStore = useContext(DSLStoreContext);

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

  useEffect(() => {
    setStyleState(processBFC());
  }, [childrenStyle, parentStyle, feature]);

  function processBFC(): CSSProperties {
    const result: CSSProperties = {};
    const styleNames: (keyof CSSProperties)[] = [
      'display',
      'margin',
      'marginLeft',
      'marginTop',
      'marginRight',
      'marginBottom',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'inset'
    ];
    styleNames.forEach(name => {
      if (childrenStyle?.[name] !== undefined) {
        // @ts-ignore
        result[name] = childrenStyle[name];
      }
    });

    const wrapperElement = document.getElementById(id);
    if (!wrapperElement) {
      return result;
    }
    const childElement: HTMLElement = wrapperElement.children?.[0] as HTMLElement;
    if (!childElement) {
      return result;
    }
    const computedChildStyle = getComputedStyle(childElement);

    if (!result.display) {
      const display = computedChildStyle.getPropertyValue('display');
      const width = computedChildStyle.getPropertyValue('width');
      const flexBasis = childElement.style.flexBasis;
      const flexReg = /^-?\d+(\.\d+)?$/;
      switch (display) {
        case 'block':
          // 如果有具体宽度
          if (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && flexReg.test(width)) {
            result.display = 'inline-block';
          } else {
            result.display = 'block';
          }
          break;
        case 'flex':
          if (
            (flexBasis.indexOf('px') !== -1 && flexBasis.indexOf('%') !== -1 && flexReg.test(flexBasis)) ||
            (width.indexOf('px') !== -1 && width.indexOf('%') !== -1 && flexReg.test(width))
          ) {
            result.display = 'inline-block';
          } else {
            result.display = 'block';
          }
          break;
        case 'inline-block':
          result.display = 'inline-block';
          if (parentStyle?.alignItems === 'stretch') {
            result.alignSelf = 'flex-start';
          } else if (wrapperElement.parentElement) {
            const computedParentStyle = getComputedStyle(wrapperElement.parentElement);
            if (computedParentStyle.getPropertyValue('alignItems') === 'stretch') {
              result.alignSelf = 'flex-start';
            }
          }
          break;
        default:
          result.display = 'inline';
          break;
      }
    }

    // 处理定位问题
    if (!result.position) {
      if (childElement.style.position === 'absolute') {
        result.position = childElement.style.position;
      }
    }
    if (!result.top && childElement.style.top !== '') {
      result.top = childElement.style.top;
      childElement.style.top = '0px';
    }

    if (!result.right && childElement.style.right !== '') {
      result.right = childElement.style.right;
      childElement.style.right = '0px';
    }

    if (!result.bottom && childElement.style.bottom !== '') {
      result.bottom = childElement.style.bottom;
      childElement.style.bottom = '0px';
    }

    if (!result.left && childElement.style.left !== '') {
      result.left = childElement.style.left;
      childElement.style.left = '0px';
    }

    // 处理margin
    if (!result.margin) {
      result.margin = childElement.style.margin;
      childElement.style.margin = '0px';
    }

    if (!result.marginTop) {
      wrapperElement.style.marginTop = childElement.style.marginTop;
      childElement.style.marginTop = '0px';
    }

    if (!result.marginRight) {
      wrapperElement.style.marginRight = childElement.style.marginRight;
      childElement.style.marginRight = '0px';
    }

    if (!result.marginBottom) {
      wrapperElement.style.marginBottom = childElement.style.marginBottom;
      childElement.style.marginBottom = '0px';
    }

    if (!result.marginLeft) {
      wrapperElement.style.marginLeft = childElement.style.marginLeft;
      childElement.style.marginLeft = '0px';
    }

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
      backgroundColor,
      ...result
    } as CSSProperties;
  }

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

  function handleClick() {
    dslStore.selectComponent(id);
  }

  return (
    <div id={id} ref={setNodeRef} {...listeners} {...attributes} style={styleState} onClick={handleClick}>
      {children}
    </div>
  );
}
