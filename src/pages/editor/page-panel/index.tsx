import { Input, InputRef, message, Tree } from 'antd';
import { DataNode } from 'antd/es/tree';
import React, {
  Key,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ProjectToolBar from '@/pages/editor/project-tool-bar';
import { ComponentId } from '@/types';
import { AppStoreContext, EditorStoreContext } from '@/hooks/context';
import { Scene } from '@/service/app-store';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import PageRenderer from '@/pages/components/page-renderer';
import DSLStore from '@/service/dsl-store';
import html2canvas from 'html2canvas';
import styles from './index.module.less';
import { Desktop, Expand } from '@/components/icon';
import { observer } from 'mobx-react';
import NewFileManager from '@/service/new-file-manager';
import { ErrorBoundary } from 'react-error-boundary';
import { useSearchParams } from 'react-router-dom';
import IPageSchema from '@/types/page.schema';
import EmptySearchResult from '@/components/empty-search-result';

export interface PageData {
  children?: PageData[];
  icon?: any;
  id: string;
  isLeaf?: boolean;
  key: string;
  name: string;
  path: string;
  title: string | ReactNode | any;
}

// type PageData = PostVoltronPageList.ResItem;

export interface IPagePanel {
  data: PageData[];
  onChange?: () => void;
  onDelete?: () => void;
  onExportTemplate: () => void;
  onSelect: (page: ({ path: string; name: string; id: string } & DataNode) | null) => void;
}

export default observer(function PagePanel({ data = [], onSelect, onDelete, onChange, onExportTemplate }: IPagePanel) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedPageIdForRenaming, setSelectedPageIdForRenaming] = useState<ComponentId>('');
  const [pageNameKeyword, setPageNameKeyword] = useState<string>('');
  const [pageOrFolderPathForCopy] = useState<string>('');
  const [storeForCover, setStoreForCover] = useState<DSLStore>(null);
  const [showCover, setShowCover] = useState<boolean>(false);
  const [templatePageName, setTemplatePageName] = useState('');

  const [searchParams] = useSearchParams();

  const clickTimeoutIdRef = useRef<NodeJS.Timeout>();
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
  const pageCreatingInputRef = useRef<InputRef>(null);

  const appStore = useContext(AppStoreContext);
  const editorStore = useContext(EditorStoreContext);

  useLayoutEffect(() => {
    const inputEl = pageCreatingInputRef.current;
    if (isCreating && inputEl) {
      inputEl.focus();
      inputEl.nativeElement.scrollIntoView({
        block: 'end',
        behavior: 'smooth'
      });
    }
  }, [isCreating]);

  useEffect(() => {
    const handlers = {
      copy: copyPage,
      remove: removePage,
      exportAsTemplate: exportPageAsTemplate,
      rename: renamePage
    };
    appStore.registerHandlers(Scene.pageMenu, handlers);
  }, [copyPage, renamePage, removePage, exportPageAsTemplate]);

  useEffect(() => {
    if (storeForCover) {
      setShowCover(true);
    }
  }, [storeForCover]);

  const selectedKeys = useMemo(() => {
    if (editorStore.selectedPageId && data.length) {
      return [editorStore.selectedPageId];
    }
    return [];
  }, [editorStore.selectedPageId, data]);

  const handlingSelect = useCallback(
    (_: any, selected: any) => {
      // 如果已经有值，说明之前点击了一次
      if (clickTimeoutIdRef.current) {
        return;
      }
      clickTimeoutIdRef.current = setTimeout(() => {
        if (onSelect && selected.selectedNodes[0]) {
          onSelect(selected.selectedNodes[0]);
        }
        clickTimeoutIdRef.current = undefined;
      }, 200);
    },
    [onSelect, data]
  );

  function onOpenChange(open: boolean, data: any) {
    if (open) {
      selectedPageForMenuRef.current = data;
    } else {
      selectedPageForMenuRef.current = undefined;
    }
  }

  const dataWithIcon = useMemo(() => {
    if (data && data.length) {
      const recursiveMap = (data: PageData[]) => {
        return data
          .filter(item => {
            return !pageNameKeyword || item.name.toLowerCase().indexOf(pageNameKeyword.toLowerCase()) > -1;
          })
          .map(item => {
            const converted = {
              ...item,
              isLeaf: true,
              key: item.id
            };
            if (item.children) {
              converted.children = recursiveMap(item.children);
            }
            if (converted.isLeaf) {
              converted.icon = <Desktop className={styles.fileIcon} />;
            } else {
              converted.icon = () => null;
            }

            // if (item.path === selectedPathForRenaming) {
            if (item.id === selectedPageIdForRenaming) {
              converted.title = (
                <Input
                  onClick={e => e.stopPropagation()}
                  defaultValue={item.name as string}
                  autoFocus
                  onFocus={e => e.target.select()}
                  onBlur={e => handleRenamingPage(item.id, (e.target.value as string).trim())}
                  onPressEnter={e =>
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    handleRenamingPage(item.id, (e.target.value as unknown as string).trim())
                  }
                  size="small"
                  styles={{ input: { width: 100, borderColor: '#1A4BFF' } }}
                />
              );
            } else {
              converted.title = (
                <div
                  className={styles.nodeTitle}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    if (clickTimeoutIdRef.current !== undefined) {
                      clearTimeout(clickTimeoutIdRef.current);
                      clickTimeoutIdRef.current = undefined;
                    }
                    setSelectedPageIdForRenaming(converted.id);
                  }}
                >
                  {converted.name}
                </div>
              );
            }
            // 包装 title 以支持右键菜单
            converted.title = (
              <ComponentContextMenu
                data={item}
                onClick={handleClickingMenu}
                items={generateContextMenus(converted.isLeaf)}
                onOpenChange={onOpenChange}
              >
                {converted.title}
              </ComponentContextMenu>
            );
            return converted;
          });
      };

      return recursiveMap(data);
    }
    return [];
  }, [data, selectedPageIdForRenaming, pageNameKeyword]);

  /**
   * 响应菜单项点击的回调
   * @param key 用户按键
   */
  function handleClickingMenu(key: string, data: PageData) {
    console.log(data);
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
      if (onChange) {
        onChange();
      }
    } else {
      console.error(`无法获取页面 ${cache.id} 的dsl`);
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
      if (onDelete) {
        onDelete();
      }
    } catch (e) {
      message.error(e);
    }
  }

  function renamePage() {
    setSelectedPageIdForRenaming(selectedPageForMenuRef.current.id);
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

  async function exportPageAsTemplate(pageName = '') {
    const extraStore = new DSLStore();
    const { dsl } = await NewFileManager.fetchDSLByPageId(selectedPageForMenuRef.current.id);
    extraStore.initDSL(dsl as unknown as IPageSchema);
    setStoreForCover(extraStore);
    setTemplatePageName(pageName);
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

  /**
   * 生成菜单项
   */
  function generateContextMenus(isLeaf: boolean): {
    key: string;
    title: string;
    shortKey?: string[];
  }[][] {
    const { rename, exportAsTemplate } = appStore.shortKeyDict[Scene.pageMenu];
    const { copy, paste, remove } = appStore.shortKeyDict[Scene.componentMenu];
    const result = [
      [
        {
          key: 'copy',
          title: copy.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.pageMenu, 'copy')]
        },

        {
          key: 'remove',
          title: remove.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.pageMenu, 'remove')]
        }
      ],
      [
        {
          key: 'rename',
          title: rename.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.pageMenu, 'rename')]
        }
      ]
    ];
    if (pageOrFolderPathForCopy) {
      result[0].push({
        key: 'paste',
        title: paste.functionName,
        shortKey: [appStore.generateShortKeyDisplayName(Scene.pageMenu, 'paste')]
      });
    }
    if (isLeaf) {
      result.push([
        {
          key: 'exportAsTemplate',
          title: exportAsTemplate.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.pageMenu, 'exportAsTemplate')]
        }
      ]);
    }
    return result;
  }

  async function handleRenamingPage(pageId: string, newName: string) {
    try {
      // await fileManager.renamePage(path, newName);
      await NewFileManager.renamePage(pageId, newName);
      if (onChange) {
        onChange();
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      message.error(e.toString());
    } finally {
      setSelectedPageIdForRenaming('');
    }
  }

  function handleExpand(expandedKeys: Key[]) {
    setExpandedKeys(expandedKeys as string[]);
  }

  function handleSearchingPage(val: string) {
    setPageNameKeyword(val);
  }

  function renderPageListWithNewPageInput() {
    if (editorStore.pageList?.length) {
      // 有关键词但是没有数据，则认为是没有匹配关键词的搜索结果
      return pageNameKeyword && !dataWithIcon?.length ? (
        <EmptySearchResult keyword={pageNameKeyword} />
      ) : (
        <div className={styles.projectTree}>
          <Tree
            switcherIcon={<Expand />}
            showIcon
            blockNode
            selectedKeys={selectedKeys}
            onExpand={handleExpand}
            expandedKeys={expandedKeys}
            onSelect={handlingSelect}
            treeData={dataWithIcon}
          />
          {renderNewPageInput()}
        </div>
      );
    }
    return renderNewPageInput();
  }

  function handleClickingCreatePage() {
    setIsCreating(true);
  }

  function renderNewPageInput() {
    if (!isCreating) {
      return null;
    }
    return (
      <div className={styles.pageNameInputWrapper}>
        <Desktop className={styles.fileIcon} />
        <Input
          className={styles.input}
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
      if (onChange) {
        onChange();
      }
    } finally {
      setIsCreating(false);
    }
  }

  function cancelCreating() {
    setIsCreating(false);
  }

  return (
    <div className={styles.pagePanel}>
      <ProjectToolBar onCreatingPage={handleClickingCreatePage} onSearch={handleSearchingPage} />
      {renderPageListWithNewPageInput()}
      <div id="templatePortal" className={styles.templatePortal}>
        {renderTemplateForCover()}
      </div>
    </div>
  );
});
