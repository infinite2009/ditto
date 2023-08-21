import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CollisionDescriptor, CollisionDetection,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  DroppableContainer,
  MeasuringStrategy
} from '@dnd-kit/core';
import { getEventCoordinates, Transform } from '@dnd-kit/utilities';
import { Tabs } from 'antd';

import Toolbar from '@/pages/editor/toolbar';
import PagePanel from '@/pages/editor/ page-panel';
import ComponentPanel from '@/pages/editor/component-panel';
import TemplatePanel from '@/pages/editor/template-panel';
import FormPanel from '@/pages/editor/form-panel';
import PageRenderer from '@/pages/components/page-renderer';
import IPageSchema from '@/types/page.schema';
import * as dsl from '@/mock/tab-case.json';

import LayerComponentPanel from '@/pages/editor/layer-component-panel';
import styles from './index.module.less';
import { createPortal } from 'react-dom';
import DropAnchor from '@/pages/editor/drop-anchor';
import { ClientRect, DragEndEvent } from '@dnd-kit/core/dist/types';
import { Modifiers } from '@dnd-kit/core/dist/modifiers';
import { Active, Over } from '@dnd-kit/core/dist/store';
import { snapCenterToCursor } from '@dnd-kit/modifiers';

interface IAnchorCoordinates {
  top: number;
  left: number;
  width: number;
  height: number;
}

const collisionOffset = 10;

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5'
      }
    }
  })
};

const tabsItems = [
  {
    key: 'component',
    label: '组件',
    children: <ComponentPanel />
  },
  {
    key: 'layer',
    label: '图层组件',
    children: <LayerComponentPanel />
  },
  {
    key: 'template',
    label: '模板',
    children: <TemplatePanel />
  }
];

