import { Tree } from 'antd';
import { Key } from 'antd/es/table/interface';
import { useCallback, useEffect } from 'react';

interface PageData {
  key: string;
  title: string;
  children?: PageData[];
}

export interface IPagePanel {
  data: PageData[];
  selected: string;
  onSelect: (page: string) => void;
}

export default function PagePanel({ data = [], selected, onSelect }: IPagePanel) {
  const handlingSelect = useCallback(
    (_: any, data: any) => {
      if (onSelect) {
        const selected = data.selectedNodes[0];
        if (selected.isLeaf) {
          onSelect(selected.key as string);
        }
      }
    },
    [onSelect, data]
  );

  return (
    <div>
      <Tree.DirectoryTree selectedKeys={[selected]} defaultExpandAll onSelect={handlingSelect} treeData={data} />
    </div>
  );
}
