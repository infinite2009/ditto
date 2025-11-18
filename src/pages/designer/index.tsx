import LeftToolbar from '@/pages/designer/components/left-toolbar';
import RightToolbar from '@/pages/designer/components/right-toolbar';
import CenterToolbar from '@/pages/designer/components/center-toolbar';

import styles from './index.module.less';
import {
  AppStoreContext,
  DSLStoreContext,
  EditorPageStoreContext,
  EditorStoreContext,
  IframeCommunicationContext
} from '@/hooks/context';
import EditorStore, { ComponentDraggingInfo, DesignMode, NoteItem } from '@/service/editor-store';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import DSLStore from '@/service/dsl-store';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VerticalToolbar from '@/pages/designer/components/vertical-toolbar';
import LeftPanel from '@/pages/designer/components/left-panel';
import IframeCommunicationService, {
  IframeCommunicationServiceType,
  MessagePayload
} from '@/service/iframe-communication';
import DropAnchor from '@/pages/editor/drop-anchor';
import emitter from '@/util/event-emitter';
import useIframeStore from '@/iframe/store';
import NewFileManager from '@/service/new-file-manager';
import IPageSchema from '@/types/page.schema';
import { Empty, message } from 'antd';
import { reaction, toJS } from 'mobx';
import { isDifferent, isEmpty, isWeb, mapTree } from '@/util';
import FloatTemplatePanel from '@/pages/editor/float-template-panel';
import InfiniteContainer, { InfiniteContainerHandle } from '@/pages/components/infinite-container';
import { observer } from 'mobx-react';
import PageAction from '@/types/page-action';
import { PageActionEvent, PageWidth } from '@/pages/editor/toolbar';
import fileManager from '@/service/file';
import copyToClipboard from 'copy-to-clipboard';
import copy from 'copy-to-clipboard';
import { dirname, join } from '@tauri-apps/api/path';
import { save } from '@tauri-apps/api/dialog';
import ROUTE_NAMES, { HOTKEY_SCOPE, UrlType } from '@/enum';
import { PageInfo, ProjectInfo } from '@/types/app-data';
import debounce from 'lodash/debounce';
import { getVoltronMenuList, getVoltronNavigationList, getVoltronNoteList, getVoltronProjectDetail } from '@/api';
import usePageStore from '@/store/usePageStore';
import useProjectStore from '@/store/useProjectStore';
import DslEditor from '@/components/dsl-editor';
import SourceEditor from '@/components/source-editor';
import HotkeysManager, { HotkeyAction } from '@/service/hotkeys-manager';
import { handleTableToClipboard } from '@/util/copy-to-clipoard';
import InsertType from '@/types/insert-type';
import { throttle } from 'lodash';
import ComponentFeature from '@/types/component-feature';
import { ComponentId } from '@/types';
import { boundaryDetection, ScrollDirection } from '@/util/boundary-detection';
import IframeDragOverlay from '@/pages/editor/iframe-drag-overlay';
import { NavItem } from '@/pages/editor/page-config/NavConfig';
import { nanoid } from 'nanoid';
import { MenuItem } from '@/pages/editor/page-config/MenuConfig';
import { detailedDiff } from 'deep-object-diff';
import useDSLFragmentStore from '@/store/useDSLFragment';
import useHotkeysDict from '@/hooks/useHotkeysDict';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { HotkeysEvent } from 'react-hotkeys-hook/packages/react-hotkeys-hook/dist/types';
import { useMount } from 'ahooks';
import CodePreview from '@/pages/editor/code-preview';
import NoteDisplay from '@/pages/editor/note-display';
import classnames from 'classnames';
import PageConfig from '@/pages/editor/page-config';
import FormPanel from '@/pages/editor/form-panel';
import { ReplaceModal } from '@/components/component-replace-modal';
import { RenderWithoutRollbackMode } from '../components/RenderWithoutRollbackMode';
import { HistoryList, RollbackHeader } from './components/history-list';
import { twMerge } from 'tailwind-merge';
import VariableConfig from '@/pages/components/variable-config';
import ActionConfig from '@/pages/components/action-config';

const LINE_WIDTH = 2;
const LINE_HEIGHT = 2;
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

