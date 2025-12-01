import React, { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import PageRenderer from '@/pages/components/page-renderer';
import { DSLStoreContext, EditorStoreContext, IframeCommunicationContext } from '@/hooks/context';
import IframeCommunicationService, {
  IframeCommunicationServiceType,
  MessagePayload
} from '@/service/iframe-communication';
import DSLStore from '@/service/dsl-store';
import EditorStore, { DesignMode } from '@/service/editor-store';
import { reaction, toJS } from 'mobx';
import ComponentManager from '@/service/component-manager';
import { observer } from 'mobx-react';
import { findComponentRoot, generateContextMenus, isDifferent } from '@/util';
import { useMount } from 'ahooks';
import { uniqueId } from 'lodash';
import HotkeysManager, { HotkeyAction } from '@/service/hotkeys-manager';
import useHotkeysDict from '@/hooks/useHotkeysDict';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { HotkeysEvent } from 'react-hotkeys-hook/packages/react-hotkeys-hook/dist/types';
import { HOTKEY_SCOPE } from '@/enum';
import '@/styles.css';
import { App } from 'antd';
import IComponentSchema from '@/types/component.schema';
import { ComponentId } from '@/types';
import ComponentFeature from '@/types/component-feature';
import classnames from 'classnames';

import styles from './index.module.less';
import ComponentContextMenu from '@/pages/editor/component-context-menu';

// 帧时间，让mobx reaction 同步的频率接近 FPS 60
const FRAME_TIME = 16;

export default observer(function IframeCanvas() {
  const [dslStore] = useState<DSLStore>(new DSLStore());
  const [editorStore] = useState<EditorStore>(new EditorStore());

  const { message } = App.useApp();

  const [iframeCommunicationService, setIframeCommunicationService] = useState<IframeCommunicationService>(null);
  const [componentConfigInitialized, setComponentConfigInitialized] = useState<boolean>(false);
  const [renderKey, setRenderKey] = useState(uniqueId());
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);
  const [selectedComponentForRenaming, setSelectedComponentForRenaming] = useState<ComponentId>('');
  const [componentForContextMenu, setComponentForContextMenu] = useState<IComponentSchema>(null);
  const componentToDeleteRef = useRef<IComponentSchema>(null);

  const selectedComponentForContextMenuRef = useRef<IComponentSchema>(null);

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

  const hotkeysDict = useHotkeysDict(HOTKEY_ACTIONS);

  const { disableScope, enableScope } = useHotkeysContext();

  useHotkeys(
    Object.keys(hotkeysDict || {}),
    (event: KeyboardEvent, hotkeysEvent: HotkeysEvent) => {
      if (hotkeysDict) {
        const hotkey = HotkeysManager.generateHotkey(hotkeysEvent);
        if (hotkeysDict) {
          iframeCommunicationService?.sendMessageToParent({
            type: 'hotkeyStroke',
            payload: { action: hotkeysDict[hotkey], hotkey }
          });
        }
      }
    },
    {
      scopes: [HOTKEY_SCOPE.CANVAS],
      preventDefault: true
    },
    [hotkeysDict]
  );

  useMount(() => {
    // 激活编辑器快捷键场景
    enableScope(HOTKEY_SCOPE.EDITOR);

    ComponentManager.init()
      .then(() => {
        setComponentConfigInitialized(true);
        // 管理器初始化完成后再增加iframe通信，否则会因为缺失组件配置导致渲染异常
        const iframeCommunicationService = IframeCommunicationService.getInstance(window, window.top);
        iframeCommunicationService.addIframeHandler(handleParentMessage);
        setIframeCommunicationService(iframeCommunicationService);
      })
      .catch(() => {
        setComponentConfigInitialized(false);
      });

    return () => {
      // 卸载时取消快捷键场景
      disableScope(HOTKEY_SCOPE.EDITOR);
    };
  });

  useEffect(() => {
    if (!componentForContextMenu && componentToDeleteRef.current) {
      dslStore.deleteComponent(componentToDeleteRef.current.id);
      componentToDeleteRef.current = null;
    }
  }, [componentForContextMenu]);

  useEffect(() => {
    if (iframeCommunicationService) {
      reaction(
        () => toJS(dslStore?.selectedComponent),
        (data, oldData) => {
          if (dslStore?.isSyncing) {
            return;
          }
          if (!isDifferent(data, oldData)) {
            return;
          }
          if (data) {
            iframeCommunicationService.sendMessageToParent({
              type: IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD,
              payload: {
                method: 'selectComponent',
                params: [data.id]
              }
            });
          }
        },
        {
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
          if (data) {
            iframeCommunicationService.sendMessageToParent({
              type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
              payload: {
                method: 'syncExternalData',
                params: ['pageConfig', data]
              }
            });
          }
        },
        {
          delay: FRAME_TIME
        }
      );

      reaction(
        () => toJS(dslStore?.dsl),
        (data, oldData) => {
          if (dslStore?.isSyncing) {
            return;
          }
          if (!isDifferent(data, oldData)) {
            return;
          }
          iframeCommunicationService.sendMessageToParent({
            type: IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD,
            payload: {
              method: 'syncExternalData',
              params: ['dsl', data]
            }
          });
        },
        {
          delay: FRAME_TIME
        }
      );
    }
    return () => {
      iframeCommunicationService?.destroyIframe();
    };
  }, [iframeCommunicationService]);

  function handleParentMessage(data: MessagePayload) {
    switch (data.type) {
      case 'initDSL':
        handleInitDSL(data);
        break;
      case 'setDSL':
        handleSetDSL(data);
        break;
      case 'updatePageSize':
        updatePageSize(data);
        break;
      case 'updateCommentList':
        handleUpdateCommentList(data);
        break;
      case 'scrollIntoView':
        scrollIntoView(data);
        break;
      case 'selectComponent':
        selectComponent(data);
        break;
      case 'syncEditorStore':
        updateEditorStore(data);
        break;
      case IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD:
        executeEditorStoreMethod(data);
        break;
      case IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD:
        executeDSLStoreMethod(data);
        break;
      case 'initEditorStore':
        handleInitEditorStore(data);
        break;
      default:
        break;
    }
  }

  function handleInitEditorStore(data: MessagePayload) {
    const { pageConfig } = data.payload;
    editorStore.initPageConfig(pageConfig);
  }

  function executeEditorStoreMethod(data: MessagePayload) {
    const { method, params } = data.payload;
    editorStore[method](...params);
  }

  function executeDSLStoreMethod(data: MessagePayload) {
    const { method, params } = data.payload;
    dslStore[method](...params);
  }

  function updateEditorStore(data: MessagePayload) {
    const { scale, pageConfig } = data.payload;
    editorStore.setScale(scale);
    editorStore.pageConfig = pageConfig;
  }

  function handleUpdateCommentList(data: MessagePayload) {
    const { commentList } = data.payload;
    editorStore.setCommentList(commentList);
  }

  function selectComponent(data: MessagePayload) {
    const { componentId } = data.payload;
    dslStore.selectComponent(componentId);
  }

  function scrollIntoView(data: MessagePayload) {
    const { componentId } = data.payload;
    // 隐藏组件不响应滚动
    if (dslStore.isHiddenOrInHiddenAncestor(componentId)) {
      return;
    }
    const dom = document.querySelector(`[data-ditto-id=${componentId}]`);
    if (!dom) {
      console.error('不存在的组件：', componentId);
      return;
    }
    dom.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleInitDSL(data: MessagePayload) {
    const { dsl } = data.payload;
    dslStore.initDSL(dsl);
    // initDSL(data.pageId);
  }

  function handleSetDSL(data: MessagePayload) {
    const { dsl } = data.payload;
    dslStore.setDSL(dsl);
  }

  function updatePageSize(data: MessagePayload) {
    const { pageWidth } = data.payload;
    editorStore.setPageWidth(pageWidth);
  }

  function reloadPageRender() {
    setRenderKey(uniqueId());
  }

  (window as any).reloadPageRender = reloadPageRender;

  function handleContextMenu(e: MouseEvent) {
    const componentRoot = findComponentRoot(e.target as HTMLElement);
    if (componentRoot) {
      const { voltronId } = componentRoot.dataset || {};
      if (voltronId) {
        selectedComponentForContextMenuRef.current = dslStore.fetchComponentInDSL(voltronId);
        setComponentForContextMenu(dslStore.fetchComponentInDSL(voltronId));
        setContextMenuOpen(true);
      } else {
        selectedComponentForContextMenuRef.current = null;
        setComponentForContextMenu(null);
        setContextMenuOpen(false);
      }
    } else {
      selectedComponentForContextMenuRef.current = null;
      setComponentForContextMenu(null);
      setContextMenuOpen(false);
    }
  }

  function handleMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      setContextMenuOpen(false);
    }
  }

  function fetchAncestorComponents() {
    if (!componentForContextMenu || componentForContextMenu.feature === ComponentFeature.root) {
      return [];
    }
    return dslStore
      .fetchAncestors(componentForContextMenu.id)
      .filter(
        component => component.feature !== ComponentFeature.transparent && component.feature !== ComponentFeature.slot
      )
      .map(component => {
        return {
          title: component.displayName,
          key: component.id
        };
      });
  }

  const generateContextMenuPlus = useCallback(() => {
    if (!componentForContextMenu) {
      return [];
    }
    const menuItems = generateContextMenus(componentForContextMenu.feature, true, !!editorStore.componentIdForCopy);
    const result = [...menuItems];
    // 去除重命名
    result[0].splice(1, 1);
    const ancestors = fetchAncestorComponents();
    if (ancestors.length) {
      result.unshift([{ key: 'selectAncestor', title: '选择祖先节点', children: ancestors }]);
    }
    return result;
  }, [componentForContextMenu]);

  function openReplaceComponentDialog(componentId: ComponentId) {
    iframeCommunicationService.sendMessageToParent({
      type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
      payload: {
        method: 'showReplaceModal',
        params: [componentId]
      }
    });
  }

  function handleSelectingComponentForRenaming(componentId: ComponentId) {
    setSelectedComponentForRenaming(componentId);
  }

  function syncDataToParent(key: string, val: any) {
    iframeCommunicationService.sendMessageToParent({
      type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
      payload: {
        method: 'syncExternalData',
        params: [key, val]
      }
    });
  }

  function executeDslStoreMethodInParent(methodName: string, params: string[]) {
    iframeCommunicationService.sendMessageToParent({
      type: IframeCommunicationServiceType.EXECUTE_DSL_STORE_METHOD,
      payload: {
        method: methodName,
        params
      }
    });
  }

  function handleClickDropDownMenu(key: string, componentSchema: IComponentSchema, keyPath: string[]) {
    setContextMenuOpen(false);
    const componentIdForClone = editorStore.componentIdForCopy;
    const { id: componentId } = componentSchema;
    switch (keyPath[keyPath.length - 1]) {
      case 'copy':
        syncDataToParent('componentIdForCopy', componentId);
        break;
      case 'insert':
        if (componentIdForClone) {
          executeDslStoreMethodInParent('cloneAndInsertComponent', [componentIdForClone, componentId, keyPath[0]]);
          syncDataToParent('componentIdForCopy', null);
          editorStore.setComponentIdForCopy(null);
        }
        break;
      case 'rename':
        handleSelectingComponentForRenaming(componentId);
        break;
      case 'delete':
        componentToDeleteRef.current = componentForContextMenu;
        setComponentForContextMenu(null);
        executeDslStoreMethodInParent('deleteComponent', [componentToDeleteRef.current.id]);
        break;
      case 'exportModule':
        // handleFavoriteComponent(componentId, 'module');
        iframeCommunicationService.sendMessageToParent({
          type: IframeCommunicationServiceType.SAVE_FAVORITE,
          payload: {
            componentId,
            type: 'module'
          }
        });
        break;
      case 'exportComponent':
        // handleFavoriteComponent(componentId, 'component');
        iframeCommunicationService.sendMessageToParent({
          type: IframeCommunicationServiceType.SAVE_FAVORITE,
          payload: {
            componentId,
            type: 'component'
          }
        });
        break;
      case 'hide':
        executeDslStoreMethodInParent('hideComponent', [componentId]);
        break;
      case 'replaceWithBusinessComponent':
        openReplaceComponentDialog(componentId);
        break;
      case 'selectAncestor':
        executeDslStoreMethodInParent('selectComponent', [keyPath[0]]);
        break;
      default:
        break;
    }
  }

  const handleClickingHistoryMode = useCallback(() => {
    if (editorStore.mode === DesignMode.HISTORY) {
      message.warning('当前模式为历史版本模式，如需编辑请关闭历史版本模式').then();
    }
  }, [editorStore.mode]);

  function renderContent() {
    if (!componentConfigInitialized) {
      return null;
    }
    if (editorStore.mode === DesignMode.edit) {
      return (
        <ComponentContextMenu
          data={componentForContextMenu}
          items={generateContextMenuPlus()}
          onClick={handleClickDropDownMenu}
          open={contextMenuOpen}
        >
          <div
            onContextMenu={handleContextMenu}
            onMouseUp={handleMouseUp}
            style={editorStore.componentDraggingInfo ? { userSelect: 'none' } : undefined}
          >
            <PageRenderer key={renderKey} />
          </div>
        </ComponentContextMenu>
      );
    }
    return (
      <div
        className={classnames({ [styles.historyMode]: editorStore.mode === DesignMode.HISTORY })}
        onClick={handleClickingHistoryMode}
      >
        <PageRenderer key={renderKey} />
      </div>
    );
  }

  return (
    <IframeCommunicationContext.Provider value={iframeCommunicationService}>
      <EditorStoreContext.Provider value={editorStore}>
        <DSLStoreContext.Provider value={dslStore}>{renderContent()}</DSLStoreContext.Provider>
      </EditorStoreContext.Provider>
    </IframeCommunicationContext.Provider>
  );
});
