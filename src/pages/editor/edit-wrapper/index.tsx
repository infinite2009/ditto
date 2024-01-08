import { useCombinedRefs } from '@dnd-kit/utilities';
import React, { CSSProperties, useContext, useEffect, useMemo, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';
import { DSLStoreContext } from '@/hooks/context';
import classNames from 'classnames';

import { observer } from 'mobx-react';
import styles from './index.module.less';

export interface IEditorProps {
  children: React.ReactNode;
  childrenId?: string[];
  childrenStyle?: CSSProperties;
  feature?: ComponentFeature;
  id: string;
  parentId: string;
}

export default observer(function EditWrapper({
  id,
  parentId,
  childrenId,
  children,
  feature,
  // 不要赋值默认值
  childrenStyle
}: IEditorProps) {
  const [styleState, setStyleState] = useState<CSSProperties>({});
  const dslStore = useContext(DSLStoreContext);

  const vertical = useMemo(() => {
    if (React.isValidElement(children)) {
      return children.props.vertical;
    }
    return true;
  }, [children]);

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id,
    data: {
      childrenId,
      parentId,
      vertical,
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
  }, [childrenStyle, feature]);

  function processBFC(): CSSProperties {
    const result: CSSProperties = {};
    const styleNames: (keyof CSSProperties)[] = [
      'display',
      'height',
      'width',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'inset',
      'flexGrow',
      'flexShrink',
      'alignSelf'
    ];
    styleNames.forEach(name => {
      if (childrenStyle?.[name] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
          break;
        default:
          result.display = 'inline';
          break;
      }
    }

    childElement.style.width = '100%';
    childElement.style.height = '100%';

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

    switch (feature) {
      case ComponentFeature.slot:
        break;
      case ComponentFeature.container:
        break;
      default:
        break;
    }

    return {
      opacity: isDragging ? 0.5 : 1,
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

  function handleClick(e: { stopPropagation: () => void }) {
    dslStore.selectComponent(id);
    e.stopPropagation();
  }

  const className = classNames({
    [styles.selected]: id === dslStore.selectedComponent?.id,
    [styles.isOver]: isOver,
    [styles.main]: true
  });

  function renderSelectedUI() {
    return (
      <>
        <div className={styles.topLeft} />
        <div className={styles.topRight} />
        <div className={styles.bottomRight} />
        <div className={styles.bottomLeft} />
      </>
    );
  }

  return (
    <div
      className={className}
      id={id}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={styleState}
      onClick={handleClick}
    >
      {children}
      {id === dslStore.selectedComponent?.id ? renderSelectedUI() : null}
    </div>
  );
});
