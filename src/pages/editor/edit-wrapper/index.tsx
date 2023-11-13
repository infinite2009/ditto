import { useCombinedRefs } from '@dnd-kit/utilities';
import React, { CSSProperties, useContext, useEffect, useMemo, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import ComponentFeature from '@/types/component-feature';
import { DSLStoreContext } from '@/hooks/context';
import classNames from 'classnames';

import { observer } from 'mobx-react';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import IComponentSchema from '@/types/component.schema';
import { message } from 'antd';
import { COMPONENT_DROPDOWN_BASIC_CONTEXT_MENUS } from '@/data/constant';
import styles from './index.module.less';

export interface IEditorProps {
  id: string;
  parentId: string;
  childrenId?: string[];
  children: React.ReactNode;
  feature?: ComponentFeature;
  childrenStyle?: CSSProperties;
  undeletable?: boolean;
}

export default observer(function EditWrapper({
  id,
  parentId,
  childrenId,
  children,
  feature,
  // 不要赋值默认值
  childrenStyle,
  undeletable = false
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
      // 'margin',
      // 'marginLeft',
      // 'marginTop',
      // 'marginRight',
      // 'marginBottom',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'inset'
    ];
    styleNames.forEach(name => {
      if (childrenStyle?.[name] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        result[name] = childrenStyle[name];
      }
    });
    // // 额外处理下 margin
    // const { margin, marginLeft, marginTop, marginRight, marginBottom } = result;
    //
    // const mergedMarginTop = marginTop || margin;
    //
    // if (mergedMarginTop !== undefined) {
    //   result.marginTop = mergedMarginTop;
    // }
    //
    // const mergedMarginRight = marginRight || margin;
    //
    // if (mergedMarginRight !== undefined) {
    //   result.marginRight = mergedMarginRight;
    // }
    //
    // const mergedMarginBottom = marginBottom || margin;
    //
    // if (mergedMarginBottom !== undefined) {
    //   result.marginTop = mergedMarginBottom;
    // }
    //
    // const mergedMarginLeft = marginLeft || margin;
    //
    // if (mergedMarginLeft !== undefined) {
    //   result.marginLeft = mergedMarginLeft;
    // }

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

    // 处理Flex布局的拉伸问题
    if (wrapperElement.parentElement) {
      const computedParentStyle = getComputedStyle(wrapperElement.parentElement);
      const alignItems = computedParentStyle.alignItems;
      if (alignItems === 'stretch' || alignItems === 'normal') {
        if (computedParentStyle.flexDirection === 'column') {
          childElement.style.width = '100%';
        } else {
          childElement.style.height = '100%';
        }
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

    // const marginStyleNames: (keyof CSSProperties)[] = [
    //   'margin',
    //   'marginTop',
    //   'marginRight',
    //   'marginBottom',
    //   'marginLeft'
    // ];
    // marginStyleNames.forEach(name => {
    //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // @ts-ignore
    //   if (result[name] === undefined && childElement.style[name] !== '') {
    //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //     // @ts-ignore
    //     result[name] = childElement.style[name];
    //   }
    //   childElement.style.margin = '0px';
    // });

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
      // outline: isOver ? '2px solid #7193f1' : undefined,
      // outlineOffset: isOver ? -2 : undefined,
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

  function handleClick(e: { stopPropagation: () => void }) {
    dslStore.selectComponent(id);
    e.stopPropagation();
  }

  const className = classNames({
    [styles.selected]: id === dslStore.selectedComponent?.id,
    [styles.isOver]: isOver,
    [styles.main]: true
  });

  function handleClickContextMenu(key: string, data: IComponentSchema) {
    switch (key) {
      case 'copy':
        message.warning('复制待实现');
        break;
      case 'paste':
        message.warning('粘贴待实现');
        break;
      case 'rename':
        message.warning('重命名待实现');
        break;
      case 'delete':
        dslStore.deleteComponent(data.id);
        break;
      default:
        break;
    }
  }

  return (
    <ComponentContextMenu
      data={dslStore.dsl.componentIndexes[id]}
      onClick={handleClickContextMenu}
      items={COMPONENT_DROPDOWN_BASIC_CONTEXT_MENUS}
    >
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
      </div>
    </ComponentContextMenu>
  );
});
