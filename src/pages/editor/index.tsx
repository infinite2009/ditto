import React, { CSSProperties, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  CollisionDescriptor,
  CollisionDetection,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  DroppableContainer,
  MeasuringStrategy,
  MouseSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { Input, message } from 'antd';

import Toolbar, { PageActionEvent, PageWidth } from '@/pages/editor/toolbar';
import PagePanel from '@/pages/editor/page-panel';
import FormPanel from '@/pages/editor/form-panel';
import PageRenderer from '@/pages/components/page-renderer';
import styles from './index.module.less';
import DropAnchor from '@/pages/editor/drop-anchor';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import PageAction from '@/types/page-action';
import IAnchorCoordinates from '@/types/anchor-coordinate';
import { save } from '@tauri-apps/api/dialog';
import { dirname, documentDir, join } from '@tauri-apps/api/path';
import ComponentFeature from '@/types/component-feature';
import fileManager from '@/service/file';
import Empty from '@/pages/editor/empty';
import { debounce } from 'lodash';
import { DataNode } from 'antd/es/tree';
import PanelTab, { PanelType } from '@/pages/editor/panel-tab';
import { ComponentId } from '@/types';
import ComponentTree from '@/pages/editor/component-tree';
import { ProjectInfo } from '@/types/app-data';
import CompositionPanel from '@/pages/editor/composition-panel';
import { AppStoreContext, DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import ComponentSchemaRef from '@/types/component-schema-ref';
import IComponentSchema from '@/types/component.schema';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import { generateContextMenus } from '@/util';
import InsertType from '@/types/insert-type';
import { Scene } from '@/service/app-store';
import FloatTemplatePanel from '@/pages/editor/float-template-panel';
import { createPortal } from 'react-dom';
import { Eye, EyeClose } from '@/components/icon';
import classNames from 'classnames';
import CodePreview from '@/pages/editor/code-preview';

const collisionOffset = 4;

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5'
      }
    }
  })
};

export interface IEditorProps {
  onPreview: (projectId: string) => void;
  onPreviewClose: (projectId: string) => void;
  style?: CSSProperties;
}

