import { Input, message, Tree } from 'antd';
import { DataNode } from 'antd/es/tree';
import React, { Key, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DownOutlined, FileOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import ProjectToolBar from '@/pages/editor/project-tool-bar';

import styles from './index.module.less';
import { findNodePath } from '@/util';
import { ComponentId } from '@/types';
import fileManager from '@/service/file';

interface PageData {
  key: string;
  title: string | ReactNode | any;
  children?: PageData[];
  path: string;
  name: string;
  isLeaf?: boolean;
  icon?: any;
}

export interface IPagePanel {
  data: PageData[];
  selected: string;
  onSelect: (page: { path: string; name: string } & DataNode) => void;
  onChange: () => void;
}

export default function PagePanel({ data = [], selected, onSelect, onChange }: IPagePanel) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<ComponentId>('');

  const clickTimeoutIdRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (selected && data.length) {
      setExpandedKeys(mergeExpandedKeys(expandedKeys, findNodePath({ key: undefined, children: data }, selected)));
    }
  }, [selected, data]);

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
      if (!arr1.includes(item) && item.endsWith('.ditto')) {
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
            converted.icon = <FileOutlined />;
          } else {
            converted.icon = (props: any) => (props.expanded ? <FolderOpenOutlined /> : <FolderOutlined />);
          }
          if (item.path === selectedPath) {
            converted.title = (
              <Input
                defaultValue={item.title as string}
                autoFocus
                onFocus={e => e.target.select()}
                onBlur={e => handleRenamingPage(item.path, (e.target.value as string).trim())}
                onPressEnter={e =>
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
          return converted;
        });
      };

      return recursiveMap(data);
    }
    return [];
  }, [data, selectedPath]);

  async function handleRenamingPage(path: string, newName: string) {
    try {
      await fileManager.renamePage(path, newName);
      if (onChange) {
        onChange();
      }
    } catch (e) {
      // @ts-ignore
      message.error(e.toString());
    } finally {
      setSelectedPath('');
    }
  }

  function handleExpand(expandedKeys: Key[]) {
    setExpandedKeys(expandedKeys as string[]);
  }

  function handleCreatingPage() {}

  function handleCreatingDirectory() {}

  function handleSearchingPage() {}

  return (
    <div>
      <ProjectToolBar
        onCreatingPage={handleCreatingPage}
        onCreatingDirectory={handleCreatingDirectory}
        onSearch={handleSearchingPage}
      />
      {dataWithIcon?.length > 0 ? (
        <div className={styles.projectTree}>
          <Tree
            switcherIcon={<DownOutlined />}
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
    </div>
  );
}
