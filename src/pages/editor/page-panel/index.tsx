import { Tree } from 'antd';
import { DataNode } from 'antd/es/tree';
import { useCallback, useMemo } from 'react';
import { DownOutlined, FileOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';

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

  return (
    <div>
      {dataWithIcon?.length > 0 ? (
        <Tree.DirectoryTree
          switcherIcon={<DownOutlined />}
          showIcon
          defaultSelectedKeys={[selected]}
          defaultExpandedKeys={[selected]}
          onSelect={handlingSelect}
          treeData={dataWithIcon}
        />
      ) : null}
    </div>
  );
}