export default observer(({ onPreview, onPreviewClose, style }: IEditorProps) => {
  const searchParams = new URLSearchParams(window.location.search);

  const [, setActiveId] = useState<string>('');
  const [currentProject, setCurrentProject] = useState<ProjectInfo>();
  const [projectData, setProjectData] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [leftPanelType, setLeftPanelType] = useState<PanelType>(PanelType.file);
  const [scale, setScale] = useState<number>(100);
  const [anchorStyle, setAnchorStyle] = useState<CSSProperties>();
  const [selectedComponentForRenaming, setSelectedComponentForRenaming] = useState<ComponentId>('');
  const [pageWidth, setPageWidth] = useState<number>(PageWidth.auto);
  const [activePanelTabKey, setActivePanelTabKey] = useState<string>(undefined);
  const [rawCode, setRawCode] = useState<string>('');

  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);
  const appStore = useContext(AppStoreContext);

  const insertIndexRef = useRef<number>(-1);
  const anchorCoordinatesRef = useRef<IAnchorCoordinates>();
  // TODO: 文件路径数据需要重构为 indexedDB 存储
  const defaultPathRef = useRef<string>();
  const filePathRef = useRef<string>();

  const codeType = (searchParams.get('codetype') as string) || 'react';

  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 4
    }
  });

  const sensors = useSensors(mouseSensor);

  useEffect(() => {
    documentDir().then(p => {
      defaultPathRef.current = p;
    });
    init();
  }, []);

  function init() {
    fetchCurrentProject().then();
    fetchProjectData().then();
    fetchTemplateData().then();
  }

  useEffect(() => {
    if (currentProject) {
      const currentFile = currentProject.openedFile;
      if (currentFile) {
        openFile(currentFile).then();
      }
      setCurrentFile(currentFile || '');
      editorStore.setSelectedPath(currentFile || '');
    }
  }, [currentProject]);

  useEffect(() => {
    if (!currentProject) {
      return;
    }
    const contextId = appStore.getContextIdForProject(currentProject.id);
    const handlers = {
      copy,
      paste,
      cancelSelection,
      exportAsTemplate,
      rename,
      newFolder,
      newPage,
      remove: deleteSelectedComponent
    };
    if (!contextId) {
      appStore.createContext(Scene.editor, {}, handlers);
    } else {
      appStore.registerHandlers(contextId, handlers);
    }
  }, [copy, deleteSelectedComponent, paste, cancelSelection, exportAsTemplate, rename, newFolder, newPage]);

  function copy() {
    message.success('复制待实现').then();
  }

  function paste() {
    message.success('粘贴待实现').then();
  }

  function cancelSelection() {
    message.success('取消选择待实现').then();
  }

  function exportAsTemplate() {
    message.success('导出模板待实现').then();
  }

  function rename() {
    message.success('重命名待实现').then();
  }

  function newFolder() {
    message.success('新建文件夹待实现').then();
  }

  function newPage() {
    message.success('新建页面待实现').then();
  }

  async function fetchCurrentProject() {
    const projectId = await fileManager.fetchCurrentProjectId();
    if (!projectId) {
      return;
    }
    const currentProject = await fileManager.fetchProjectInfo(projectId);
    setCurrentProject(currentProject);
  }

  async function fetchProjectData() {
    setProjectData(await fileManager.fetchProjectData());
  }

  function hideAnchor() {
    if (!dslStore) {
      return;
    }
    anchorCoordinatesRef.current = {
      top: 0,
      left: 0,
      height: 0,
      width: 0
    };
    setAnchorStyle(anchorCoordinatesRef.current);
  }

  function resetInsertIndexRef() {
    insertIndexRef.current = 0;
  }

  function handleDraggingStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDraggingMove({ over }: DragOverEvent) {
    if (over) {
      if (anchorCoordinatesRef.current) {
        setAnchorStyle(anchorCoordinatesRef.current);
      }
    } else {
      hideAnchor();
    }
  }

  function handleDraggingEnd({ active, over }: DragEndEvent) {
    if (over && active.data.current) {
      const { dndType, name, dependency } = active.data.current;
      if (dndType === 'insert') {
        try {
          dslStore.insertComponent(over.id as string, name, dependency, insertIndexRef.current);
        } catch (e) {
          message.error((e as any).toString()).then();
        }
      } else {
        dslStore.moveComponent(over.id as string, active.id as string, insertIndexRef.current);
      }
    }
    resetInsertIndexRef();
    hideAnchor();
  }

  function handleDraggingCancel() {
    // 重置插入索引
    resetInsertIndexRef();
    hideAnchor();
  }

  function isInRect(
    point: {
      top: number;
      left: number;
    },
    rect: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    },
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
    rect: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    },
    collisionRect: {
      top: number;
      left: number;
    }
  ) {
    const pointer = {
      // 这里因为 drag overlay 位置的原因，需要修正
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

  function isDescendant(
    entry: string,
    target: string,
    parentDict: {
      [key: string]: string;
    }
  ) {
    let currentParent = parentDict[entry];
    while (currentParent) {
      if (target === currentParent) {
        return true;
      }
      currentParent = parentDict[currentParent];
    }
    return false;
  }

  // 计算当前节点的深度
  function calculateDepth(
    id: string,
    parentDict: {
      [key: string]: string;
    }
  ) {
    let depth = 0;
    let parentId = id;
    while (parentId) {
      if (parentDict[parentId]) {
        depth++;
        parentId = parentDict[parentId];
      } else {
        break;
      }
    }
    return depth;
  }

  function deleteSelectedComponent() {
    if (dslStore.selectedComponent) {
      dslStore.deleteComponent(dslStore.selectedComponent.id);
    }
  }

  function sortCollisionsDesc(
    { data: { value: a } }: CollisionDescriptor,
    { data: { value: b } }: CollisionDescriptor
  ) {
    return b - a;
  }

  function setAnchorCoordinates(anchor: IAnchorCoordinates) {
    anchorCoordinatesRef.current = anchor;
  }

  /**
   * collisionRect: 碰撞矩形的尺寸数据
   * droppableRects: 所有可以放入的矩形尺寸数据 map
   * droppableContainers: 所有可以放入的矩形的节点信息，包括 id，data 等
   */
  const customDetection: CollisionDetection = useCallback(
    ({ active, collisionRect, droppableRects, droppableContainers }) => {
      const collisions: CollisionDescriptor[] = [];

      const parentDict: {
        [key: string]: string;
      } = {};

      if (active.data?.current?.isLayer) {
        const root = droppableContainers.find(item => item.data?.current?.dndType === 'root');
        if (root) {
          const { id } = root;
          const rect = droppableRects.get(id);
          if (rect) {
            // 这里的 collisionRect 就是移动的矩形
            const intersectionType = calcIntersectionType(rect, collisionRect);
            if (intersectionType === 2) {
              collisions.push({
                id,
                data: {
                  droppableContainer: root,
                  value: calculateDepth(id as string, parentDict),
                  ...root.data.current
                }
              });
            }
            const style = {
              top: (rect.top + rect.bottom) / 2,
              left: rect.left,
              width: rect.width,
              height: 2
            };
            setAnchorCoordinates(style);
            return collisions;
          }
          return [];
        }
        return [];
      }

      droppableContainers.forEach((item: DroppableContainer) => {
        if (item.data.current?.parentId) {
          parentDict[item.id] = item.data.current.parentId;
        }
      });

      for (const droppableContainer of droppableContainers) {
        // 查出每一个容器的矩形尺寸
        const { id } = droppableContainer;
        const rect = droppableRects.get(id);

        // 既不是自身，也不是自己的后代节点
        if (
          rect &&
          active.id !== id &&
          droppableContainer.data.current?.feature !== ComponentFeature.solid &&
          !isDescendant(id as string, active.id as string, parentDict)
        ) {
          // 这里的 collisionRect 就是移动的矩形
          const intersectionType = calcIntersectionType(rect, collisionRect);
          if (intersectionType === 2) {
            if (dslStore.isLayerShown()) {
              if (dslStore.isInLayer(id as string)) {
                collisions.push({
                  id,
                  data: {
                    droppableContainer,
                    value: calculateDepth(id as string, parentDict),
                    ...droppableContainer.data.current
                  }
                });
              }
            } else {
              collisions.push({
                id,
                data: {
                  droppableContainer,
                  value: calculateDepth(id as string, parentDict),
                  ...droppableContainer.data.current
                }
              });
            }
          }
        }
      }

      const result = collisions.sort(sortCollisionsDesc);

      if (result.length) {
        const {
          vertical,
          childrenId = [],
          droppableContainer: { rect: containerRect }
        } = result[0].data;

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

          if (!vertical) {
            // 扫描子元素，确定横向排列的情况
            const flexRowInfo: {
              // top 和 bottom 表示当前行的边界
              top: number;
              bottom: number;
              items: {
                index: number;
                // 触发插入的右边距，并不是元素的右边
                right: number;
                // 触发插入的左边距，并不是元素的左边
                left: number;
                height: number;
              }[];
            }[] = [];

            let currentGridIndex = -1;
            for (let i = 0, l = childrenRects.length; i < l; i++) {
              const { top, right, bottom, left, height } = childrenRects[i];
              if (i === 0) {
                const item = {
                  index: i,
                  left,
                  right,
                  height
                };
                flexRowInfo.push({
                  top,
                  bottom,
                  items: [item]
                });
                currentGridIndex++;
                continue;
              }
              const { right: preRight, bottom: preBottom } = childrenRects[i - 1];
              // 如果发现换行，重新推入一个网格数组
              if (top > preBottom && left < preRight) {
                // 修正上一行最后一个元素的右边距，使得竖线位于它的右边和容器右边中间
                const lastElementInLastRow = flexRowInfo.slice(-1)[0].items.slice(-1)[0];
                lastElementInLastRow.right = containerRect.current.right;
                // 创建新的行信息
                const item = {
                  top,
                  bottom,
                  items: [
                    {
                      index: i,
                      left,
                      right,
                      height
                    }
                  ]
                };
                flexRowInfo.push(item);
                currentGridIndex++;
              } else {
                // 没有换行，尝试比较当前元素和当前行的top和bottom
                flexRowInfo[currentGridIndex].top = Math.min(flexRowInfo[currentGridIndex].top, top);
                flexRowInfo[currentGridIndex].bottom = Math.max(flexRowInfo[currentGridIndex].bottom, bottom);
                // 修正当前行存入的最后一个元素（不是当前行最后一个元素，因为还没有便利完毕），修正为它的右边距和当前元素左边距的中点
                const lastItem = flexRowInfo[currentGridIndex].items.slice(-1)[0];
                lastItem.right = Math.round((lastItem.right + left) / 2);
                flexRowInfo[currentGridIndex].items.push({
                  index: i,
                  // 左边距定义为上一个元素的右边距 + 1
                  left: lastItem.right + 1,
                  right,
                  height
                });
              }
            }

            // 遍历所有行，修正 top 和 bottom
            for (let i = 0, l = flexRowInfo.length; i < l; i++) {
              const row = flexRowInfo[i];
              // 修正 top 和 bottom
              if (i < l - 1) {
                const nextRow = flexRowInfo[i + 1];
                const mid = Math.round((row.bottom + nextRow.top) / 2);
                row.bottom = mid;
                nextRow.top = mid;
              } else {
                // 如果是最后一行，只需要修正 bottom
                row.bottom = containerRect.current.bottom;
              }

              // 修正左侧
              const firstElementInRow = row.items[0];
              firstElementInRow.left = containerRect.current.left;
            }

            const { top: collisionTop, left: collisionLeft } = collisionRect;

            // 根据鼠标所在坐标，逐行进行扫描
            for (let i = 0, l = flexRowInfo.length; i < l; i++) {
              const { top, bottom, items } = flexRowInfo[i];
              // 确定高度为当前行的高度
              style.height = bottom - top;
              // 如果碰撞矩形的左上角在当前行
              if (collisionTop >= top && collisionTop <= bottom) {
                style.top = top;
                style.width = 2;
                // 遍历当前行中的所有元素
                for (let j = 0, ll = items.length; j < ll; j++) {
                  // 插入当前元素中心的左侧，都会认为是这个组件的左侧
                  if (collisionLeft < Math.round((items[j].left + items[j].right) / 2)) {
                    insertIndexRef.current = items[j].index;
                    // 计算下当前的 left 应该是多少
                    style.left = items[j].left;
                    break;
                  } else {
                    insertIndexRef.current = items[j].index + 1;
                    style.left = items[j].right;
                  }
                }
                // 如果在当前行，就需要在找到后直接break;
                break;
              }
            }
          } else {
            for (let i = 0, l = childrenRects.length; i < l; i++) {
              const { top, bottom, left, width } = childrenRects[i];
              const { top: collisionTop } = collisionRect;
              // 判断碰撞左上角和这些矩形的位置关系，落在两者之间的，设下一个 index 为插入位置
              //
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
              //
            }
          }
          setAnchorCoordinates(style);
        } else {
          const rect = droppableRects.get(result[0].id);
          if (rect) {
            let style: IAnchorCoordinates;
            if (!vertical) {
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
            setAnchorCoordinates(style);
            insertIndexRef.current = 0;
          }
        }
        return result;
      }
      return [];
    },
    []
  );

  const saveFile = debounce(async () => {
    if (currentFile) {
      filePathRef.current = await dirname(currentFile);
      await fileManager.savePageDSLFile(currentFile, dslStore.dsl);
      message.success('保存成功');
    }
  }, 250);

  async function handleExportingPageCodeFile() {
    const extension = codeType === 'react' ? 'tsx' : 'vue';
    const exportPageCodeFile =
      codeType === 'react' ? fileManager.exportReactPageCodeFile : fileManager.exportVuePageCodeFile;
    const defaultPath = await join((filePathRef.current || defaultPathRef.current) as string, `index.${extension}`);
    const selectedFile = await save({
      title: '导出代码',
      defaultPath,
      filters: [
        {
          name: `${extension}文件`,
          extensions: [extension]
        }
      ]
    });
    if (selectedFile) {
      filePathRef.current = await dirname(selectedFile);
      await exportPageCodeFile.apply(fileManager, [selectedFile, dslStore.dsl]);
    }
  }

  function redirectToPreview() {
    if (!currentProject) {
      return;
    }
  }

  function toggleExpandingCanvas() {
    editorStore.toggleExpandingCanvas();
  }

  async function toggleDesignAndCode() {
    if (editorStore.viewMode !== 'code') {
      setRawCode(await fileManager.generateReactCode(dslStore.dsl));
    }
    editorStore.toggleViewMode();
  }

  function togglePageScale(scale: number) {
    setScale(scale || 100);
  }

  async function handleOnDo(e: PageActionEvent) {
    switch (e.type) {
      case PageAction.redo:
        dslStore.redo();
        break;
      case PageAction.undo:
        dslStore.undo();
        break;
      case PageAction.clear:
        dslStore.clearPage();
        break;
      case PageAction.exportCode:
        handleExportingPageCodeFile().then();
        break;
      case PageAction.preview:
        redirectToPreview();
        break;
      case PageAction.saveFile:
        saveFile().then();
        break;
      case PageAction.openProject:
        await fileManager.openLocalProject();
        await fetchProjectData();
        break;
      case PageAction.expandCanvas:
        toggleExpandingCanvas();
        break;
      case PageAction.changeView:
        toggleDesignAndCode();
        break;
      case PageAction.changeScale:
        togglePageScale(e?.payload?.scale);
        break;
      case PageAction.changePageSize:
        changePageSize(e?.payload?.pageWidth);
        break;
    }
  }

  function changePageSize(pageWidth: PageWidth) {
    if (pageWidth === undefined || pageWidth === null) {
      setPageWidth(PageWidth.auto);
      return;
    }
    setPageWidth(pageWidth);
  }

  async function openFile(page: string) {
    if (!currentProject) {
      return;
    }
    const content = await fileManager.openFile(page, currentProject.id);
    if (content) {
      dslStore.initDSL(JSON.parse(content));
    } else {
      message.error('文件已损坏!');
    }
  }

  async function handleSelectingPageOrFolder(page: ({ path: string; name: string } & DataNode) | null) {
    if (!page) {
      // 如果 page 是非真值，表示用户删除了当前的文件
      editorStore.setSelectedPath('');
      dslStore.initDSL();
      return;
    }

    if (page.isLeaf) {
      await fileManager.savePageDSLFile(currentFile, dslStore.dsl);
      openFile(page.path as string).then();
      setCurrentFile(page.path as string);
    }
    // setSelectedPath(page.path);
    editorStore.setSelectedPath(page.path);
  }

  function handleTogglePanel(type: PanelType) {
    setLeftPanelType(type);
  }

  function handleCancelSelectingComponent() {
    dslStore.unselectComponent();
  }

  function handleSelectingComponent(componentId: ComponentId) {
    dslStore.selectComponent(componentId);
  }

  function handleClickDropDownMenu(key: string, componentSchema: IComponentSchema) {
    const componentIdForClone = editorStore.componentIdForCopy;
    const { id: componentId } = componentSchema;
    switch (key) {
      case 'copy':
        editorStore.setComponentIdForCopy(componentId);
        break;
      case InsertType.insertBefore:
        if (componentIdForClone) {
          dslStore.cloneComponent(componentIdForClone, componentId, InsertType.insertBefore);
        }
        break;
      case InsertType.insertAfter:
        if (componentIdForClone) {
          dslStore.cloneComponent(componentIdForClone, componentId, InsertType.insertAfter);
        }
        break;
      case InsertType.insertInFirst:
        if (componentIdForClone) {
          dslStore.cloneComponent(componentIdForClone, componentId, InsertType.insertInFirst);
        }
        break;
      case InsertType.insertInLast:
        if (componentIdForClone) {
          dslStore.cloneComponent(componentIdForClone, componentId, InsertType.insertInLast);
        }
        break;
      case 'rename':
        handleSelectingComponentForRenaming(componentId);
        break;
      case 'delete':
        dslStore.deleteComponent(componentSchema.id);
        break;
      case 'hide':
      case 'show':
        message.warning('待实现').then();
        break;
      default:
        break;
    }
  }

  function handleSelectingComponentForRenaming(componentId: ComponentId) {
    setSelectedComponentForRenaming(componentId);
  }

  function handleRenamingComponent(componentId: ComponentId, newName: string) {
    dslStore.renameComponent(componentId, newName);
    setSelectedComponentForRenaming('');
  }

  function renderDisplayControlBtn(componentSchema: IComponentSchema) {
    const { id, feature } = componentSchema;
    if (feature === ComponentFeature.slot || feature === ComponentFeature.root) {
      return null;
    }
    if (dslStore.isHidden(id)) {
      return (
        <EyeClose
          onClick={e => {
            e.stopPropagation();
            dslStore?.showComponent(id);
          }}
        />
      );
    }
    return (
      <Eye
        className={styles.icon}
        onClick={e => {
          e.stopPropagation();
          dslStore?.hideComponent(id);
        }}
      />
    );
  }

  /**
   * 由于技术上文字节点具有特殊性（会被当作文字组件的 children props 处理），故不会在组件树里出现
   */
  function generateComponentTreeData(): any[] {
    if (!dslStore.dsl) {
      return [];
    }
    const renderTreeNodeTitle = (componentSchema: IComponentSchema) => {
      const { id, feature } = componentSchema;
      const titleClassName = classNames({
        [styles.componentTitle]: true,
        [styles.selected]: dslStore.selectedComponent.id === id
      });
      return (
        <ComponentContextMenu
          data={componentSchema}
          onClick={handleClickDropDownMenu}
          items={generateContextMenus(feature, editorStore.isVisible(id), editorStore.hasCopiedComponent)}
        >
          <div className={titleClassName}>
            {id === selectedComponentForRenaming ? (
              <Input
                defaultValue={componentSchema.displayName}
                autoFocus
                onFocus={e => e.target.select()}
                onBlur={e => handleRenamingComponent(id, (e.target.value as unknown as string).trim())}
                onPressEnter={e =>
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  handleRenamingComponent(id, (e.target.value as unknown as string).trim())
                }
              />
            ) : (
              <div onDoubleClick={() => handleSelectingComponentForRenaming(id)}>
                {componentSchema.displayName || componentSchema.name}
              </div>
            )}
            {renderDisplayControlBtn(componentSchema)}
          </div>
        </ComponentContextMenu>
      );
    };

    const recursiveMap = (data: any[]) => {
      return data
        .filter((item: ComponentSchemaRef) => !item.isText)
        .map((item: ComponentSchemaRef) => {
          const componentSchema = dsl.componentIndexes[item.current];
          const node: Record<string, any> = {
            key: componentSchema.id,
            title: renderTreeNodeTitle(componentSchema)
          };
          // 组件内的插槽也需要加到 children 里
          const children = dslStore.findChildren(componentSchema.id).map(cmp => {
            return {
              current: cmp.id,
              isText: false
            };
          });
          if (children.length) {
            node.children = recursiveMap(children);
          } else {
            node.isLeaf = true;
          }
          return node;
        });
    };
    const { dsl } = dslStore;
    return recursiveMap([dsl.child]);
  }

  function handleChangingProject() {
    fetchProjectData().then();
    fetchCurrentProject().then();
    // 刷新模板
    fetchTemplateData().then();
  }

  async function fetchTemplateData() {
    await appStore.fetchTemplates();
  }

  /**
   * 渲染项目的文件目录，当前文件的组件树
   */
  function renderProjectPanel() {
    return (
      <>
        <PagePanel
          data={projectData}
          onSelect={handleSelectingPageOrFolder}
          // selected={selectedPath}
          onChange={handleChangingProject}
        />
        <div className={styles.componentTree}>
          <ComponentTree
            data={generateComponentTreeData()}
            onSelect={handleSelectingComponent}
            onCancelSelect={handleCancelSelectingComponent}
          />
        </div>
      </>
    );
  }

  /**
   * 渲染模板、组件托盘
   */
  function renderComponentPanel() {
    return <CompositionPanel onChangeTab={setActivePanelTabKey} activeKey={activePanelTabKey} />;
  }

  /**
   * 渲染左侧托盘
   */
  function renderLeftPanel() {
    switch (leftPanelType) {
      case PanelType.file:
        return renderProjectPanel();
      case PanelType.component:
        return renderComponentPanel();
      default:
        return null;
    }
  }

  function renderDesignSection() {
    return (
      <>
        <DndContext
          collisionDetection={customDetection}
          sensors={sensors}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always
            }
          }}
          modifiers={[snapCenterToCursor]}
          onDragStart={handleDraggingStart}
          onDragMove={handleDraggingMove}
          onDragEnd={handleDraggingEnd}
          onDragCancel={handleDraggingCancel}
        >
          <div className={styles.draggableArea}>
            <div
              className={styles.panel}
              style={editorStore?.leftPanelVisible ? undefined : { width: 0, overflow: 'hidden' }}
            >
              {renderLeftPanel()}
            </div>
            <div className={styles.canvas}>
              <div className={styles.canvasInner}>
                {currentFile ? <PageRenderer mode="edit" scale={scale} pageWidth={pageWidth} /> : <Empty />}
              </div>
              {renderMoreTemplatePanel()}
            </div>
          </div>
          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              <div className={styles.dragOverlay}>
                <div className={styles.componentPlaceholder} />
              </div>
              {/*<div style={{ height: 40, width: 40, backgroundColor: '#f00' }}></div>*/}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
        <div
          className={styles.formPanel}
          style={editorStore?.rightPanelVisible ? undefined : { width: 0, overflow: 'hidden' }}
        >
          <FormPanel />
        </div>
      </>
    );
  }

  function renderCodeSection() {
    return <CodePreview code={rawCode} />;
  }

  function onApplyTemplate(path: string) {
    dslStore.applyTemplate(path).then();
  }

  function renderMoreTemplatePanel() {
    if (!dslStore?.isEmpty) {
      return null;
    }
    return <FloatTemplatePanel onApplyTemplate={onApplyTemplate} />;
  }

  return (
    <div className={styles.main} style={style}>
      <div className={styles.topBar}>
        {editorStore.viewMode === 'design' ? (
          <PanelTab
            onSelect={handleTogglePanel}
            style={editorStore?.leftPanelVisible ? undefined : { width: 0, overflow: 'hidden', margin: 0, padding: 0 }}
          />
        ) : null}
        <Toolbar onDo={handleOnDo} pageWidth={pageWidth} projectId={currentProject?.id} />
      </div>
      <div className={styles.editArea}>
        {editorStore.viewMode === 'design' ? renderDesignSection() : renderCodeSection()}
      </div>
      <DropAnchor style={anchorStyle} />
    </div>
  );
});
