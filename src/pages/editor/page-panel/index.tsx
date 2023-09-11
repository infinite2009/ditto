import { Tree } from 'antd';
import { Key } from 'antd/es/table/interface';
import { DataNode } from 'antd/es/tree';
import { useCallback, useEffect } from 'react';
import { DownOutlined } from '@ant-design/icons';

interface PageData {
  key: string;
  title: string;
  children?: PageData[];
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

  return (
    <div>
      <Tree
        switcherIcon={<DownOutlined />}
        // selectedKeys={[selected]}
        defaultExpandAll
        onSelect={handlingSelect}
        treeData={data}
      />
    </div>
  );
}
