import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { App, Empty, Flex, Input, Tooltip } from 'antd';
import { PageInfo, ProjectInfo } from '@/types/app-data';
import Toolbar, { PageActionEvent, PageWidth } from '@/pages/editor/toolbar';
import PagePanel from '@/pages/editor/page-panel';
import FormPanel from '@/pages/editor/form-panel';
import styles from './index.module.less';
import PageAction from '@/types/page-action';
import { save } from '@tauri-apps/api/dialog';
import { dirname, join } from '@tauri-apps/api/path';
import ComponentFeature from '@/types/component-feature';
import fileManager from '@/service/file';
import { DataNode } from 'antd/es/tree';
import PanelTab, { PanelType } from '@/pages/editor/panel-tab';
import { ComponentId } from '@/types';
import CompositionPanel from '@/pages/editor/composition-panel';
import { AppStoreContext, DSLStoreContext, EditorPageStoreContext, EditorStoreContext } from '@/hooks/context';
import ComponentSchemaRef from '@/types/component-schema-ref';
import IComponentSchema from '@/types/component.schema';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import { generateContextMenus, isDifferent, isEmpty, isWeb, mapTree } from '@/util';
import { handleTableToClipboard } from '@/util/copy-to-clipoard';
import InsertType from '@/types/insert-type';
import FloatTemplatePanel from '@/pages/editor/float-template-panel';
import { Eye, EyeClose } from '@/components/icon';
import classNames from 'classnames';
import CodePreview from '@/pages/editor/code-preview';
import EditorStore, { ComponentDraggingInfo, DesignMode, NoteItem } from '@/service/editor-store';
import CommentList from './comment-list';
import NewFileManager from '@/service/new-file-manager';
import { reaction, toJS } from 'mobx';
import { detailedDiff } from 'deep-object-diff';
import IPageSchema from '@/types/page.schema';
import debounce from 'lodash/debounce';
import { ErrorBoundary } from 'react-error-boundary';
import DSLStore from '@/service/dsl-store';
import InfiniteContainer, { InfiniteContainerHandle } from '../components/infinite-container';
import PageConfig from './page-config';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ROUTE_NAMES, { HOTKEY_SCOPE, UrlType } from '@/enum';
import { getVoltronMenuList, getVoltronNavigationList, getVoltronNoteList, getVoltronProjectDetail } from '@/api';
import { nanoid } from 'nanoid';
import { NavItem } from './page-config/NavConfig';
import { MenuItem } from './page-config/MenuConfig';
import copyToClipboard from 'copy-to-clipboard';
import copy from 'copy-to-clipboard';
import DslEditor from '@/components/dsl-editor';
import IframeCommunicationService, {
  IframeCommunicationServiceType,
  MessagePayload
} from '@/service/iframe-communication';
import IframeDragOverlay from '@/pages/editor/iframe-drag-overlay';
import DropAnchor from '@/pages/editor/drop-anchor';
import useIframeStore from '@/iframe/store';
import emitter from '@/util/event-emitter';
import HotkeysManager, { HotkeyAction } from '@/service/hotkeys-manager';
import useHotkeysDict from '@/hooks/useHotkeysDict';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { HotkeysEvent } from 'react-hotkeys-hook/packages/react-hotkeys-hook/dist/types';
import { throttle } from 'lodash';
import ComponentTree from '@/pages/editor/component-tree';
import usePageStore from '@/store/usePageStore';
import useProjectStore from '@/store/useProjectStore';
import useDSLFragmentStore from '@/store/useDSLFragment';
import { boundaryDetection, ScrollDirection } from '@/util/boundary-detection';
import SourceEditor from '@/components/source-editor';
import { generatePicByElement } from '@/util/generate-pic';
import NoteDisplay from '@/pages/editor/note-display';
import { observer } from 'mobx-react';
import { useMount } from 'ahooks';
import { ReplaceModal } from '@/components/component-replace-modal';

const lineWidth = 2;
const lineHeight = 2;
// 按照 60hz 帧率控制动作的节流程度
const FRAME_TIME = 17;

const HOTKEY_ACTIONS = [
  HotkeyAction.CANCEL,
  HotkeyAction.SAVE,
  HotkeyAction.UNDO,
  HotkeyAction.REDO,
  HotkeyAction.PREVIEW,
  HotkeyAction.TOGGLE_DESIGN_AND_CODE,
  HotkeyAction.TOGGLE_CANVAS_EXPANSION,
  HotkeyAction.CLEAR_CANVAS,
  HotkeyAction.COPY,
  HotkeyAction.CUT,
  HotkeyAction.PASTE,
  HotkeyAction.REMOVE,
  HotkeyAction.DELETE,
  HotkeyAction.SHARE,
  HotkeyAction.TOGGLE_HIDE,
  HotkeyAction.ZOOM_OUT,
  HotkeyAction.ZOOM_IN,
  HotkeyAction.ZOOM_REVERT
];

let requestAnimationFrameId: number;