function Designer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const showNote = searchParams.get('showNote') === '1';
  const iframeStore = useIframeStore();
  const infiniteContainerRef = useRef<InfiniteContainerHandle>(null);
  const filePathRef = useRef<string>();
  const defaultPathRef = useRef<string>('');
  const insertTargetRef = useRef<ComponentId>(null);
  const insertIndexRef = useRef<number>(-1);

  const navigate = useNavigate();

  const appStore = useContext(AppStoreContext);
  const [editorStore] = useState<EditorStore>(new EditorStore());
  const [dslStore] = useState<DSLStore>(new DSLStore());
  const dslFragmentStore = useDSLFragmentStore();

  const projectStore = useProjectStore();
  const pageStore = usePageStore();
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [iframeCommunicationService, setIframeCommunicationService] = useState<IframeCommunicationService>(null);
  const [dropAnchorStyle, setDropAnchorStyle] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  }>(null);
  const [dslEditorOpen, setDslEditorOpen] = useState<boolean>(false);
  const [sourceFragmentOpen, setSourceFragmentOpen] = useState<boolean>(false);

  const hotkeysDict = useHotkeysDict(HOTKEY_ACTIONS);
  const { disableScope, enableScope } = useHotkeysContext();

  const editorPageMethod = {
    fetchNav,
    fetchMenu
  };

  useEffect(() => {
    editorStore.toggleNote(showNote);
  }, [showNote]);

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
    init().then();
    enableScope(HOTKEY_SCOPE.EDITOR);
    return () => {
      disableScope(HOTKEY_SCOPE.EDITOR);
    };
  });

  useEffect(() => {
    infiniteContainerRef.current?.reset();
  }, [editorStore.mode]);

  useEffect(() => {
    if (editorStore?.selectedPageId) {
      openFile().then();
    }
  }, [editorStore?.selectedPageId]);

  useEffect(() => {
    iframeCommunicationService?.addWindowHandler(handleMessageFromIframe);
    return () => {
      iframeCommunicationService?.destroyWindow();
    };
  }, [iframeCommunicationService]);

  useEffect(() => {
    // fix: location.origin 初始值是字符串 null !
    if (iframeRef) {
      editorStore.setIframeDocument(iframeRef.contentDocument);
      window.addEventListener('mousemove', handleMousemoveInParent);
      iframeRef.contentWindow.addEventListener('mousemove', handleMousemoveInIframe);
      iframeRef.contentWindow.addEventListener('mouseout', handleMouseoutInIframe);
      iframeRef.contentWindow.addEventListener('mouseup', handleMouseupInIframe);
      iframeRef.contentWindow.addEventListener('mousedown', handleMouseDownInIframe);

      if (iframeRef?.contentWindow?.location?.origin !== 'null') {
        const service = IframeCommunicationService.getInstance(iframeRef.contentWindow, window);
        setIframeCommunicationService(service);
        service.sendMessageToIframe({
          type: IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD,
          payload: {
            method: 'initDSL',
            params: [toJS(dslStore?.dsl)]
          }
        });
        service.sendMessageToIframe({
          type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
          payload: {
            method: 'syncExternalData',
            params: ['pageConfig', toJS(editorStore.pageConfig)]
          }
        });
      }
    }

    return () => {
      window.removeEventListener('mousemove', handleMousemoveInParent);
      iframeRef?.contentWindow?.removeEventListener('mousemove', handleMousemoveInIframe);
      iframeRef?.contentWindow?.removeEventListener('mouseout', handleMouseoutInIframe);
      iframeRef?.contentWindow?.removeEventListener('mouseup', handleMouseupInIframe);
      iframeRef?.contentWindow?.removeEventListener('mousedown', handleMouseDownInIframe);
    };
  }, [iframeRef, iframeRef?.contentWindow?.location?.origin]);

  useEffect(() => {
    if (iframeLoaded && iframeCommunicationService && editorStore?.selectedPageId) {
      reaction(
        () => editorStore.selectedPageId,
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (data) {
            iframeCommunicationService.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'setSelectedPageId',
                params: [data]
              }
            });
          }
        }
      );
      reaction(
        () => editorStore.projectId,
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (data) {
            iframeCommunicationService.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'setProjectId',
                params: [data]
              }
            });
          }
        }
      );
      reaction(
        () => toJS(editorStore.selectedComponentLib),
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (data) {
            iframeCommunicationService.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'setSelectedComponentLib',
                params: [data]
              }
            });
          }
        }
      );
      reaction(
        () => toJS(editorStore.componentDraggingInfo),
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (editorStore.isSyncing) {
            return;
          }
          if (data) {
            iframeCommunicationService.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'syncExternalData',
                params: ['componentDraggingInfo', data]
              }
            });
          } else {
            iframeCommunicationService.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'syncExternalData',
                params: ['componentDraggingInfo', null]
              }
            });
          }
        },
        {
          delay: FRAME_TIME
        }
      );
      reaction(
        () => toJS(editorStore?.componentIdForCopy),
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (editorStore?.isSyncing) {
            return;
          }
          if (data) {
            iframeCommunicationService.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'syncExternalData',
                params: ['componentIdForCopy', data]
              }
            });
          }
        }
      );
      reaction(
        () => toJS(dslStore?.selectedComponent),
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (dslStore?.isSyncing) {
            return;
          }
          if (data) {
            editorStore.setPageConfig(false);
            iframeCommunicationService.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD,
              payload: {
                method: 'syncExternalData',
                params: ['selectedComponent', data]
              }
            });
          }
        },
        {
          fireImmediately: true,
          delay: FRAME_TIME
        }
      );
      reaction(
        () => toJS(dslStore?.dsl),
        (dsl, oldDsl) => {
          if (!isDifferent(dsl, oldDsl)) {
            return;
          }
          if (dslStore?.isSyncing) {
            return;
          }
          if (dsl) {
            iframeCommunicationService.sendMessageToIframe({
              type: IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD,
              payload: {
                method: 'syncExternalData',
                params: ['dsl', dsl]
              }
            });
          }
        },
        {
          fireImmediately: true,
          delay: FRAME_TIME
        }
      );
      reaction(
        () => toJS(editorStore.pageConfig),
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (editorStore?.isSyncing) {
            return;
          }
          iframeCommunicationService?.sendMessageToIframe({
            type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
            payload: {
              method: 'syncExternalData',
              params: ['pageConfig', data]
            }
          });
        },
        {
          fireImmediately: true,
          delay: FRAME_TIME
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
          dslStore.setShouldSave(true);
          doSaveFile().then();
        },
        {
          fireImmediately: true,
          // 每 0.5 秒自动保存一次，版本颗粒度问题需要高达服务处理下
          delay: 500
        }
      );
      reaction(
        () => toJS(dslStore.hiddenComponentDict),
        (data, oldData) => {
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (dslStore?.isSyncing) {
            return;
          }
          // 把组件的显隐信息同步下
          iframeCommunicationService?.sendMessageToIframe({
            type: IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD,
            payload: {
              method: 'syncExternalData',
              params: ['hiddenComponentDict', data]
            }
          });
        },
        {
          fireImmediately: true,
          delay: FRAME_TIME
        }
      );
    }
  }, [iframeCommunicationService, iframeLoaded]);

  useEffect(() => {
    editorStore.setProjectId(searchParams.get('projectId'));
    dslFragmentStore.getList().then();
  }, [searchParams]);

  useEffect(() => {
    const resizeListener = debounce(() => {
      // editorStore.updateComponentSizeSketch(editorStore.scale);
      iframeCommunicationService?.sendMessageToIframe({
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
      iframeCommunicationService?.destroyWindow();
    };
  }, []);

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
    } else {
      editorStore.removeOpenedPage(openedProjectId);
    }
  }

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

  const handleCancelSelectingComponent = useCallback(() => {
    dslStore.unselectComponent();
  }, []);

  const handleMousemoveInIframe = throttle(e => mousemoveHandler(e, true), FRAME_TIME);
  const handleMousemoveInParent = throttle(e => mousemoveHandler(e), FRAME_TIME);

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

  function handleDrop(componentRoot: HTMLElement, mouseCoordinate: { pageX: number; pageY: number }) {
    if (!componentRoot?.dataset) {
      return;
    }
    // 如果是插入图层组件，则强制插入到 page root
    if (editorStore.componentDraggingInfo.isLayer && editorStore.componentDraggingInfo.dndType === 'insert') {
      const pageRootDOM = iframeRef.contentWindow.document.querySelector('[data-voltron-feature=root]') as HTMLElement;
      if (pageRootDOM) {
        const pageRootSize = pageRootDOM.getBoundingClientRect();
        setDropAnchorStyle({
          top: pageRootSize.top + pageRootSize.height / 2,
          left: pageRootSize.left,
          width: pageRootSize.width,
          height: LINE_HEIGHT
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
    const EDGE_DETECTION_OFFSET = 6;
    if (voltronDroppable && !dslStore.isDescendant(voltronId, editorStore.componentDraggingInfo.id)) {
      const hoveredRect = editorStore.getRectInfo(voltronId);
      const { pageX, pageY } = mouseCoordinate;
      // 先找到父组件备用
      const parent = dslStore.fetchParentComponentInDSL(voltronId);
      if (parent) {
        // 获取父组件的容器方向，决定锚点的方向
        const parentDirection = (
          iframeRef.contentDocument.querySelector(`[data-voltron-id=${parent.id}]`) as HTMLElement
        )?.dataset?.voltronDirection;
        if (parentDirection === 'vertical') {
          // 父容器是垂直容器，则检测上下边缘
          if (pageY <= hoveredRect.top + EDGE_DETECTION_OFFSET) {
            // 判定为鼠标接触了上边缘，视为试图插入当前组件的前边
            insertTargetRef.current = parent.id;
            insertIndexRef.current = dslStore.findIndex(voltronId, true);
            setDropAnchorStyle({
              top: hoveredRect.top,
              left: hoveredRect.left,
              width: hoveredRect.width,
              height: LINE_HEIGHT
            });
            return;
          }
          if (pageY >= hoveredRect.bottom - EDGE_DETECTION_OFFSET) {
            // 判定为鼠标接触了下边缘，视为试图插入当前组件的后边
            insertTargetRef.current = parent.id;
            insertIndexRef.current = dslStore.findIndex(voltronId, true) + 1;
            setDropAnchorStyle({
              top: hoveredRect.bottom,
              left: hoveredRect.left,
              width: hoveredRect.width,
              height: LINE_HEIGHT
            });
            return;
          }
        }
        if (parentDirection !== 'vertical') {
          // 父容器是垂直容器，则检测上下边缘
          if (pageX <= hoveredRect.left + EDGE_DETECTION_OFFSET) {
            // 判定为鼠标接触了左边缘，视为试图插入当前组件的前边
            insertTargetRef.current = parent.id;
            insertIndexRef.current = dslStore.findIndex(voltronId, true);
            setDropAnchorStyle({
              top: hoveredRect.top,
              left: hoveredRect.left,
              width: LINE_WIDTH,
              height: hoveredRect.height
            });
            return;
          }
          if (pageX >= hoveredRect.right - EDGE_DETECTION_OFFSET) {
            // 判定为鼠标接触了下边缘，视为试图插入当前组件的后边
            insertTargetRef.current = parent.id;
            insertIndexRef.current = dslStore.findIndex(voltronId, true) + 1;
            setDropAnchorStyle({
              top: hoveredRect.bottom,
              left: hoveredRect.left,
              width: LINE_WIDTH,
              height: hoveredRect.height
            });
            return;
          }
        }
      }
      insertTargetRef.current = voltronId;
      // 找到当前组件的子组件，遍历它们以找到插入位置
      const childComponents = dslStore.findChildren(voltronId).filter(cmp => !dslStore.isHidden(cmp.id));
      const child = childComponents.find(item => {
        const rect = editorStore.getRectInfo(item.id);
        if (!rect) {
          return false;
        }
        return (
          (pageY < rect.top + EDGE_DETECTION_OFFSET && voltronDirection === 'vertical') ||
          (pageX < rect.left + EDGE_DETECTION_OFFSET && voltronDirection !== 'vertical')
        );
      });
      if (child) {
        const childIndex = dslStore.findIndex(child.id, true);
        insertIndexRef.current = childIndex;
        const childRect = editorStore.getRectInfo(child.id);
        if (childIndex === 0) {
          if (voltronDirection === 'vertical') {
            setDropAnchorStyle({
              top: Math.round((hoveredRect.top + childRect.top) / 2),
              left: childRect.left,
              width: childRect.width,
              height: LINE_HEIGHT
            });
            return;
          }
          setDropAnchorStyle({
            top: childRect.top,
            left: Math.round((hoveredRect.left + childRect.left) / 2),
            width: LINE_WIDTH,
            height: childRect.height
          });
          return;
        }
        const preRect = editorStore.getRectInfo(childComponents[childIndex - 1].id);
        if (preRect) {
          if (voltronDirection === 'vertical') {
            setDropAnchorStyle({
              top: Math.round((preRect.bottom + childRect.top) / 2),
              left: childRect.left,
              width: childRect.width,
              height: LINE_HEIGHT
            });
            return;
          }
          setDropAnchorStyle({
            top: childRect.top,
            left: Math.round((preRect.right + childRect.left) / 2),
            width: LINE_WIDTH,
            height: childRect.height
          });
          return;
        }
        return;
      }
      // 没有 child 或者排在最后边的情况
      insertIndexRef.current = -1;
      if (childComponents.length) {
        const lastRect = editorStore.getRectInfo(childComponents[childComponents.length - 1].id);
        if (voltronDirection === 'vertical') {
          setDropAnchorStyle({
            top: Math.round((lastRect.bottom + hoveredRect.bottom) / 2),
            left: lastRect.left,
            width: lastRect.width,
            height: LINE_HEIGHT
          });
          return;
        }
        setDropAnchorStyle({
          top: lastRect.top,
          left: Math.round((lastRect.right + hoveredRect.right) / 2),
          width: LINE_WIDTH,
          height: lastRect.height
        });
        return;
      }
      if (voltronDirection === 'vertical') {
        setDropAnchorStyle({
          top: Math.round((hoveredRect.top + hoveredRect.bottom) / 2),
          left: hoveredRect.left,
          width: hoveredRect.width,
          height: LINE_HEIGHT
        });
        return;
      }
      setDropAnchorStyle({
        top: hoveredRect.top,
        left: Math.round((hoveredRect.left + hoveredRect.right) / 2),
        width: LINE_WIDTH,
        height: hoveredRect.height
      });
      return;
    }
    // 当前悬停的组件不能拖入，则找到它的父组件，重新执行本函数
    const parentId = dslStore.fetchComponentInDSL(voltronId).parentId;
    if (parentId) {
      handleDrop(iframeRef.contentWindow.document.querySelector(`[data-voltron-id=${parentId}]`), mouseCoordinate);
    }
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
              height: LINE_HEIGHT
            };
          } else {
            result.position = {
              top: Math.round(
                (candidateComponentRect.top + rectInfos.children[indexOfCandidateComponent - 1].bottom) / 2
              ),
              left: candidateComponentRect.left,
              width: candidateComponentRect.width,
              height: LINE_HEIGHT
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
            height: LINE_HEIGHT
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
              width: LINE_WIDTH,
              height: candidateComponentRect.height
            };
          } else {
            result.position = {
              top: candidateComponentRect.top,
              left: Math.round(
                (candidateComponentRect.left + rectInfos.children[indexOfCandidateComponent - 1].right) / 2
              ),
              width: LINE_WIDTH,
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
            width: LINE_WIDTH,
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
          height: LINE_HEIGHT
        };
        result.index = 0;
      } else {
        // 横排的情况
        result.position = {
          top: rectInfos.top,
          left: Math.round((rectInfos.left + rectInfos.right) / 2),
          width: LINE_WIDTH,
          height: rectInfos.height
        };
        result.index = 0;
      }
    }
    return result;
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
    editorStore.resetRectInfo();
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

  function handleMouseoutInIframe(e: MouseEvent) {
    if (!findComponentRoot(e.relatedTarget as HTMLElement)) {
      // 如果移入的元素不在画布里边，就移出hover样式
      editorStore.setHoveredComponentId(null);
      clearInsertInfo();
    }
  }

  function clearInsertInfo() {
    setDropAnchorStyle(null);
    insertIndexRef.current = -1;
    insertTargetRef.current = null;
  }

  function isDraggable(componentFeature: ComponentFeature, componentId: ComponentId) {
    return (
      !dslStore.isInBlackBox(componentId) &&
      [
        ComponentFeature.container,
        ComponentFeature.WITH_SLOTS,
        ComponentFeature.blackBox,
        ComponentFeature.solid
      ].includes(componentFeature)
    );
  }

  function syncEditorStore(data: MessagePayload) {
    const { pageConfig } = data.payload;
    editorStore.pageConfig = pageConfig;
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
    iframeCommunicationService.sendMessageToIframe({
      type: 'executeEditorMethod',
      payload: {
        method: 'syncExternalData',
        params: ['pageConfig', toJS(editorStore.pageConfig)]
      }
    });
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

  function handleMessageFromIframe(data: MessagePayload) {
    if (!data) {
      console.error('error in handleIframeMessage: ', data);
    }
    switch (data.type) {
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

  // import React from 'react';
  // import { Button } from '@bilibili/ui';
  // export default function Index() {
  //   return (
  //     <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
  //       <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
  //         <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
  //           <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
  //             <Button style={{ padding: 8 }}>按钮</Button>
  //             <Button style={{ padding: 8 }}>按钮</Button>
  //             <Button style={{ padding: 8 }}>按钮</Button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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

  async function fetchOpenedProjects() {
    const openProjects = await NewFileManager.fetchOpenedProjects();
    appStore.setOpenedProjects(openProjects);
  }

  function toggleExpandingCanvas() {
    editorStore.toggleMode(editorStore.mode === DesignMode.edit ? DesignMode.preview : DesignMode.edit);
    editorStore.toggleExpandingCanvas();
  }

  async function redirectToPreview() {
    const projectId = searchParams.get('projectId');
    const host = window.location.host;
    window.open(
      `//${host}/voltron${ROUTE_NAMES.PAGE_PREVIEW}?projectId=${projectId}&pageId=${editorStore.selectedPageId}`
    );
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

  const saveFile = debounce(() => {
    doSaveFile().then(() => {
      message.success('已保存').then();
    });
  }, 200);

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

  function openDSLEditor() {
    setDslEditorOpen(true);
  }

  function openRollbackDSL() {
    // 切换到设计模式
    editorStore.toDesignViewMode();
    // 切换到回滚模式
    editorStore.toggleMode(DesignMode.rollback);
  }

  function openSourceEditor() {
    setSourceFragmentOpen(true);
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

  function changePageSize(pageWidth: PageWidth) {
    if (pageWidth === undefined || pageWidth === null) {
      editorStore.setPageWidth(PageWidth.auto);
      return;
    }
    editorStore.setPageWidth(pageWidth);
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

  async function openFile() {
    if (!editorStore.selectedPageId) {
      return;
    }
    const { dsl, data } = await NewFileManager.fetchDSLByPageId(editorStore.selectedPageId);
    editorStore.setMenuConfig({
      show: Boolean(data.showMenu)
    });
    if (dsl) {
      dslStore.initDSL(dsl as unknown as IPageSchema);
    } else {
      message.error('文件已损坏!');
    }
  }

  const handleIframeOnload = useCallback(() => {
    setIframeLoaded(true);
    if (!iframeRef) {
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
  }, [iframeRef]);

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

  /**
   * 判断是否停止画布的onWheel事件
   *
   * 停止条件：
   * 1. 当前滚动区域在菜单上
   * 2. 菜单包含滚动条
   * 3. 菜单当前是否滚动到边界（目前菜单滚动到边界也不会触发onWheel事件。若开启 checkScrollInRange，则菜单滚动到边界后，会触发画布的onWheel事件）
   */
  const stopWheel = useCallback(
    (e: WheelEvent) => {
      const menuContentContainer = iframeRef?.contentDocument?.querySelector(
        '.page-menu-wrapper .ant-pro-menu-rc-menu-container'
      );
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
    },
    [iframeRef]
  );

  function closeDslEditor() {
    setDslEditorOpen(false);
  }

  function closeSourceEditor() {
    setSourceFragmentOpen(false);
  }

  function renderIframeDragOverlay() {
    const { top, left, isMoving } = editorStore.componentDraggingInfo || {};
    if (isMoving) {
      return <IframeDragOverlay top={top} left={left} />;
    }
    return null;
  }

  function renderFormPanel() {
    if (editorStore.pageConfig.open) {
      return <PageConfig />;
    }
    return <FormPanel />;
  }

  function renderDesignSection() {
    return (
      <div
        className={twMerge(styles.bodyContainer, 'flex-1 h-0')}
        style={editorStore.viewMode !== 'design' ? { display: 'none' } : undefined}
      >
        <div
          className={styles.leftPanelWrapper}
          style={editorStore?.leftPanelVisible ? undefined : { width: 0, overflow: 'hidden' }}
        >
          <LeftPanel />
        </div>
        <div className={styles.centerPanel}>
          <div
            id="canvasRoot"
            className={classnames({
              [styles.canvas]: true,
              [styles.annotation]: editorStore.mode === DesignMode.comment
            })}
          >
            {editorStore.selectedPageId ? (
              <InfiniteContainer
                openDrawer={editorStore.showNote}
                showPointer={editorStore.mode === DesignMode.edit}
                ref={infiniteContainerRef}
                scale={editorStore.scale}
                origin={editorStore.scaleOrigin}
                pageWidth={editorStore?.pageWidth}
                stopWheel={stopWheel}
              >
                <div
                  className={styles.iframeWrapper}
                  style={{
                    width: editorStore?.pageWidth || '100%'
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
                <NoteDisplay pageWidth={editorStore?.pageWidth} />
              </InfiniteContainer>
            ) : (
              // <PageRenderer mode="edit" scale={scale} pageWidth={pageWidth} />
              <Empty />
            )}
          </div>
        </div>
        <RenderWithoutRollbackMode renderWithRollbackMode={<HistoryList />}>
          <div
            className={styles.rightPanelWrapper}
            style={editorStore?.rightPanelVisible ? undefined : { width: 0, overflow: 'hidden' }}
          >
            <VerticalToolbar />
            <div className={styles.formPanelWrapper}>{renderFormPanel()}</div>
          </div>
        </RenderWithoutRollbackMode>
      </div>
    );
  }

  function renderCodeSection() {
    return (
      <div className={styles.bodyContainer} style={editorStore.viewMode === 'design' ? { display: 'none' } : undefined}>
        <CodePreview />
      </div>
    );
  }

  return (
    <EditorPageStoreContext.Provider value={{ editorPageMethod }}>
      <IframeCommunicationContext.Provider value={iframeCommunicationService}>
        <EditorStoreContext.Provider value={editorStore}>
          <DSLStoreContext.Provider value={dslStore}>
            <div className={styles.designer}>
              <RenderWithoutRollbackMode renderWithRollbackMode={<RollbackHeader />}>
                <div className={styles.toolBarContainer}>
                  <div
                    className={styles.leftToolbarWrapper}
                    style={editorStore?.leftPanelVisible ? undefined : { width: 0 }}
                  >
                    <LeftToolbar pageName={projectStore?.currentProject?.name} onDo={handleOnDo} />
                  </div>
                  <CenterToolbar onDo={handleOnDo} />
                  <div
                    className={styles.rightToolbarWrapper}
                    style={editorStore?.rightPanelVisible ? undefined : { width: 0 }}
                  >
                    <RightToolbar onDo={handleOnDo} projectId={projectId} />
                  </div>
                </div>
              </RenderWithoutRollbackMode>
              {renderDesignSection()}
              {renderCodeSection()}
              {renderMoreTemplatePanel()}
              {renderIframeDragOverlay()}
            </div>
            <DslEditor open={dslEditorOpen} onClose={closeDslEditor} />
            <SourceEditor open={sourceFragmentOpen} onClose={closeSourceEditor} />
            <ReplaceModal />
            <VariableConfig />
            <ActionConfig />
          </DSLStoreContext.Provider>
        </EditorStoreContext.Provider>
      </IframeCommunicationContext.Provider>
    </EditorPageStoreContext.Provider>
  );
}

Designer.displayName = 'Designer';

export default observer(Designer);