export default function Editor() {
  const [, setActiveId] = useState<string>('');
  const [dslState, setDslState] = useState<IPageSchema>();
  const [top, setTop] = useState<number>(200);
  const [left, setLeft] = useState<number>(600);
  const [width, setWidth] = useState<number>(100);
  const [height, setHeight] = useState<number>(2);

  const insertIndexRef = useRef<number>(0);

  useEffect(() => {
    fetchDSL().then(data => {
      setDslState(data);
    });
  }, []);

  function setAnchor(obj: IAnchorCoordinates) {
    setTop(obj.top);
    setLeft(obj.left);
    setWidth(obj.width);
    setHeight(obj.height);
  }

  function handleDraggingStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDraggingOver({ over }: DragOverEvent) {
    console.log("I'm over on: ", over?.id);
  }

  function handleDraggingEnd({ active, over }: DragEndEvent) {
    console.log('active: ', active);
    console.log('over: ', over);
  }

  function handleDraggingCancel() {
    // 重置插入索引
    insertIndexRef.current = 0;
  }

  async function fetchDSL(): Promise<IPageSchema> {
    return new Promise<IPageSchema>(resolve => {
      resolve(dsl as unknown as IPageSchema);
    });
  }

  function isInRect(
    point: { top: any; left: any },
    rect: { top: any; right: any; bottom: any; left: any },
    offset = 0
  ) {
    const { top: pointerTop, left: pointerLeft } = point;
    const { top, right, bottom, left } = rect;
    const correctedTop = top + offset;
    const correctedLeft = left + offset;
    const correctedRight = right - offset;
    const correctedBottom = bottom - offset;
    return (
      pointerTop > correctedTop &&
      pointerTop < correctedBottom &&
      pointerLeft > correctedLeft &&
      pointerLeft < correctedRight
    );
  }

  /**
   * 计算重叠的类型：
   * return 0 | 1 | 2. 0 表示没有重叠，1 表示左上角落在另一个矩形的内部边缘，2 表示左上角落在另一个矩形的核心区域
   */
  function calcIntersectionType(
    rect: { top: number; right: number; bottom: number; left: number },
    collisionRect: { top: number; left: number }
  ) {
    const pointer = {
      top: collisionRect.top,
      left: collisionRect.left
    };
    if (!isInRect(pointer, rect)) {
      return 0;
    }
    if (isInRect(pointer, rect, collisionOffset)) {
      return 2;
    }
    return 1;
  }

  function isDescendant(entry: string, target: string, parentDict: { [key: string]: string }) {
    let currentParent = parentDict[entry];
    while (currentParent) {
      if (target === currentParent) {
        return true;
      }
      currentParent = parentDict[currentParent];
    }
    return false;
  }

  function sortCollisionsDesc(
    {data: {value: a}}: CollisionDescriptor,
    {data: {value: b}}: CollisionDescriptor
  ) {
    return b - a;
  }

  /**
   * collisionRect: 碰撞矩形的尺寸数据
   * droppableRects: 所有可以放入的矩形尺寸数据 map
   * droppableContainers: 所有可以放入的矩形的节点信息，包括 id，data 等
   */
  const customDetection: CollisionDetection = useCallback(
    ({
      active,
      collisionRect,
      droppableRects,
      droppableContainers
    }) => {
      const collisions: CollisionDescriptor[] = [];

      const parentDict: { [key: string]: string } = {};

      droppableContainers.forEach((item: DroppableContainer) => {
        if (item.data.current?.childrenId?.length) {
          item.data.current.childrenId.forEach((childId: string) => {
            parentDict[childId] = item.id as string;
          });
        }
      });

      for (const droppableContainer of droppableContainers) {
        // 查出每一个容器的矩形尺寸
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);

        // 既不是自身，也不是自己的后代节点
        if (rect && active.id !== id && !isDescendant(id as string, active.id as string, parentDict)) {
          // 这里的 collisionRect 就是移动的矩形
          const intersectionType = calcIntersectionType(rect, collisionRect);
          if (intersectionType === 2) {
            collisions.push({
              id,
              data: {
                droppableContainer,
                value: intersectionType,
                ...droppableContainer.data.current
              }
            });
          }
        }
      }

      const result = collisions.sort(sortCollisionsDesc);

      if (result.length) {
        const { direction, childrenId = [] } = result[0].data;

        // 从结果中过滤出子节点
        const childrenRects = childrenId
          ?.map((item: string) => {
            return droppableRects.get(item);
          })
          .filter((item: never) => !!item);

        // 默认插入尾部
        insertIndexRef.current = childrenRects.length;
        if (childrenRects?.length) {
          const style = {
            top: 0,
            left: 0,
            width: 0,
            height: 0
          };

          for (let i = 0, l = childrenRects.length; i < l; i++) {
            const { top, right, bottom, left, height, width } = childrenRects[i];
            const {
              top: collisionTop,
              left: collisionLeft
            } = collisionRect;
            // 判断碰撞左上角和这些矩形的位置关系，落在两者之间的，设下一个 index 为插入位置
            if (direction === 'row') {
              // 如果在当前矩形同行
              if (collisionTop >= top && collisionTop <= bottom) {
                style.top = top;
                style.height = height;
                style.width = 2;

                if (collisionLeft <= left + collisionOffset) {
                  insertIndexRef.current = i;
                  style.left = left;
                  if (i > 0) {
                    const { bottom: preBottom, right: preRight } = childrenRects[i - 1];
                    // 如果和前一个没有换行
                    if (!(top > preBottom && left < preRight)) {
                      style.left = Math.round((preRight + left) / 2);
                    }
                  }
                  break;
                }

                if (i < l - 1) {
                  const { top: nextTop, left: nextLeft } = childrenRects[i + 1];
                  // 如果下一个矩形发生了换行
                  if (bottom < nextTop && nextLeft < right) {
                    if (collisionLeft > right - collisionOffset) {
                      style.left = right;
                      insertIndexRef.current = i + 1;
                      break;
                    }
                  }
                } else {
                  if (collisionLeft > right - collisionOffset) {
                    style.left = right;
                    insertIndexRef.current = i + 1;
                    break;
                  }
                }
              }
            } else {
              if (collisionTop < top + collisionOffset) {
                style.height = 2;
                style.width = width;
                style.left = left;
                if (i === 0) {
                  style.top = top;
                } else {
                  const { bottom: preBottom } = childrenRects[i - 1];
                  style.top = Math.round((top + preBottom) / 2);
                }
                insertIndexRef.current = i;
                break;
              }

              if (i === l - 1 && collisionTop > bottom - collisionOffset) {
                style.height = 2;
                style.width = width;
                style.left = left;
                insertIndexRef.current = i + 1;
                style.top = bottom;
              }
            }
          }
          setAnchor(style);
        } else {
          const rect = droppableRects.get(result[0].id);
          if  (rect) {
            let style;
            if (direction === 'row') {
              style = {
                top: rect.top,
                width: 2,
                height: rect.height,
                left: rect.left + Math.round(rect.width / 2)
              };
            } else {
              style = {
                top: rect.top + Math.round(rect.height / 2),
                width: rect.width,
                height: 2,
                left: rect.left
              };
            }
            setAnchor(style);
            insertIndexRef.current = 0;
          }
        }
        return result;
      }
      return [];
    },
    []
  );

  return (
    <div className={styles.main}>
      <Toolbar />
      <div className={styles.editArea}>
        <DndContext
          collisionDetection={customDetection}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always
            }
          }}
          modifiers={[snapCenterToCursor]}
          onDragStart={handleDraggingStart}
          onDragOver={handleDraggingOver}
          onDragEnd={handleDraggingEnd}
          onDragCancel={handleDraggingCancel}
        >
          <div className={styles.draggableArea}>
            <div className={styles.panel}>
              <div className={styles.pagePanel}>
                <PagePanel />
              </div>
              <div className={styles.componentPanel}>
                <Tabs items={tabsItems} />
              </div>
            </div>
            <div className={styles.canvas}>
              <div className={styles.canvasInner}>
                {dslState ? <PageRenderer dsl={dslState} mode="edit" /> : <div>未获得有效的DSL</div>}
              </div>
            </div>
          </div>
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              <div style={{ height: 40, width: 40, backgroundColor: '#f00' }}></div>
            </DragOverlay>,
            document.body
          )}
          {createPortal(<DropAnchor top={top} left={left} width={width} height={height} />, document.body)}
        </DndContext>
        <div className={styles.formPanel}>
          <FormPanel />
        </div>
      </div>
    </div>
  );
}
