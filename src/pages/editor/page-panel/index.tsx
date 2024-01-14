import { Input, message, Tree } from 'antd';
import { DataNode } from 'antd/es/tree';
import React, { Key, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ProjectToolBar from '@/pages/editor/project-tool-bar';
import { findNodePath } from '@/util';
import { ComponentId } from '@/types';
import fileManager from '@/service/file';
import { AppStoreContext } from '@/hooks/context';
import { Scene } from '@/service/app-store';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import PageRenderer from '@/pages/components/page-renderer';
import DSLStore from '@/service/dsl-store';
import html2canvas from 'html2canvas';
import { PageWidth } from '@/pages/editor/toolbar';
import styles from './index.module.less';
import { Desktop, Expand } from '@/components/icon';

interface PageData {
  children?: PageData[];
  icon?: any;
  isLeaf?: boolean;
  key: string;
  name: string;
  path: string;
  title: string | ReactNode | any;
}

export interface IPagePanel {
  data: PageData[];
  onChange: () => void;
  onSelect: (page: { path: string; name: string } & DataNode) => void;
  selected: string;
}

export default function PagePanel({ data = [], selected, onSelect, onChange }: IPagePanel) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<ComponentId>('');
  const [pageOrFolderPathForCopy, setPageOrFolderPathForCopy] = useState<string>('');
  const [storeForCover, setStoreForCover] = useState<DSLStore>(null);
  const [showCover, setShowCover] = useState<boolean>(false);

  const clickTimeoutIdRef = useRef<NodeJS.Timeout>();
  const selectedPageOrFolderForMenuRef = useRef<{
    name: string;
    path: string;
  }>();

  const appStore = useContext(AppStoreContext);

  useEffect(() => {
    if (selected && data.length) {
      const foundNodePath = findNodePath({ key: undefined, children: data }, selected);
      const mergedExpandedKeys = mergeExpandedKeys(expandedKeys, foundNodePath);
      setExpandedKeys(mergedExpandedKeys);
    }
  }, [selected, data]);

  useEffect(() => {
    if (storeForCover) {
      setShowCover(true);
    }
  }, [storeForCover]);

  const selectedKeys = useMemo(() => {
    if (selected && data.length) {
      // warning: 不能破坏原始数据
      let q = [...data];
      while (q.length) {
        const node = q.shift();
        if (node?.path === selected) {
          return [node?.key];
        } else if (node?.children?.length) {
          q = q.concat(node?.children);
        }
      }
      return [];
    }
    return [];
  }, [selected, data]);

  function mergeExpandedKeys(arr1: string[], arr2: string[]): string[] {
    const result = [...arr1];
    arr2.forEach(item => {
      if (!arr1.includes(item)) {
        result.push(item);
      }
    });
    return result;
  }

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
      selectedPageOrFolderForMenuRef.current = data;
    } else {
      selectedPageOrFolderForMenuRef.current = undefined;
    }
  }

  const dataWithIcon = useMemo(() => {
    if (data) {
      const recursiveMap = (data: PageData[]) => {
        return data.map(item => {
          const converted = {
            ...item
          };
          if (item.children) {
            converted.children = recursiveMap(item.children);
          }
          if (item.isLeaf) {
            converted.icon = <Desktop className={styles.fileIcon} />;
          } else {
            converted.icon = (props: any) => null;
          }
          if (item.path === selectedPath) {
            converted.title = (
              <Input
                defaultValue={item.title as string}
                autoFocus
                onFocus={e => e.target.select()}
                onBlur={e => handleRenamingPage(item.path, (e.target.value as string).trim())}
                onPressEnter={e =>
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  handleRenamingPage(item.path, (e.target.value as unknown as string).trim())
                }
                size="small"
                styles={{ input: { width: 100 } }}
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
                  setSelectedPath(converted.path);
                }}
              >
                {converted.title}
              </div>
            );
          }
          // 包装 title 以支持右键菜单
          converted.title = (
            <ComponentContextMenu
              data={{
                name: item.name,
                path: item.path
              }}
              onClick={handleClickingMenu}
              items={generateContextMenus(item.isLeaf)}
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
  }, [data, selectedPath, pageOrFolderPathForCopy]);

  /**
   * 响应菜单项点击的回调
   * @param key 用户按键
   * @param data 菜单对应的数据
   */
  function handleClickingMenu(key: string) {
    switch (key) {
      case 'copy':
        copyPageOrFolder();
        break;
      case 'paste':
        pastePageOrFolder();
        break;
      case 'remove':
        removePageOrFolder();
        break;
      case 'rename':
        renamePageOrFolder();
        break;
      case 'exportAsTemplate':
        exportPageAsTemplate();
        break;
    }
  }

  function copyPageOrFolder() {
    if (!selectedPageOrFolderForMenuRef.current) {
      return;
    }
    setPageOrFolderPathForCopy(selectedPageOrFolderForMenuRef.current.path);
  }

  async function pastePageOrFolder() {
    await fileManager.pasteFileOrPath(pageOrFolderPathForCopy, selectedPageOrFolderForMenuRef.current.path);
    if (onChange) {
      onChange();
    }
  }

  async function removePageOrFolder() {
    await fileManager.deleteFileOrFolder(selectedPageOrFolderForMenuRef.current.path);
    if (onChange) {
      onChange();
    }
  }

  function renamePageOrFolder() {
    setSelectedPath(selectedPageOrFolderForMenuRef.current.path);
  }

  async function executeExport() {
    const portal = document.getElementById('templatePortal');
    if (portal) {
      const canvas = await html2canvas(portal);
      canvas.toBlob(async blob => {
        const buffer = await blob.arrayBuffer();
        await fileManager.saveTemplateFile(selectedPageOrFolderForMenuRef.current, buffer);
        setShowCover(false);
        if (onChange) {
          onChange();
        }
      });
    }
  }

  async function exportPageAsTemplate() {
    const extraStore = new DSLStore();
    const dsl = JSON.parse(await fileManager.readFile(selectedPageOrFolderForMenuRef.current.path));
    extraStore.initDSL(dsl);
    setStoreForCover(extraStore);
  }

  function renderTemplateForCover() {
    if (!storeForCover || !showCover) {
      return null;
    }
    return <PageRenderer extraStore={storeForCover} onRender={executeExport} pageWidth={PageWidth.wechat} />;
  }

  /**
   * 生成菜单项
   */
  function generateContextMenus(isLeaf: boolean): {
    key: string;
    title: string;
    shortKey?: string[];
  }[][] {
    const { copy, rename, paste, remove, exportAsTemplate } = appStore.shortKeyDict[Scene.editor];
    const result = [
      [
        {
          key: 'copy',
          title: copy.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'copy')]
        },

        {
          key: 'remove',
          title: remove.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'remove')]
        }
      ],
      [
        {
          key: 'rename',
          title: rename.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'rename')]
        }
      ]
    ];
    if (pageOrFolderPathForCopy) {
      result[0].push({
        key: 'paste',
        title: paste.functionName,
        shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'paste')]
      });
    }
    if (isLeaf) {
      result.push([
        {
          key: 'exportAsTemplate',
          title: exportAsTemplate.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'exportAsTemplate')]
        }
      ]);
    }
    return result;
  }

  async function handleRenamingPage(path: string, newName: string) {
    try {
      await fileManager.renamePage(path, newName);
      if (onChange) {
        onChange();
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      message.error(e.toString());
    } finally {
      setSelectedPath('');
    }
  }

  function handleExpand(expandedKeys: Key[]) {
    setExpandedKeys(expandedKeys as string[]);
  }

  async function handleCreatingPage() {
    await fileManager.createNewPage(selected);
    if (onChange) {
      onChange();
    }
  }

  async function handleCreatingDirectory() {
    await fileManager.createNewDirectory(selected);
    if (onChange) {
      onChange();
    }
  }

  function handleSearchingPage() {}

  return (
    <div className={styles.pagePanel}>
      <ProjectToolBar
        onCreatingPage={handleCreatingPage}
        onCreatingDirectory={handleCreatingDirectory}
        onSearch={handleSearchingPage}
      />
      {dataWithIcon?.length > 0 ? (
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
        </div>
      ) : null}
      <div id="templatePortal" className={styles.templatePortals}>
        {renderTemplateForCover()}
      </div>
    </div>
  );
}