export default observer(function Editor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectStore = useProjectStore();
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement>(null);
  const iframeStore = useIframeStore();
  const [leftPanelType, setLeftPanelType] = useState<PanelType>(PanelType.file);
  const [selectedComponentForRenaming, setSelectedComponentForRenaming] = useState<ComponentId>('');
  const [pageWidth, setPageWidth] = useState<number>(PageWidth.wechat);
  const [activePanelTabKey, setActivePanelTabKey] = useState<string>(undefined);
  const [dslStore] = useState<DSLStore>(new DSLStore());
  const [editorStore] = useState<EditorStore>(new EditorStore());
  const [dslEditorOpen, setDslEditorOpen] = useState<boolean>(false);
  const [rollbackDSLOpen, setRollbackDSLOpen] = useState<boolean>(false);
  const [sourceFragmentOpen, setSourceFragmentOpen] = useState<boolean>(false);
  const [replaceModalVisible, setReplaceModalVisible] = useState<boolean>(false);
  const currentMenuContextComponentIdRef = useRef<ComponentId>(null);
  const [outlines, setOutlines] = useState<
    {
      id: ComponentId;
      rect: {
        top: number;
        left: number;
        width: number;
        height: number;
      };
    }[]
  >(null);
  const [dropAnchorStyle, setAnchorStyle] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>(null);

  const projectId = searchParams.get('projectId');
  const showNote = searchParams.get('showNote') === '1';
  const pageStore = usePageStore();
  const appStore = useContext(AppStoreContext);
  const navigate = useNavigate();
  const dslFragmentStore = useDSLFragmentStore();

  const isSavingRef = useRef<boolean>(false);
  const defaultPathRef = useRef<string>('');
  const filePathRef = useRef<string>();
  const insertTargetRef = useRef<ComponentId>(null);
  const insertIndexRef = useRef<number>(-1);
  const iframeCommunicationServiceRef = useRef<IframeCommunicationService>(null);
  const iframeWrapperRef = useRef<HTMLDivElement>(null);

  const { message, modal } = App.useApp();

  const infiniteContainerRef = useRef<InfiniteContainerHandle>(null);

  const [searchValue, setSearchValue] = useState('');

  const hotkeysDict = useHotkeysDict(HOTKEY_ACTIONS);
  const { disableScope, enableScope } = useHotkeysContext();

  useHotkeys(
    Object.keys(hotkeysDict || {}),
    (event: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
      if (hotkeysDict) {
        const hotkey = HotkeysManager.generateHotkey(hotkeysEvent);
        handleHotkeyStroke({
          type: 'hotkeyStroke',
          payload: { action: hotkeysDict[hotkey], hotkey }
        });
      }
    },
    {
      preventDefault: true,
      scopes: [HOTKEY_SCOPE.EDITOR]
    },
    [hotkeysDict]
  );

  useMount(() => {
    enableScope(HOTKEY_SCOPE.EDITOR);
    return () => {
      disableScope(HOTKEY_SCOPE.EDITOR);
    };
  });

  const mousemoveHandler = useCallback(
    (e: MouseEvent, isInIframe = false) => {
      cancelAnimationFrame(requestAnimationFrameId);
      if (!editorStore.componentDraggingInfo) {
        return;
      }
      const tolerance = 4;
      const { initialTop, initialLeft, isMoving } = editorStore.componentDraggingInfo;
      if (
        !isMoving &&
        (Math.abs(e.clientY - initialTop) >= tolerance || Math.abs(e.clientX - initialLeft) > tolerance)
      ) {
        editorStore.setMoving();
      }
      if (isInIframe) {
        const iframeRect = iframeRef.getBoundingClientRect();
        const correction = {
          top: iframeRect.top,
          left: iframeRect.left
        };
        // 禁止鼠标的默认行为，防止选中文字
        e.preventDefault();
        positionDetection(e);
        editorStore.setComponentDraggingCoordinates({
          top: Math.round(e.clientY * (editorStore.scale / 100)) + correction.top,
          left: Math.round(e.clientX * (editorStore.scale / 100)) + correction.left
        });
      } else {
        editorStore.setComponentDraggingCoordinates({
          top: e.clientY,
          left: e.clientX
        });
      }
    },
    [iframeRef]
  );

  useEffect(() => {
    editorStore.setProjectId(searchParams.get('projectId'));
    init().then(() => {
      reaction(
        () => dslStore.selectedComponent?.id,
        () => {
          if (dslStore.selectedComponent?.id) {
            editorStore.setPageConfig(false);
          }
        }
      );
      reaction(
        () => toJS(editorStore.pageConfig.menuConfig),
        (data, oldData) => {
          if (isDifferent(data, oldData)) {
            iframeCommunicationServiceRef?.current?.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'setMenuConfig',
                params: [data]
              }
            });
          }
        }
      );
      reaction(
        () => editorStore.pageConfig.activeKey,
        (data, oldData) => {
          if (isDifferent(data, oldData)) {
            iframeCommunicationServiceRef?.current?.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'setActiveKeyOfPageConfig',
                params: [data]
              }
            });
          }
        }
      );
      reaction(
        () => toJS(dslStore.dsl),
        (dsl, oldDsl) => {
          const { skipAutoSave } = usePageStore.getState();
          if (skipAutoSave) {
            usePageStore.getState().setSkipAutoSave(false);
            return;
          }
          // 如果旧值和新值有一个是空的，不保存
          if (!oldDsl || !dsl) {
            return;
          }
          // 如果两个页面不一样，也不保存
          if (oldDsl.id !== dsl.id) {
            return;
          }
          const diff = detailedDiff(dsl, oldDsl);
          // 如果没有 diff，也不保存
          if (isEmpty(diff.added) && isEmpty(diff.deleted) && isEmpty(diff.updated)) {
            return;
          }
          console.log('自动保存已触发: ', new Date());
          doSaveFile().then();
        },
        {
          fireImmediately: true,
          // 每 0.5 秒自动保存一次，版本颗粒度问题需要高达服务处理下
          delay: 500
        }
      );
      reaction(
        () => toJS(dslStore.dsl),
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          // 同步给 iframe，但不能是初始化
          iframeCommunicationServiceRef?.current?.sendMessageToIframe({
            type: IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD,
            payload: {
              method: 'syncExternalData',
              params: ['dsl', data]
            }
          });
        }
      );
      reaction(() => dslStore.selectedComponent?.id, selectedComponentReaction);
      reaction(
        () => toJS(dslStore.hiddenComponentDict),
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          // 把组件的显隐信息同步下
          iframeCommunicationServiceRef?.current?.sendMessageToIframe({
            type: IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD,
            payload: {
              method: 'setHiddenComponentDict',
              params: [data]
            }
          });
        }
      );
    });
    fetchTemplateData().then();
    dslFragmentStore.getList().then();
  }, [searchParams]);

  const selectedComponentReaction = useCallback(
    (data: ComponentId) => {
      setOutlines((outlines || []).filter(outline => outline.id !== data));
    },
    [outlines]
  );

  useEffect(() => {
    editorStore.setFetchPageList(fetchPageList);
    const resizeListener = debounce(() => {
      // editorStore.updateComponentSizeSketch(editorStore.scale);
      iframeCommunicationServiceRef.current?.sendMessageToIframe({
        type: 'updateComponentSizeSketch',
        payload: {
          scale: editorStore.scale
        }
      });
    }, 16);
    window.addEventListener('resize', resizeListener);

    const handleMouseup = () => {
      editorStore.clearComponentDraggingInfo();
    };
    window.addEventListener('mouseup', handleMouseup);

    return () => {
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('mouseup', handleMouseup);
      iframeCommunicationServiceRef.current.destroyWindow();
    };
  }, []);

  const handleMousemoveInIframe = throttle(e => mousemoveHandler(e, true), FRAME_TIME);
  const handleMousemoveInParent = throttle(e => mousemoveHandler(e), FRAME_TIME);

  function handleMouseoverInIframe(e) {
    e.stopPropagation();
    setHoveredComponent(e.target as HTMLElement);
  }

  function isDraggable(componentFeature: ComponentFeature, componentId: ComponentId) {
    return (
      !dslStore.isInBlackBox(componentId) &&
      [ComponentFeature.container, ComponentFeature.WITH_SLOTS, ComponentFeature.blackBox, ComponentFeature.solid].includes(componentFeature)
    );
  }

  // 自动滚动执行
  const autoScroll = (direction: ScrollDirection, moveDistance: number) => {
    const continueScroll = triggerPageRootScroll(direction, moveDistance);
    if (continueScroll) {
      requestAnimationFrameId = requestAnimationFrame(() => autoScroll(direction, moveDistance));
    } else {
      cancelAnimationFrame(requestAnimationFrameId);
    }
  };

  function triggerPageRootScroll(direction: ScrollDirection, moveDistance: number) {
    let continueScroll = true;
    const pageRoot = iframeRef.contentDocument.querySelector<HTMLDivElement>('[data-voltron-component="PageRoot"]');
    if (!pageRoot) {
      return false;
    }
    const scrollDelta = {
      x: pageRoot.scrollLeft,
      y: pageRoot.scrollTop
    };
    const minScrollDelta = {
      x: 0,
      y: 0
    };
    const maxScrollDelta = {
      x: pageRoot.scrollWidth - pageRoot.clientWidth,
      y: pageRoot.scrollHeight - pageRoot.clientHeight
    };
    switch (direction) {
      case 'top':
        if (scrollDelta.y > minScrollDelta.y) {
          pageRoot.scrollTop = Math.max(scrollDelta.y - moveDistance, minScrollDelta.y);
        } else {
          continueScroll = false;
        }
        break;
      case 'bottom':
        if (scrollDelta.y < maxScrollDelta.y) {
          pageRoot.scrollTop = Math.min(scrollDelta.y + moveDistance, maxScrollDelta.y);
        } else {
          continueScroll = false;
        }
        break;
      default:
        continueScroll = false;
        break;
    }

    return continueScroll;
  }

  function positionDetection(e: MouseEvent) {
    if (!editorStore.componentDraggingInfo) {
      return;
    }
    const componentRoot = findComponentRoot(e.target as HTMLElement);
    if (!componentRoot) {
      return;
    }
    const pageRoot = iframeRef.contentDocument.querySelector<HTMLDivElement>('[data-voltron-component="PageRoot"]');
    if (pageRoot) {
      const domRect = new DOMRect(e.pageX, e.pageY, 0, 0);
      const { isBoundary, direction, moveDistance } = boundaryDetection(domRect, pageRoot);
      if (isBoundary) {
        autoScroll(direction, moveDistance);
      } else {
        cancelAnimationFrame(requestAnimationFrameId);
      }
    }
    handleDrop(componentRoot, { pageX: e.pageX, pageY: e.pageY });
  }

  /**
   * 判断新组件将插入到当前组件内的哪个位置
   *
   * @param mouseCoordinates
   * @param rectInfos
   */
  function calculateInsertPosition(
    mouseCoordinates: { pageX: number; pageY: number },
    rectInfos: {
      top: number;
      right: number;
      bottom: number;
      left: number;
      width: number;
      height: number;
      isVertical: boolean;
      children: {
        top: number;
        right: number;
        bottom: number;
        left: number;
        width: number;
        height: number;
      }[];
    }
  ) {
    const result = {
      position: {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      },
      // -1 表示未被初始化
      index: -1
    };
    /**
     * 处理有子组件的情况
     * 这里需要沿着主轴（由布局方向决定）进行遍历，以垂直布局为例，每遇到一个元素，则比较当前子组件和候选子组件谁离鼠标更近。距离的计算规则是离鼠标较近的那条边。
     * 如果当前子组件距离更近，则将候选子组件更新为当前子组件，否则跳过。
     * 这么做的原因是为了处理多行，且子组件之间间距较大的问题。
     * 遍历完之后，判断鼠标坐标和候选子组件的水平中线高度关系，如果鼠标更高，则插入位置在候选子组件之前，反之则在子组件之后。
     * 处理水平布局的思路和纵向布局一致。
     */
    if (rectInfos.children?.length) {
      if (rectInfos.isVertical) {
        let candidateComponentRect: {
          left: number;
          right: number;
          top: number;
          height: number;
          width: number;
          bottom: number;
          isVertical?: boolean;
        };
        let indexOfCandidateComponent;
        for (let i = 0; i < rectInfos.children.length; i++) {
          const child = rectInfos.children[i];
          const { pageX, pageY } = mouseCoordinates;
          // 位于当前组件的宽度范围内
          if (pageX >= child.left && pageX <= child.right) {
            if (pageY < child.top + child.height / 2) {
              candidateComponentRect = child;
              indexOfCandidateComponent = i;
              break;
            }
          }
        }
        // 开始判断插入位置和光标大小
        // 如果有候选组件，说明不是插到最后边
        if (candidateComponentRect) {
          if (indexOfCandidateComponent === 0) {
            result.position = {
              top: Math.round((candidateComponentRect.top + rectInfos.top) / 2),
              left: candidateComponentRect.left,
              width: candidateComponentRect.width,
              height: lineHeight
            };
          } else {
            result.position = {
              top: Math.round(
                (candidateComponentRect.top + rectInfos.children[indexOfCandidateComponent - 1].bottom) / 2
              ),
              left: candidateComponentRect.left,
              width: candidateComponentRect.width,
              height: lineHeight
            };
          }
          result.index = indexOfCandidateComponent;
        } else {
          // 没有候选组件，插到最后边
          const lastComponent = rectInfos.children[rectInfos.children.length - 1];
          result.position = {
            top: Math.round((lastComponent.bottom + rectInfos.bottom) / 2),
            left: lastComponent.left,
            width: lastComponent.width,
            height: lineHeight
          };
          result.index = rectInfos.children.length;
        }
      } else {
        // 横排的情况
        let candidateComponentRect: {
          left: number;
          right: number;
          top: number;
          height: number;
          width: number;
          bottom: number;
          isVertical?: boolean;
        };
        let indexOfCandidateComponent = 0;
        for (let i = 0; i < rectInfos.children.length; i++) {
          const child = rectInfos.children[i];
          const { pageX, pageY } = mouseCoordinates;
          // 位于当前组件的宽度范围内
          if (pageY >= child.top && pageY <= child.bottom) {
            if (pageX < child.left + child.width / 2) {
              candidateComponentRect = child;
              indexOfCandidateComponent = i;
              break;
            }
          }
        }

        // 开始判断插入位置和光标大小
        // 如果有候选组件，说明不是插到最后边
        if (candidateComponentRect) {
          if (indexOfCandidateComponent === 0) {
            result.position = {
              top: candidateComponentRect.top,
              left: Math.round((candidateComponentRect.left + rectInfos.left) / 2),
              width: lineWidth,
              height: candidateComponentRect.height
            };
          } else {
            result.position = {
              top: candidateComponentRect.top,
              left: Math.round(
                (candidateComponentRect.left + rectInfos.children[indexOfCandidateComponent - 1].right) / 2
              ),
              width: lineWidth,
              height: candidateComponentRect.height
            };
          }
          result.index = indexOfCandidateComponent;
        } else {
          // 没有候选组件，插到最后边
          const lastComponent = rectInfos.children[rectInfos.children.length - 1];
          result.position = {
            top: lastComponent.top,
            left: Math.round((lastComponent.right + rectInfos.right) / 2),
            width: lineWidth,
            height: lastComponent.height
          };
          result.index = rectInfos.children.length;
        }
      }
    } else {
      if (rectInfos.isVertical) {
        // 竖排的情况
        result.position = {
          top: Math.round((rectInfos.top + rectInfos.bottom) / 2),
          left: rectInfos.left,
          width: rectInfos.width,
          height: lineHeight
        };
        result.index = 0;
      } else {
        // 横排的情况
        result.position = {
          top: rectInfos.top,
          left: Math.round((rectInfos.left + rectInfos.right) / 2),
          width: lineWidth,
          height: rectInfos.height
        };
        result.index = 0;
      }
    }
    return result;
  }

  function handleDrop(componentRoot: HTMLElement, mouseCoordinate: { pageX: number; pageY: number }) {
    if (!componentRoot?.dataset) {
      return;
    }
    // 如果是插入图层组件，则强制插入到 page root
    if (editorStore.componentDraggingInfo.isLayer && editorStore.componentDraggingInfo.dndType === 'insert') {
      const pageRootDOM = iframeRef.contentWindow.document.querySelector('[data-voltron-feature=root]') as HTMLElement;
      if (pageRootDOM) {
        const pageRootSize = pageRootDOM.getBoundingClientRect();
        setAnchorStyle({
          top: pageRootSize.top + pageRootSize.height / 2,
          left: pageRootSize.left,
          width: pageRootSize.width,
          height: lineHeight
        });
        insertIndexRef.current = -1;
        insertTargetRef.current = pageRootDOM.dataset.voltronId;
      }
      return;
    }
    const { voltronDroppable, voltronId, voltronDirection } = componentRoot.dataset;
    if (voltronId === editorStore.componentDraggingInfo.id) {
      return;
    }
    if (voltronDroppable && !dslStore.isDescendant(voltronId, editorStore.componentDraggingInfo.id)) {
      const childComponents = dslStore.findChildren(voltronId);
      const hoveredRect = componentRoot.getBoundingClientRect();
      const rectInfo = {
        top: hoveredRect.top,
        right: hoveredRect.right,
        bottom: hoveredRect.bottom,
        left: hoveredRect.left,
        width: hoveredRect.width,
        height: hoveredRect.height,
        isVertical: voltronDirection === 'vertical',
        children: childComponents
          .map(child => {
            const dom = iframeRef.contentWindow.document.querySelector(`[data-voltron-id=${child.id}]`);
            if (!dom) {
              console.error(`无法获取组件${child.id}的DOM节点`);
              return null;
            }
            return dom.getBoundingClientRect() as unknown as {
              top: number;
              right: number;
              bottom: number;
              left: number;
              width: number;
              height: number;
            };
          })
          .filter(child => !!child)
      };
      const result = calculateInsertPosition(mouseCoordinate, rectInfo);
      setAnchorStyle({
        top: result.position.top,
        left: result.position.left,
        width: result.position.width,
        height: result.position.height
      });
      insertIndexRef.current = result.index;
      insertTargetRef.current = voltronId;
    } else {
      // 当前悬停的组件不能拖入，则找到它的父组件，重新执行本函数
      const parentId = dslStore.fetchComponentInDSL(voltronId).parentId;
      if (parentId) {
        handleDrop(iframeRef.contentWindow.document.querySelector(`[data-voltron-id=${parentId}]`), mouseCoordinate);
      }
    }
  }

  function handleMouseoutInIframe(e: MouseEvent) {
    if (!findComponentRoot(e.relatedTarget as HTMLElement)) {
      // 如果移入的元素不在画布里边，就移出hover样式
      editorStore.setHoveredComponentId(null);
      clearInsertInfo();
    }
  }

  function clearInsertInfo() {
    setAnchorStyle(null);
    insertIndexRef.current = -1;
    insertTargetRef.current = null;
  }

  function findAncestors(dom: HTMLElement): {
    id: string;
    rect: { top: number; left: number; width: number; height: number };
  }[] {
    const result = [];
    let node: HTMLElement = dom;
    while (node) {
      const { voltronId, voltronFeature } = node.dataset || {};
      const droppableFeatures = ['root', 'container', 'slot'];
      if (droppableFeatures.includes(voltronFeature)) {
        // const rect = editorStore.getRectInfo(voltronId);
        const rect = node.getBoundingClientRect();
        result.push({
          id: voltronId,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }
        });
      }
      node = node.parentNode as HTMLElement;
    }
    return result.filter(ancestor => ancestor.id !== dslStore.selectedComponent?.id);
  }

  function setHoveredComponent(targetDom: HTMLElement) {
    const componentRoot = findComponentRoot(targetDom);
    if (componentRoot) {
      editorStore.setHoveredComponentId(componentRoot.dataset.voltronId);
      const rect = componentRoot.getBoundingClientRect();
      setOutlines([
        {
          id: componentRoot.dataset.voltronId,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          }
        }
      ]);
    } else {
      editorStore.setHoveredComponentId(null);
      setOutlines(null);
    }
  }

  function findComponentRoot(dom: HTMLElement) {
    let node = dom;
    while (node) {
      if (node.dataset) {
        const { voltronComponent, voltronFeature } = node.dataset;
        // fix: 透明组件不能用来交互，不算组件的根节点
        if (voltronComponent && voltronFeature !== ComponentFeature.transparent) {
          return node;
        }
      }
      node = node.parentNode as HTMLElement;
    }
  }

  function handleMouseupInIframe(e) {
    if (e.button !== 0) {
      return;
    }
    if (!editorStore.componentDraggingInfo?.isMoving) {
      doAfterDrop();
      return;
    }
    // 插入组件
    const { dndType, id, name, dependency, title } = editorStore.componentDraggingInfo;
    if (insertTargetRef.current) {
      try {
        if (dndType === 'insert') {
          dslStore.insertComponent(insertTargetRef.current, name, dependency, insertIndexRef.current);
        } else if (dndType === 'move') {
          dslStore.moveComponent(insertTargetRef.current, id, insertIndexRef.current);
        } else if (dndType === 'insertFragment') {
          dslStore.insertDSLFragment({
            parentId: insertTargetRef.current,
            dsl: title,
            insertIndex: insertIndexRef.current
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    doAfterDrop();
  }

  function doAfterDrop() {
    editorStore.clearComponentDraggingInfo();
    clearInsertInfo();
    cancelAnimationFrame(requestAnimationFrameId);
  }

  function handleMouseDownInIframe(e: MouseEvent) {
    if (e.button !== 0) {
      e.preventDefault();
      return;
    }
    const componentRoot = findComponentRoot(e.target as HTMLElement);
    if (!componentRoot) {
      return;
    }
    const { voltronFeature, voltronId, voltronComponent } = componentRoot.dataset;
    if (isDraggable(voltronFeature as ComponentFeature, voltronId)) {
      editorStore.setComponentDraggingInfo({
        name: voltronComponent,
        isMoving: false,
        isInCanvas: true,
        dndType: 'move',
        id: voltronId,
        top: e.clientY,
        left: e.clientX,
        initialTop: e.clientY,
        initialLeft: e.clientX
      } as ComponentDraggingInfo);
    }
  }

  useEffect(() => {
    if (iframeRef) {
      if (!iframeCommunicationServiceRef.current) {
        iframeCommunicationServiceRef.current = IframeCommunicationService.getInstance(iframeRef.contentWindow, window);
        iframeCommunicationServiceRef.current.addWindowHandler(handleIframeMessage);
      } else {
        // 如果因为重绘导致 iframe 重载，仅更新 iframe
        iframeCommunicationServiceRef.current.setIframeWindow(iframeRef.contentWindow);
      }

      reaction(
        () => toJS(editorStore.componentDraggingInfo),
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (data) {
            iframeCommunicationServiceRef.current?.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'setComponentDraggingInfo',
                params: [toJS(editorStore.componentDraggingInfo)]
              }
            });
          } else {
            iframeCommunicationServiceRef.current?.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'clearComponentDraggingInfo',
                params: []
              }
            });
          }
        }
      );
      window.addEventListener('mousemove', handleMousemoveInParent);
      iframeRef.contentWindow.addEventListener('mousemove', handleMousemoveInIframe);
      iframeRef.contentWindow.addEventListener('mouseover', handleMouseoverInIframe);
      iframeRef.contentWindow.addEventListener('mouseout', handleMouseoutInIframe);
      iframeRef.contentWindow.addEventListener('mouseup', handleMouseupInIframe);
      iframeRef.contentWindow.addEventListener('mousedown', handleMouseDownInIframe);
    }
    return () => {
      window.removeEventListener('mousemove', handleMousemoveInParent);
      iframeRef?.contentWindow?.removeEventListener('mousemove', handleMousemoveInIframe);
      iframeRef?.contentWindow?.removeEventListener('mouseover', handleMouseoverInIframe);
      iframeRef?.contentWindow?.removeEventListener('mouseout', handleMouseoutInIframe);
      iframeRef?.contentWindow?.removeEventListener('mouseup', handleMouseupInIframe);
      iframeRef?.contentWindow?.removeEventListener('mousedown', handleMouseDownInIframe);
    };
  }, [iframeRef]);

  useEffect(() => {
    if (!iframeCommunicationServiceRef.current) {
      return;
    }
    iframeCommunicationServiceRef.current.sendMessageToIframe({
      type: 'updatePageSize',
      payload: {
        width: pageWidth
      }
    });
  }, [pageWidth]);

  function handleIframeMessage(data: MessagePayload) {
    if (!data) {
      console.error('error in handleIframeMessage: ', data);
    }
    switch (data.type) {
      // case 'selectComponent':
      //   handleProjectId(data);
      //   break;
      case 'syncEditorStore':
        syncEditorStore(data);
        break;
      case IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD:
        handleExecuteEditorStoreMethod(data);
        break;
      case IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD:
        handleExecuteDSLStoreMethod(data);
        break;
      case 'initEditorStore':
        handleInitEditorStore();
        break;
      case 'hotkeyStroke':
        handleHotkeyStroke(data);
        break;
      default:
        break;
    }
  }

  function handleExecuteEditorStoreMethod(data: MessagePayload) {
    const { method, params } = data.payload;
    const fn = editorStore[method];
    fn.apply(editorStore, params);
  }

  function handleExecuteDSLStoreMethod(data: MessagePayload) {
    const { method, params } = data.payload;
    const fn = dslStore[method];
    fn.apply(dslStore, params);
  }

  function handleInitEditorStore() {
    iframeCommunicationServiceRef.current.sendMessageToIframe({
      type: 'initEditorStore',
      payload: {
        pageConfig: toJS(editorStore.pageConfig)
      }
    });
  }

  function handleToggleHide() {
    if (!dslStore) {
      return;
    }
    const { id } = dslStore.selectedComponent;
    const toggleMethod = dslStore.isHidden(id) ? dslStore.showComponent : dslStore.hideComponent;
    toggleMethod.call(dslStore, id);
  }

  function handleHotkeyStroke(data: MessagePayload) {
    const { action } = data.payload;
    const ORIGINAL_SCALE = 100;
    switch (action) {
      case HotkeyAction.COPY:
        copySelectedComponent();
        break;
      case HotkeyAction.CUT:
        message.warning('待实现').then();
        break;
      case HotkeyAction.PASTE:
        paste();
        break;
      case HotkeyAction.REMOVE:
      case HotkeyAction.DELETE:
        deleteSelectedComponent();
        break;
      case HotkeyAction.UNDO:
        dslStore.undo();
        break;
      case HotkeyAction.REDO:
        dslStore.redo();
        break;
      case HotkeyAction.PREVIEW:
        redirectToPreview().then();
        break;
      case HotkeyAction.SAVE:
        saveFile();
        break;
      case HotkeyAction.TOGGLE_DESIGN_AND_CODE:
        toggleDesignAndCode();
        break;
      case HotkeyAction.CLEAR_CANVAS:
        dslStore.clearPage();
        break;
      case HotkeyAction.TOGGLE_CANVAS_EXPANSION:
        toggleExpandingCanvas();
        break;
      case HotkeyAction.SHARE:
        handleShare();
        break;
      case HotkeyAction.TOGGLE_HIDE:
        handleToggleHide();
        break;
      case HotkeyAction.ZOOM_IN:
        togglePageScale(editorStore.scale / 2);
        break;
      case HotkeyAction.ZOOM_OUT:
        togglePageScale(editorStore.scale + 100);
        break;
      case HotkeyAction.ZOOM_REVERT:
        togglePageScale(ORIGINAL_SCALE);
        break;
      case HotkeyAction.CANCEL:
        handleCancelSelectingComponent();
        break;
      default:
        message.warning('待实现').then();
        break;
    }
  }

  function syncEditorStore(data: MessagePayload) {
    const { pageConfig } = data.payload;
    editorStore.pageConfig = pageConfig;
  }

  async function init() {
    const pageList = await fetchPageList();
    Promise.allSettled([fetchNav(), fetchMenu()]).then();

    editorStore.setPageConfig(true, 'nav');
    const openedProjectId = searchParams.get('projectId');
    if (pageList.length) {
      const selectedPageId = searchParams.get('pageId');
      if (selectedPageId) {
        editorStore.setSelectedPageId(openedProjectId, selectedPageId);
      } else {
        const openedProjectStr = window.localStorage.getItem('openedProjects');
        if (openedProjectStr) {
          const openedProjects = JSON.parse(openedProjectStr);
          const openedPageId = openedProjects[openedProjectId];
          if (openedPageId) {
            editorStore.setSelectedPageId(openedProjectId, openedPageId);
          } else {
            editorStore.setSelectedPageId(openedProjectId, pageList[0].id);
          }
        } else {
          editorStore.setSelectedPageId(openedProjectId, pageList[0].id);
        }
      }
      openFile().then();
    } else {
      editorStore.removeOpenedPage(openedProjectId);
    }
  }

  async function fetchCommentList() {
    const commentData = await NewFileManager.fetchCommentList(editorStore.selectedPageId);
    editorStore.setCommentList(commentData);
  }

  useEffect(() => {
    pageStore.setCurrentPageId(editorStore.selectedPageId);
    dslStore.setCurrentPageId(editorStore.selectedPageId);
    if (editorStore.selectedPageId) {
      fetchNoteList(editorStore.selectedPageId).then();
      editorStore.setGetNoteList(() => fetchNoteList(editorStore.selectedPageId));
    }
  }, [editorStore.selectedPageId]);

  function copySelectedComponent() {
    if (dslStore.selectedComponent?.id && !dslStore.isPageRoot(dslStore.selectedComponent?.id)) {
      editorStore.setComponentIdForCopy(dslStore.selectedComponent?.id);
      if (dslStore.selectedComponent?.name === 'Table') {
        handleTableToClipboard(dslStore);
      }
      message.success('组件已复制').then();
    }
  }

  function paste() {
    if (dslStore.selectedComponent?.id) {
      dslStore.cloneAndInsertComponent(
        editorStore.componentIdForCopy,
        dslStore.selectedComponent?.id,
        InsertType.insertAfter
      );
    }
  }

  const getProjectDetail = async (projectId: string) => {
    const { data } = await getVoltronProjectDetail({
      projectId
    });
    projectStore.setCurrentProject(data);
  };

  async function fetchPageList(): Promise<PageInfo[]> {
    const projectId = searchParams.get('projectId');
    const pages = await NewFileManager.fetchPages(projectId);
    await getProjectDetail(projectId);
    pageStore.setPageList(pages);
    editorStore.setPageList(pages);
    return pages;
  }

  async function fetchNoteList(pageId: string): Promise<NoteItem[]> {
    editorStore.setIsFetchingNoteList(true);
    // editorStore.setNoteList([]);
    const { data } = await getVoltronNoteList({ pageId });
    const notes = data.list;
    editorStore.setNoteList(notes);
    editorStore.setIsFetchingNoteList(false);
    return notes;
  }

  async function fetchNav() {
    const { data } = await getVoltronNavigationList({ projectId });
    const result: NavItem[] = (data?.list || []).map(i => ({
      label: i.name,
      key: i.id || nanoid(),
      url: i.urlType === UrlType.EXTERNAL_LINK ? i.url : '',
      pageId: i.urlType === UrlType.INTERNAL_LINK ? i.url : '',
      type: i.urlType
    }));
    editorStore.setNavConfig({
      items: result
    });
    return result;
  }

  async function fetchMenu() {
    const { data } = await getVoltronMenuList({ projectId });
    const result = mapTree(data || [], item => {
      return {
        ...item,
        key: String(item.id),
        label: item.name,
        type: item.urlType,
        pageId: item.urlType === UrlType.INTERNAL_LINK ? item.url : '',
        url: item.urlType === UrlType.EXTERNAL_LINK ? item.url : '',
        isLeaf: undefined
      };
    }) as unknown as MenuItem[];
    editorStore.setMenuConfig({
      items: result
    });
    return result;
  }

  function deleteSelectedComponent() {
    if (dslStore.selectedComponent) {
      if (dslStore.isInBlackBox(dslStore.selectedComponent.id)) {
        message.error('该组件位于一个黑盒组件中，无法直接删除，请通过它的父级组件的基础配置项中删除').then();
        return;
      }
      dslStore.deleteComponent(dslStore.selectedComponent.id);
    }
  }

  const saveFile = debounce(() => {
    doSaveFile().then(() => {
      message.success('已保存').then();
    });
  }, 200);

  async function doSaveFile() {
    if (!dslStore.shouldSave) {
      return;
    }
    if (dslStore.shouldSave && editorStore.selectedPageId) {
      // 如果正在保存，延时执行
      if (editorStore.isSaving) {
        const delay = 3000;
        setTimeout(doSaveFile, delay);
        return;
      }
      try {
        editorStore.setIsSaving(true);
        await NewFileManager.savePageDSLFile(editorStore.selectedPageId, dslStore.dsl);
        // 把应该保存的标志状态改为 false;
        dslStore.setShouldSave(false);
        fetchPageList().then();
      } catch (e) {
        console.error(e.stackTrace);
      } finally {
        editorStore.setIsSaving(false);
      }
    }
  }

  async function handleExportingPageCodeFile() {
    const extension = editorStore.framework === 'React' ? 'tsx' : 'vue';
    const formattedContent =
      editorStore.framework === 'React'
        ? (await fileManager.generateReactCode(dslStore.dsl)).pageCode
        : await fileManager.generateVueCode(dslStore.dsl);
    // 创建一个 Blob 对象
    const blob = new Blob([formattedContent], { type: 'text/plain' });
    // 创建一个链接
    const url = URL.createObjectURL(blob);
    // 创建一个下载链接
    const a = document.createElement('a');
    a.href = url;
    // 设置下载文件的名称
    a.download = `index.${extension}`;
    document.body.appendChild(a);
    a.click(); // 触发下载
    // 清理
    document.body.removeChild(a);
    // 释放 Blob URL
    URL.revokeObjectURL(url);
  }

  async function openActiveProject() {
    const activeProject = await NewFileManager.fetchActiveProject();
    appStore.setActiveProject(activeProject);
  }

  async function redirectToPreview() {
    const projectId = searchParams.get('projectId');
    const host = window.location.host;
    window.open(
      `//${host}/voltron${ROUTE_NAMES.PAGE_PREVIEW}?projectId=${projectId}&pageId=${editorStore.selectedPageId}`
    );
  }

  function toggleExpandingCanvas() {
    editorStore.toggleMode(editorStore.mode === DesignMode.edit ? DesignMode.preview : DesignMode.edit);
    editorStore.toggleExpandingCanvas();
  }

  function toggleNote() {
    iframeStore.setIsSwitching(true);
    if (!showNote) {
      searchParams.set('showNote', '1');
      message.success('已进入批注模式').then();
    } else {
      searchParams.set('showNote', '0');
      message.success('已退出批注模式').then();
    }
    setSearchParams(searchParams);
  }

  function toggleDesignAndCode() {
    editorStore.toggleViewMode();
  }

  function togglePageScale(scale: number) {
    editorStore.setScale(scale || 100);
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
        redirectToPreview().then();
        break;
      case PageAction.saveFile:
        saveFile();
        break;
      case PageAction.expandCanvas:
        toggleExpandingCanvas();
        break;
      case PageAction.toggleNote:
        toggleNote();
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
      case PageAction.copyFullSource:
        copySource().then();
        break;
      case PageAction.copyComponentSource:
        copySource(true).then();
        // copySource().then();
        break;
      case PageAction.copyCustomSource:
        openSourceEditor();
        // copySource().then();
        break;
      case PageAction.editDSL:
        openDSLEditor();
        break;
      case PageAction.rollbackDSL:
        openRollbackDSL();
        break;
      case PageAction.SHARE:
        handleShare();
        break;
    }
  }

  function handleShare() {
    const projectId = searchParams.get('projectId');
    const host = window.location.host;
    const protocol = window.location.protocol;
    copy(
      `${protocol}//${host}/voltron${ROUTE_NAMES.PAGE_EDIT}?projectId=${projectId}&pageId=${editorStore.selectedPageId}`
    );
    message.success('链接已复制，获得链接的人可查看').then();
  }

  function openDSLEditor() {
    setDslEditorOpen(true);
  }

  function openRollbackDSL() {
    setRollbackDSLOpen(true);
  }

  function openSourceEditor() {
    setSourceFragmentOpen(true);
  }

  async function copySource(isSimple?: boolean) {
    const { id, configName } = dslStore.dsl.componentIndexes[dslStore.selectedComponent.id];
    const { pageCode: code } = await fileManager.generateReactCode(
      {
        ...dslStore.dsl,
        child: {
          current: id,
          configName,
          isText: false
        }
      },
      {
        simple: isSimple
      }
    );
    if (isSimple) {
      copyToClipboard(code.slice(0, code.length - 2));
    } else {
      copyToClipboard(code);
    }

    message.success('组件源码已复制').then();
  }

  function changePageSize(pageWidth: PageWidth) {
    if (pageWidth === undefined || pageWidth === null) {
      setPageWidth(PageWidth.auto);
      return;
    }
    setPageWidth(pageWidth);
  }

  async function openFile() {
    const { dsl, data } = await NewFileManager.fetchDSLByPageId(editorStore.selectedPageId);
    editorStore.setMenuConfig({
      show: Boolean(data.showMenu)
    });
    if (dsl) {
      if (iframeCommunicationServiceRef.current) {
        iframeCommunicationServiceRef.current.sendMessageToIframe({
          type: 'initDSL',
          payload: {
            dsl
          }
        });
      }
      dslStore.initDSL(dsl as unknown as IPageSchema);
      fetchCommentList().then();
    } else {
      message.error('文件已损坏!');
    }
  }

  const handleSelectingPage = useCallback((page: ({ path: string; name: string; id: string } & DataNode) | null) => {
    // 如果该值为真，标明当前 dsl 还没有等到下一次 reaction，需要强制保存，但是这个操作是有文献性的
    if (dslStore.shouldSave && !isSavingRef.current) {
      // 上锁，防止页面保存中，用户快速切换页面，
      isSavingRef.current = true;
      // 这里用上一个页面的 id
      NewFileManager.savePageDSLFile(editorStore.selectedPageId, toJS(dslStore.dsl))
        .then(() => {
          dslStore.setShouldSave(false);
        })
        .finally(() => {
          isSavingRef.current = false;
        });
    }
    const openedProjectId = searchParams.get('projectId');
    editorStore.setSelectedPageId(openedProjectId, page.id);
    // dslStore.initDSL();
    openFile().then();
  }, []);

  const handleTogglePanel = useCallback((type: PanelType) => {
    setLeftPanelType(type);
  }, []);

  const handleCancelSelectingComponent = useCallback(() => {
    dslStore.unselectComponent();
  }, []);

  const handleOnSearch = useCallback(v => setSearchValue(v), []);

  const handleSelectingComponent = useCallback((componentId: ComponentId) => {
    dslStore.selectComponent(componentId);
    iframeCommunicationServiceRef?.current?.sendMessageToIframe({
      type: 'selectComponent',
      payload: {
        componentId
      }
    });
    iframeCommunicationServiceRef?.current?.sendMessageToIframe({
      type: 'scrollIntoView',
      payload: {
        componentId
      }
    });
    editorStore.setPageConfig(false);
  }, []);

  // 收藏组件/模块
  async function handleFavoriteComponent(componentId: ComponentId, type: 'component' | 'module') {
    const target = iframeRef.contentDocument.querySelector<HTMLElement>(`[data-voltron-id="${componentId}"]`);

    const componentName = dslStore.dsl.componentIndexes[componentId].name;
    const componentDisplayName = dslStore.dsl.componentIndexes[componentId].displayName || componentName;
    const projectName = projectStore.currentProject?.name;
    const pageName = editorStore.selectPage?.name;
    const dslName = `${componentDisplayName || componentName}(${projectName}_${pageName})`;
    const dsl = dslStore.filterDSLByComponentId(componentId, {
      deep: type === 'module'
    });
    let compName = dslName;
    modal.confirm({
      title: '收藏',
      content: (
        <Flex align="center">
          <span style={{ width: 80 }}>组件名:</span>
          <Input
            style={{ width: '100%' }}
            defaultValue={compName}
            onChange={val => {
              compName = val.target.value?.trim?.();
            }}
          ></Input>
        </Flex>
      ),
      onOk: async () => {
        if (!compName) {
          message.error('组件名不能为空');
          return Promise.reject();
        }
        const file = await generatePicByElement(target, { filename: compName });
        const coverBatchKey = await NewFileManager.uploadImage(file);
        const batchKey = await NewFileManager.uploadDSLFile(JSON.stringify(dsl));
        dslFragmentStore.addItem({
          category: 0,
          coverUrl: coverBatchKey,
          name: compName,
          url: batchKey
        });
        message.success(`已收藏: ${compName}`);
      },
      onCancel: () => {
        //
      }
    });
  }

  // 打开替换组件弹窗
  function openReplaceComponentDialog(componentId: ComponentId) {
    currentMenuContextComponentIdRef.current = componentId;
    setReplaceModalVisible(true);
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
          dslStore.cloneAndInsertComponent(componentIdForClone, componentId, InsertType.insertBefore);
        }
        break;
      case InsertType.insertAfter:
        if (componentIdForClone) {
          dslStore.cloneAndInsertComponent(componentIdForClone, componentId, InsertType.insertAfter);
        }
        break;
      case InsertType.insertInFirst:
        if (componentIdForClone) {
          dslStore.cloneAndInsertComponent(componentIdForClone, componentId, InsertType.insertInFirst);
        }
        break;
      case InsertType.insertInLast:
        if (componentIdForClone) {
          dslStore.cloneAndInsertComponent(componentIdForClone, componentId, InsertType.insertInLast);
        }
        break;
      case 'rename':
        handleSelectingComponentForRenaming(componentId);
        break;
      case 'delete':
        dslStore.deleteComponent(componentId);
        break;
      case 'exportModule':
        handleFavoriteComponent(componentId, 'module');
        break;
      case 'exportComponent':
        handleFavoriteComponent(componentId, 'component');
        break;
      case 'hide':
        dslStore?.hideComponent(componentId);
        break;
      case 'show':
        dslStore?.showComponent(componentId);
        break;
      case 'replaceComponent':
        openReplaceComponentDialog(componentId);
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
          className={styles.eyeClose}
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

  function highlight(text: string, searchValue = '') {
    if (!searchValue?.trim()) return text;
    const regExp = new RegExp(searchValue, 'ig');
    // const matchText = text.match(regExp)?.[0] ?? searchValue;
    return text.replace(regExp, (match: string) => {
      return `<span style="background: yellow;">${match}</span>`;
    });
  }

  /**
   * 由于技术上文字节点具有特殊性（会被当作文字组件的 children props 处理），故不会在组件树里出现
   */
  const componentTreeData = useMemo(() => {
    if (!dslStore.dsl) {
      return [];
    }
    const renderTreeNodeTitle = (componentSchema: IComponentSchema, searchValue = '') => {
      const { id, feature } = componentSchema;
      const titleClassName = classNames({
        [styles.componentTitle]: true,
        [styles.selected]: dslStore?.selectedComponent?.id === id
      });
      const strTitle = componentSchema.displayName || componentSchema.name;
      const title = (
        <>
          <span dangerouslySetInnerHTML={{ __html: highlight(strTitle, searchValue) }}></span>
          <span
            style={{ fontSize: 12, color: '#9499A0' }}
            dangerouslySetInnerHTML={{ __html: highlight(`（${componentSchema.id}）`, searchValue) }}
          ></span>
        </>
      );
      return (
        <ComponentContextMenu
          data={componentSchema}
          onClick={handleClickDropDownMenu}
          items={generateContextMenus(feature, !dslStore.isHidden(id), editorStore.hasCopiedComponent)}
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
              <Tooltip title={`${strTitle}(${componentSchema.id})`} placement="rightTop">
                <div
                  onDoubleClick={() => handleSelectingComponentForRenaming(id)}
                  className={styles.componentTitleView}
                  style={{ color: dslStore.isHidden(id) ? '#C9CCD0' : undefined }}
                >
                  {title}
                </div>
              </Tooltip>
            )}
            {renderDisplayControlBtn(componentSchema)}
          </div>
        </ComponentContextMenu>
      );
    };

    const recursiveMap = (data: ComponentSchemaRef[]) => {
      return data
        .filter((item: ComponentSchemaRef) => !item.isText)
        .map((item: ComponentSchemaRef) => {
          const componentSchema = dsl.componentIndexes[item.current];
          const node = {
            key: componentSchema.id,
            title: renderTreeNodeTitle(componentSchema, searchValue),
            name: componentSchema.displayName,
            children: undefined,
            isLeaf: undefined
          };
          // 组件内的插槽也需要加到 children 里
          const children = dslStore.findNonSlotDescendant(componentSchema.id).map(cmp => {
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
  }, [
    searchValue,
    selectedComponentForRenaming,
    dslStore?.dsl,
    dslStore?.selectedComponent?.id,
    Object.keys(dslStore.hiddenComponentDict).join('')
  ]);

  const handleChangingProject = useCallback(() => {
    fetchPageList().then();
  }, []);

  const handleDeletingPage = useCallback(() => {
    init().then();
  }, [searchParams]);

  const handleExportTemplate = useCallback(() => {
    fetchTemplateData().then();
  }, []);

  async function fetchTemplateData() {
    await appStore.fetchTemplates();
  }

  /**
   * 渲染项目的文件目录，当前文件的组件树
   */
  const renderProjectPanel = () => {
    return (
      <>
        <PagePanel
          data={editorStore.pageList as any}
          onSelect={handleSelectingPage}
          onExportTemplate={handleExportTemplate}
          onChange={handleChangingProject}
          onDelete={handleDeletingPage}
        />
        {editorStore.mode !== DesignMode.comment ? (
          <div className={styles.componentTree}>
            <ComponentTree
              showSearch
              data={componentTreeData}
              onSelect={handleSelectingComponent}
              searchValue={searchValue}
              onCancelSelect={handleCancelSelectingComponent}
              onSearch={handleOnSearch}
            />
          </div>
        ) : null}
      </>
    );
  };

  /**
   * 渲染模板、组件托盘
   */
  const renderComponentPanel = useCallback(() => {
    if (editorStore.mode === DesignMode.comment) {
      return null;
    }
    return <CompositionPanel onChangeTab={setActivePanelTabKey} activeKey={activePanelTabKey} />;
  }, [activePanelTabKey]);

  /**
   * 渲染左侧托盘
   */
  const renderLeftPanel = () => {
    switch (leftPanelType) {
      case PanelType.file:
        return renderProjectPanel();
      case PanelType.component:
        return renderComponentPanel();
      default:
        return null;
    }
  };

  function renderDesignSection() {
    const canvasClass = classNames({
      [styles.canvasInner]: true,
      [styles.comment]: editorStore.mode === DesignMode.comment
    });
    /**
     * 判断是否停止画布的onWheel事件
     *
     * 停止条件：
     * 1. 当前滚动区域在菜单上
     * 2. 菜单包含滚动条
     * 3. 菜单当前是否滚动到边界（目前菜单滚动到边界也不会触发onWheel事件。若开启 checkScrollInRange，则菜单滚动到边界后，会触发画布的onWheel事件）
     */
    const stopWheel = (e: WheelEvent) => {
      const menuContentContainer = document.querySelector('.page-menu-wrapper .ant-pro-menu-rc-menu-container');
      if (!menuContentContainer) return false;
      const menuContent = menuContentContainer.querySelector('ul.ant-menu.ant-menu-root');
      const isWheelOnMenu = menuContentContainer.contains(e.target as HTMLElement);
      const containerHeight = menuContentContainer.clientHeight;
      const contentHeight = menuContent.clientHeight;
      const menuHasScroll = containerHeight < contentHeight;
      const checkScrollInRange = false;
      const scrollOutRange =
        (e.deltaY < 0 && menuContentContainer.scrollTop === 0) ||
        (e.deltaY > 0 && contentHeight - containerHeight === menuContentContainer.scrollTop);
      return isWheelOnMenu && menuHasScroll && ((checkScrollInRange && !scrollOutRange) || !checkScrollInRange);
    };

    const handleIframeOnload = useCallback(() => {
      if (!iframeRef || !editorStore?.selectedPageId) {
        return;
      }
      emitter.emit('onEditorLoad', iframeRef);
      iframeStore.setIframe(iframeRef);
      iframeStore.setIframeDocument(iframeRef.contentDocument);
      iframeStore.setIframeWindow(iframeRef.contentWindow);
      const timer = setInterval(() => {
        const pageRoot = iframeRef.contentDocument.querySelector<HTMLDivElement>('[data-voltron-component="PageRoot"]');
        if (pageRoot) {
          iframeStore.setIsSwitching(false);
          iframeStore.setPageRoot(pageRoot);
          clearInterval(timer);
        }
      }, 800);

      if (editorStore.selectedPageId) {
        openFile().then();
      }
    }, [editorStore?.selectedPageId, iframeRef]);

    function renderIframeDragOverlay() {
      const { top, left, isMoving } = editorStore.componentDraggingInfo || {};
      if (isMoving) {
        return <IframeDragOverlay top={top} left={left} />;
      }
      return null;
    }

    return (
      <>
        <div className={styles.draggableArea}>
          <div
            className={styles.panel}
            style={editorStore?.leftPanelVisible ? undefined : { width: 0, overflow: 'hidden' }}
          >
            {renderLeftPanel()}
          </div>
          <div className={styles.canvas}>
            <div id="canvasRoot" className={canvasClass}>
              {editorStore.selectedPageId ? (
                <InfiniteContainer
                  openDrawer={editorStore.showNote}
                  showPointer={editorStore.mode === DesignMode.edit}
                  ref={infiniteContainerRef}
                  scale={editorStore.scale}
                  origin={editorStore.scaleOrigin}
                  pageWidth={pageWidth}
                  stopWheel={stopWheel}
                >
                  <div
                    ref={iframeWrapperRef}
                    className={styles.iframeWrapper}
                    style={{
                      width: pageWidth || '100%'
                    }}
                  >
                    <iframe
                      src="/voltron-dnd/"
                      ref={setIframeRef}
                      onLoad={handleIframeOnload}
                      height="100%"
                      width="100%"
                    />
                    <DropAnchor style={dropAnchorStyle} />
                  </div>
                  <NoteDisplay pageWidth={pageWidth} />
                </InfiniteContainer>
              ) : (
                // <PageRenderer mode="edit" scale={scale} pageWidth={pageWidth} />
                <Empty />
              )}
            </div>
            {renderMoreTemplatePanel()}
          </div>
        </div>
        {renderIframeDragOverlay()}
        <div
          className={classNames(styles.formPanel, {
            [styles['page-config']]: editorStore?.pageConfig?.open
          })}
          style={editorStore?.rightPanelVisible ? undefined : { width: 0, overflow: 'hidden' }}
        >
          {renderRightPanel()}
        </div>
      </>
    );
  }

  function renderRightPanel() {
    switch (editorStore.mode) {
      case DesignMode.preview:
        return null;
      case DesignMode.comment:
        return (
          <ErrorBoundary fallback={<div>CommentList Error</div>}>
            <CommentList />
          </ErrorBoundary>
        );
      default:
        // if (!dslStore.selectedComponent?.id) {
        if (editorStore.pageConfig.open) {
          return <PageConfig />;
        }
        return <FormPanel />;
    }
  }

  function renderCodeSection() {
    return <CodePreview />;
  }

  async function onApplyTemplate(templateUrl: string) {
    const dsl = await NewFileManager.fetchDSL(templateUrl);
    dslStore.initDSLFromTemplate(dsl as unknown as IPageSchema);
  }

  function renderMoreTemplatePanel() {
    if (!dslStore?.isEmpty) {
      return null;
    }
    return <FloatTemplatePanel onApplyTemplate={onApplyTemplate} />;
  }

  const editorPageMethod = {
    fetchNav,
    fetchMenu
  };

  useEffect(() => {
    infiniteContainerRef.current?.reset();
  }, [editorStore.mode]);

  useEffect(() => {
    editorStore.toggleNote(showNote);
  }, [showNote]);

  function closeDslEditor() {
    setDslEditorOpen(false);
  }

  function closeSourceEditor() {
    setSourceFragmentOpen(false);
  }

  const checkSelectedComponentBounded = (
    { componentId, scale }: { componentId: string; scale: number },
    misplacedCallback?: () => void
  ) => {
    try {
      if (!componentId) return;
      const { x, y, width, height } = editorStore.getRectInfo(componentId);
      const el = document.getElementById(componentId);
      if (!el) {
        return;
      }
      const {
        x: actualX,
        y: actualY,
        width: actualWidth,
        height: actualHeight
      } = el.children[0].getBoundingClientRect();
      if (
        (x !== undefined && x !== actualX) ||
        (y !== undefined && y !== actualY) ||
        (width !== undefined && width !== actualWidth) ||
        (height !== undefined && height !== actualHeight)
      ) {
        // console.log('----------------');
        // console.log('错位组件', {componentId,
        //   scale,});
        // console.table({
        //   x: { '渲染位置': x, '实际位置': actualX },
        //   y: { '渲染位置': y, '实际位置': actualY },
        //   width: { '渲染位置': width, '实际位置': actualWidth },
        //   height: { '渲染位置': height, '实际位置': actualHeight },
        // });
        // console.log('----------------');
        misplacedCallback?.();
      }
    } catch (e) {
      console.error('checkSelectedComponentBounded error');
      console.error(e);
    }
  };

  useEffect(() => {
    if (dslStore.selectedComponent?.id) {
      checkSelectedComponentBounded({ componentId: dslStore.selectedComponent?.id, scale: editorStore.scale }, () => {
        // editorStore.updateComponentSizeSketch(editorStore.scale);
        // iframeCommunicationServiceRef.current.sendMessageToIframe({
        //   type: 'updateComponentSizeSketch',
        //   payload: {
        //     scale: editorStore.scale
        //   }
        // });
      });
    }
  }, [dslStore.selectedComponent?.id, editorStore.scale, iframeRef]);

  return (
    <EditorPageStoreContext.Provider value={{ editorPageMethod }}>
      <EditorStoreContext.Provider value={editorStore}>
        <DSLStoreContext.Provider value={dslStore}>
          {/* {contextHolder} */}
          <div className={styles.editor} style={{ height: isWeb() ? '100vh' : undefined }}>
            <div className={styles.topBar}>
              {editorStore.viewMode === 'design' ? (
                <PanelTab type={leftPanelType} onSelect={handleTogglePanel} />
              ) : null}
              <Toolbar onDo={handleOnDo} pageWidth={pageWidth} projectId={appStore.activeProject?.id} />
            </div>
            <div
              className={styles.editArea}
              style={editorStore.viewMode !== 'design' ? { display: 'none' } : undefined}
            >
              {renderDesignSection()}
            </div>
            <div
              className={styles.editArea}
              style={editorStore.viewMode === 'design' ? { display: 'none' } : undefined}
            >
              {renderCodeSection()}
            </div>
            {/*{editorStore.commentOpen ? <CommentEditor onSave={handleSavingComment} /> : null}*/}
          </div>
          <DslEditor open={dslEditorOpen} onClose={closeDslEditor} />
          <SourceEditor open={sourceFragmentOpen} onClose={closeSourceEditor} />
          <ReplaceModal />
        </DSLStoreContext.Provider>
      </EditorStoreContext.Provider>
    </EditorPageStoreContext.Provider>
  );
});
