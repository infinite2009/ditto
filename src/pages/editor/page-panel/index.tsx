import { Tree } from 'antd';
import { DataNode, EventDataNode } from 'antd/es/tree';
import { Key, useCallback, useEffect, useMemo, useState } from 'react';
import { DownOutlined, FileOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import ProjectToolBar from '@/pages/editor/project-tool-bar';

import styles from './index.module.less';
import { findNodePath } from '@/util';

interface PageData {
  key: string;
  title: string;
  children?: PageData[];
  isLeaf?: boolean;
  icon?: any;
}

export interface IPagePanel {
  data: PageData[];
  selected: string;
  onSelect: (page: DataNode) => void;
}

export default function PagePanel({ data = [], selected, onSelect }: IPagePanel) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (selected && data.length) {
      setExpandedKeys(findNodePath({ key: undefined, children: data }, selected));
    }
  }, [selected, data]);

  const handlingSelect = useCallback(
    (_: any, data: any) => {
      if (onSelect) {
        const selected = data.selectedNodes[0];
        onSelect(selected);
      }
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
            item.icon = <FileOutlined />;
          } else {
            item.icon = (props: any) => (props.expanded ? <FolderOpenOutlined /> : <FolderOutlined />);
          }
          return converted;
        });
      };

      return recursiveMap(data);
    }
    return [];
  }, [data]);

  function handleExpand(
    expandedKeys: Key[],
    data: {
      node: EventDataNode<{
        key: string;
        title: string;
        children?: PageData[] | undefined;
        isLeaf?: boolean | undefined;
        icon?: any;
      }>;
      expanded: boolean;
      nativeEvent: MouseEvent;
    }
  ) {
    setExpandedKeys(expandedKeys as string[]);
  }

  function handleCreatingPage() {}

  function handleCreatingProject() {}

  function handleSearchingPage() {}

  return (
    <div>
      <ProjectToolBar
        onCreatingPage={handleCreatingPage}
        onCreatingProject={handleCreatingProject}
        onSearch={handleSearchingPage}
      />
      {dataWithIcon?.length > 0 ? (
        <div className={styles.projectTree}>
          <Tree.DirectoryTree
            switcherIcon={<DownOutlined />}
            showIcon
            expandAction="doubleClick"
            selectedKeys={[selected]}
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
