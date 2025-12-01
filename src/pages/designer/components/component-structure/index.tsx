import { observer } from 'mobx-react';
import { Eye, EyeClose, SearchIcon } from '@/components/icon';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DSLStoreContext, EditorStoreContext, IframeCommunicationContext } from '@/hooks/context';
import ComponentFeature from '@/types/component-feature';
import IComponentSchema from '@/types/component.schema';

import styles from './index.module.less';
import ComponentTree from '@/pages/editor/component-tree';
import classNames from 'classnames';
import classnames from 'classnames';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import { generateContextMenus } from '@/util';
import { App, Flex, Input, Tooltip } from 'antd';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { ComponentId } from '@/types';
import InsertType from '@/types/insert-type';
import { generatePicByElement } from '@/util/generate-pic';
import NewFileManager from '@/service/new-file-manager';
import useDSLFragmentStore from '@/store/useDSLFragment';
import useProjectStore from '@/store/useProjectStore';
import { toJS } from 'mobx';
import { IframeCommunicationServiceType, MessagePayload } from '@/service/iframe-communication';

type ComponentViewType = 'container' | 'component';

function ComponentStructure() {
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);
  const iframeCommunicationService = useContext(IframeCommunicationContext);

  const projectStore = useProjectStore();
  const dslFragmentStore = useDSLFragmentStore();

  const currentMenuContextComponentIdRef = useRef<ComponentId>(null);

  const { message, modal } = App.useApp();

  const [replaceModalVisible, setReplaceModalVisible] = useState<boolean>(false);
  const [selectedComponentForRenaming, setSelectedComponentForRenaming] = useState<ComponentId>('');
  const [viewType, setViewType] = useState<ComponentViewType>('container');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>(null);

  useEffect(() => {
    iframeCommunicationService?.addWindowHandler(handleMessageFromIframe);
    return () => {
      iframeCommunicationService?.removeWindowHandler(handleMessageFromIframe);
    };
  }, [iframeCommunicationService]);

  function handleMessageFromIframe(message: MessagePayload) {
    switch (message.type) {
      case IframeCommunicationServiceType.SAVE_FAVORITE:
        handleFavoriteComponent(message.payload.componentId, message.payload.type).then();
        break;
      default:
        break;
    }
  }

  function handleSelectingContainer(componentId: ComponentId) {
    dslStore.selectComponent(componentId);
    iframeCommunicationService?.sendMessageToIframe({
      type: 'scrollIntoView',
      payload: {
        componentId
      }
    });
  }

  function renderContainerList() {
    return Object.values(dslStore?.dsl?.componentIndexes || {})
      .filter((componentSchema: IComponentSchema) => {
        return (componentSchema.feature === ComponentFeature.container ||
          componentSchema.feature === ComponentFeature.root) &&
            (!keyword || componentSchema.displayName.indexOf(keyword) > -1);
      })
      .map((containerSchema, index) => {
        return (
          <div
            key={containerSchema.id}
            className={classnames({
              [styles.container]: true,
              [styles.selected]: containerSchema.id === dslStore?.selectedComponent?.id
            })}
            onClick={() => handleSelectingContainer(containerSchema.id)}
          >
            <span className={styles.order}>{index + 1}</span>
            <p className={styles.containerName}>{containerSchema.displayName}</p>
          </div>
        );
      });
  }

  const handleCancelSelectingComponent = useCallback(() => {
    dslStore.unselectComponent();
  }, []);

  /**
   * 由于技术上文字节点具有特殊性（会被当作文字组件的 children props 处理），故不会在组件树里出现
   */
  const componentTreeData = useMemo(() => {
    if (!dslStore.dsl) {
      return [];
    }
    const renderTreeNodeTitle = (componentSchema: IComponentSchema, searchValue = '') => {
      const { id, feature, displayName, name } = componentSchema;
      const titleClassName = classNames({
        [styles.componentTitle]: true,
        [styles.selected]: dslStore?.selectedComponent?.id === id
      });
      const strTitle = displayName || name;
      const title = (
        <>
          <span dangerouslySetInnerHTML={{ __html: highlight(strTitle, searchValue) }}></span>
          <span
            style={{ fontSize: 12, color: '#9499A0' }}
            dangerouslySetInnerHTML={{ __html: highlight(`（${id}）`, searchValue) }}
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
                defaultValue={displayName}
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
              <Tooltip title={`${strTitle}(${id})`} placement="rightTop">
                <div
                  onDoubleClick={() => handleSelectingComponentForRenaming(id)}
                  className={styles.componentTitleView}
                  style={{ color: dslStore.isHidden(id) ? '#C9CCD0' : undefined }}
                  onClick={() => handleClickingComponentTitle(id)}
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
            title: renderTreeNodeTitle(componentSchema, keyword),
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
    const result = recursiveMap([dsl.child]);
    return result;
  }, [
    selectedComponentForRenaming,
    toJS(dslStore?.dsl?.componentIndexes),
    dslStore?.selectedComponent?.id,
    Object.keys(dslStore.hiddenComponentDict).join(''),
    keyword
  ]);

  const handleSelectingComponent = useCallback((componentId: ComponentId) => {
    dslStore.selectComponent(componentId);
    // iframeCommunicationService?.sendMessageToIframe({
    //   type: 'selectComponent',
    //   payload: {
    //     componentId
    //   }
    // });
    editorStore.setPageConfig(false);
  }, []);

  function highlight(text: string, searchValue = '') {
    if (!searchValue?.trim()) return text;
    const regExp = new RegExp(searchValue, 'ig');
    // const matchText = text.match(regExp)?.[0] ?? searchValue;
    return text.replace(regExp, (match: string) => {
      return `<span style="background: yellow;">${match}</span>`;
    });
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
        handleFavoriteComponent(componentId, 'module').then();
        break;
      case 'exportComponent':
        handleFavoriteComponent(componentId, 'component').then();
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

  function handleClickingComponentTitle(componentId: ComponentId) {
    iframeCommunicationService?.sendMessageToIframe({
      type: 'scrollIntoView',
      payload: {
        componentId
      }
    });
  }

  // 打开替换组件弹窗
  function openReplaceComponentDialog(componentId: ComponentId) {
    currentMenuContextComponentIdRef.current = componentId;
    setReplaceModalVisible(true);
  }

  function handleRenamingComponent(componentId: ComponentId, newName: string) {
    dslStore.renameComponent(componentId, newName);
    setSelectedComponentForRenaming('');
  }

  async function handleFavoriteComponent(componentId: ComponentId, type: 'component' | 'module') {
    const target = iframeCommunicationService.iframeWindow.document.querySelector<HTMLElement>(
      `[data-ditto-id="${componentId}"]`
    );

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

  function handleSelectingComponentForRenaming(componentId: ComponentId) {
    setSelectedComponentForRenaming(componentId);
  }

  function renderComponentTree() {
    return (
      <ComponentTree
        showSearch
        data={componentTreeData}
        onSelect={handleSelectingComponent}
        searchValue={keyword}
        onCancelSelect={handleCancelSelectingComponent}
      />
    );
  }

  const handleSettingKeyword = useCallback(e => {
    setKeyword((e.target.value || '').trim());
    if (!e.target.value) {
      setIsSearching(false);
    }
  }, []);

  function handleShowingSearch()  {
    setIsSearching(true);
  }

  function renderTitleArea() {
    if (isSearching) {
      return (
        <Input
          classNames={{
            input: styles.pageSearchInput
          }}
          autoFocus
          allowClear
          variant="borderless"
          placeholder="搜索页面..."
          onPressEnter={handleSettingKeyword}
          onBlur={handleSettingKeyword}
        />
      );
    }
    return (
      <>
        <div className={styles.titleTabs}>
          <p
            className={classnames({ [styles.title]: true, [styles.selected]: viewType === 'container' })}
            onClick={() => setViewType('container')}
          >
            容器
          </p>
          <p
            className={classnames({ [styles.title]: true, [styles.selected]: viewType === 'component' })}
            onClick={() => setViewType('component')}
          >
            组件
          </p>
        </div>
        <div className={styles.buttonWrapper}>
          <SearchIcon className={styles.icon} onClick={handleShowingSearch} />
        </div>
      </>
    );
  }

  return (
    <div className={styles.componentStructure}>
      <div className={styles.titleWrapper}>{renderTitleArea()}</div>
      <div className={styles.content}>{viewType === 'container' ? renderContainerList() : renderComponentTree()}</div>
    </div>
  );
}

ComponentStructure.displayName = 'ComponentStructure';

export default observer(ComponentStructure);
