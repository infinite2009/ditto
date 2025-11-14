import { observer } from 'mobx-react';

import styles from './index.module.less';
import { Desktop, Plus, SearchIcon } from '@/components/icon';
import { DSLStoreContext, EditorStoreContext, IframeCommunicationContext } from '@/hooks/context';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Input, InputRef, message, Tooltip } from 'antd';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import { PageData } from '@/pages/editor/page-panel';
import { ComponentId } from '@/types';
import NewFileManager from '@/service/new-file-manager';
import IPageSchema from '@/types/page.schema';
import DSLStore from '@/service/dsl-store';
import { useSearchParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import PageRenderer from '@/pages/components/page-renderer';
import html2canvas from 'html2canvas';
import usePageStore from '@/store/usePageStore';
import { PageInfo } from '@/types/app-data';
import { getVoltronProjectDetail } from '@/api';
import useProjectStore from '@/store/useProjectStore';
import { useMount } from 'ahooks';
import classnames from 'classnames';
import { RenderWithoutRollbackMode } from '@/pages/components/RenderWithoutRollbackMode';
import { DesignMode } from '@/service/editor-store';
import { twMerge } from 'tailwind-merge';

export interface PageListProps {
  onExportTemplate: () => void;
  onSelect: (pageId: string) => void;
}

function PageList({ onSelect, onExportTemplate }: PageListProps) {
  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);
  const iframeCommunicationService = useContext(IframeCommunicationContext);

  const [searchParams] = useSearchParams();
  const openedProjectId = searchParams.get('projectId');

  const pageStore = usePageStore();
  const projectStore = useProjectStore();

  const [storeForCover, setStoreForCover] = useState<DSLStore>(null);
  const [showCover, setShowCover] = useState<boolean>(false);
  const [templatePageName, setTemplatePageName] = useState('');
  const [pageNameKeyword, setPageNameKeyword] = useState<string>('');
  const [selectedPageIdForRenaming, setSelectedPageIdForRenaming] = useState<ComponentId>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [pageOrFolderPathForCopy] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // const data = editorStore.pageList;

  const selectedPageForMenuRef = useRef<{
    name: string;
    path: string;
    id: string;
    dslUrl: string;
  }>();
  const selectedPageRef = useRef<{
    name: string;
    path: string;
    id: string;
    dslUrl: string;
  }>();
  const clickTimeoutIdRef = useRef<NodeJS.Timeout>();
  const pageCreatingInputRef = useRef<InputRef>(null);

  const selectedKeys = useMemo(() => {
    if (editorStore.selectedPageId && editorStore.pageList.length) {
      return [editorStore.selectedPageId];
    }
    return [];
  }, [editorStore.selectedPageId, editorStore.pageList]);

  useMount(() => {
    fetchPageList().then();
  });

  useEffect(() => {
    if (storeForCover) {
      setShowCover(true);
    }
  }, [storeForCover]);

  const data = useMemo(() => {
    return editorStore.pageList;
  }, [editorStore.pageList]);

  const getProjectDetail = async (projectId: string) => {
    const { data } = await getVoltronProjectDetail({
      projectId
    });
    projectStore.setCurrentProject(data);
  };
  
  async function fetchPageList(): Promise<PageInfo[]> {
    const projectId = searchParams.get('projectId');
    const pageList = await NewFileManager.fetchPages(projectId);
    await getProjectDetail(projectId);
    pageStore.setPageList(pageList);
    editorStore.setPageList(pageList);
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
    return pageList;
  }

  function onOpenChange(open: boolean, data: any) {
    if (open) {
      selectedPageForMenuRef.current = data;
    } else {
      selectedPageForMenuRef.current = undefined;
    }
  }

  async function removePage() {
    const openedProjectId = searchParams.get('projectId');
    const selectedPageId = selectedPageForMenuRef?.current?.id;
    if (!selectedPageId) {
      return;
    }
    try {
      await NewFileManager.deletePage(selectedPageId);
      if (editorStore.selectedPageId === selectedPageId) {
        editorStore.setSelectedPageId(openedProjectId, '');
      }
      if (selectedPageRef.current?.id && selectedPageId === selectedPageRef.current?.id) {
        selectedPageRef.current = null;
        if (onSelect) {
          onSelect(null);
        }
      }
      fetchPageList().then();
    } catch (e) {
      message.error(e);
    }
  }

  function renamePage() {
    setSelectedPageIdForRenaming(selectedPageForMenuRef.current.id);
  }

  function handleClickingMenu(key: string, data: PageData) {
    switch (key) {
      case 'copy':
        copyPage().then();
        break;
      case 'remove':
        removePage().then();
        break;
      case 'rename':
        renamePage();
        break;
      case 'exportAsTemplate':
        exportPageAsTemplate(data.name).then();
        break;
    }
  }

  async function copyPage() {
    if (!selectedPageForMenuRef.current) {
      message.error('未选中页面');
      return;
    }
    // 该函数执行后，selectedPageForMenuRef 会立即清空，所以这里缓存一下引用
    const cache = selectedPageForMenuRef.current;
    const { dsl } = await NewFileManager.fetchDSLByPageId(cache.id);
    if (dsl) {
      await NewFileManager.createPage(
        searchParams.get('projectId'),
        dsl as unknown as IPageSchema,
        `${cache.name} 副本`
      );
      fetchPageList().then();
    } else {
      console.error(`无法获取页面 ${cache.id} 的dsl`);
    }
  }

  async function handleRenamingPage(pageId: string, newName: string) {
    try {
      // await fileManager.renamePage(path, newName);
      await NewFileManager.renamePage(pageId, newName);
      fetchPageList().then();
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      message.error(e.toString());
    } finally {
      setSelectedPageIdForRenaming('');
    }
  }

  /**
   * 生成菜单项
   */
  function generateContextMenus(isLeaf: boolean): {
    key: string;
    title: string;
    shortKey?: string[];
  }[][] {
    const result = [
      [
        {
          key: 'copy',
          title: '复制'
        },

        {
          key: 'remove',
          title: '删除'
        }
      ],
      [
        {
          key: 'rename',
          title: '重命名'
        }
      ]
    ];
    if (pageOrFolderPathForCopy) {
      result[0].push({
        key: 'paste',
        title: '粘贴'
      });
    }
    if (isLeaf) {
      result.push([
        {
          key: 'exportAsTemplate',
          title: '导出为模板'
        }
      ]);
    }
    return result;
  }

  function cancelCreating() {
    setIsCreating(false);
  }

  function renderNewPageInput() {
    if (!isCreating) {
      return null;
    }
    return (
      <div className={styles.fileNameContainer}>
        <Desktop className={styles.fileIcon} />
        <Input
          className={styles.input}
          autoFocus
          ref={pageCreatingInputRef}
          onPressEnter={handleCreatingPage}
          onBlur={e => (e.target.value.length ? handleCreatingPage(e) : cancelCreating())}
        />
      </div>
    );
  }

  async function handleCreatingPage(e) {
    try {
      const pageNameForCreating = e.target.value.trim();
      if (!pageNameForCreating) {
        message.error('请输入页面名称').then();
      }
      await NewFileManager.createPage(searchParams.get('projectId'), null, pageNameForCreating);
      fetchPageList().then();
    } finally {
      setIsCreating(false);
    }
  }

  const handleSelect = useCallback(
    (pageId: string) => {
      // 如果已经有值，说明之前点击了一次
      if (clickTimeoutIdRef.current) {
        return;
      }
      clickTimeoutIdRef.current = setTimeout(() => {
        if (onSelect && pageId) {
          onSelect(pageId);
        }
        clickTimeoutIdRef.current = undefined;
      }, 200);
    },
    [onSelect, data]
  );

  function handleClickingCreatePage() {
    setIsCreating(true);
  }

  function handleClickingSearchIcon() {
    setIsSearching(true);
  }

  function renderPageList() {
    // 回滚模式仅显示当前选中页面
    if (editorStore.mode === DesignMode.rollback) {
      return (
        <div className={twMerge(styles.fileNameContainer, styles.selected)} style={{ cursor: 'default' }}>
          <Desktop className={styles.fileIcon} />
          <span className={styles.fileName}>{editorStore.selectPage.name}</span>
        </div>
      );
    }
    return data
      .filter(item => {
        return !pageNameKeyword || item.name.toLowerCase().indexOf(pageNameKeyword.toLowerCase()) > -1;
      })
      .map(item => {
        const { name, pageId } = item;
        // 包装 title 以支持右键菜单
        return (
          <ComponentContextMenu
            key={pageId}
            data={item}
            onClick={handleClickingMenu}
            items={generateContextMenus(true)}
            onOpenChange={onOpenChange}
          >
            {pageId === selectedPageIdForRenaming ? (
              <div
                className={classnames({
                  [styles.fileNameContainer]: true,
                  [styles.selected]: pageId === editorStore?.selectedPageId
                })}
              >
                <Desktop className={styles.fileIcon} />
                <Input
                  onClick={e => e.stopPropagation()}
                  defaultValue={name as string}
                  autoFocus
                  onFocus={e => e.target.select()}
                  onBlur={e => handleRenamingPage(pageId, (e.target.value as string).trim())}
                  onPressEnter={e =>
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    handleRenamingPage(pageId, (e.target.value as unknown as string).trim())
                  }
                  size="small"
                  styles={{ input: { width: 100, borderColor: '#1A4BFF' } }}
                />
              </div>
            ) : (
              <Tooltip title={name} placement={'right'}>
                <div
                  className={classnames({
                    [styles.fileNameContainer]: true,
                    [styles.selected]: pageId === editorStore?.selectedPageId
                  })}
                  onClick={() => handleSelect(pageId)}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    if (clickTimeoutIdRef.current !== undefined) {
                      clearTimeout(clickTimeoutIdRef.current);
                      clickTimeoutIdRef.current = undefined;
                    }
                    setSelectedPageIdForRenaming(pageId);
                  }}
                >
                  <Desktop className={styles.fileIcon} />
                  <span className={styles.fileName}>{name}</span>
                </div>
              </Tooltip>
            )}
          </ComponentContextMenu>
        );
      });
  }

  async function exportPageAsTemplate(pageName = '') {
    const extraStore = new DSLStore();
    const { dsl } = await NewFileManager.fetchDSLByPageId(selectedPageForMenuRef.current.id);
    extraStore.initDSL(dsl as unknown as IPageSchema);
    setStoreForCover(extraStore);
    setTemplatePageName(pageName);
  }

  async function executeExport() {
    const portal = document.getElementById('templatePortal');
    if (portal) {
      const projectId = searchParams.get('projectId');
      const canvas = await html2canvas(portal, { scale: 4 });
      canvas.toBlob(async blob => {
        if (blob) {
          try {
            const [templateBatchKey, coverBatchKey] = await Promise.all([
              NewFileManager.uploadDSLFile(JSON.stringify(storeForCover.dsl)),
              NewFileManager.uploadImage(new File([blob], 'index.png', { type: 'image/png' }))
            ]);
            if (templateBatchKey && coverBatchKey) {
              await NewFileManager.createTemplate({
                templatePageName,
                templateBatchKey,
                coverBatchKey,
                projectId
              });
              if (onExportTemplate) {
                onExportTemplate();
                message.success('导出模板成功');
              }
            } else {
              return message.error('封面上传失败');
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          message.error('请选择非空白的页面');
        }
        setShowCover(false);
        setStoreForCover(null);
      });
    }
  }

  function renderTemplateForCover() {
    if (!storeForCover || !showCover) {
      return null;
    }
    return (
      <ErrorBoundary fallback={<div>PageRenderer 错误</div>}>
        <PageRenderer extraStore={storeForCover} onRender={executeExport} />
      </ErrorBoundary>
    );
  }

  const handleSearchingPage = useCallback(e => {
    setPageNameKeyword((e.target.value || '').trim());
    if (!e.target.value) {
      setIsSearching(false);
    }
  }, []);

  function renderTitleArea() {
    if (isSearching) {
      return (
        <Input
          classNames={{
            input: styles.pageSearchInput
          }}
          allowClear
          autoFocus
          variant="borderless"
          placeholder="搜索页面..."
          onPressEnter={handleSearchingPage}
          onBlur={handleSearchingPage}
        />
      );
    }
    return (
      <>
        <p className={styles.title}>页面</p>
        <div className={styles.buttonWrapper}>
          <RenderWithoutRollbackMode>
            <Plus className={styles.icon} onClick={handleClickingCreatePage} />
            <SearchIcon className={styles.icon} onClick={handleClickingSearchIcon} />
          </RenderWithoutRollbackMode>
        </div>
      </>
    );
  }

  return (
    <div className={styles.pageList}>
      <div className={styles.titleWrapper}>{renderTitleArea()}</div>
      <div className={styles.pageListContent}>
        {renderNewPageInput()}
        {renderPageList()}
      </div>
      <div id="templatePortal" className={styles.templatePortal}>
        {renderTemplateForCover()}
      </div>
    </div>
  );
}

PageList.displayName = 'PageList';

export default observer(PageList);
