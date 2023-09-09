import { Tree } from 'antd';
import { Key } from 'antd/es/table/interface';

interface PageData {
  key: string;
  title: string;
  children?: PageData[];
}

export interface IPagePanel {
  data: PageData[];
  onSelect: (page: string) => void;
}

export default function PagePanel({ data = [], onSelect }: IPagePanel) {
  function handlingSelect(selectedKeys: Key[]) {
    if (onSelect) {
      onSelect(selectedKeys[0] as string);
    }
  }

  function handlingExpand() {
    console.log('folder expanded');
  }

  return (
    <div>
      <Tree.DirectoryTree
        multiple
        defaultExpandAll
        onSelect={handlingSelect}
        onExpand={handlingExpand}
        treeData={data}
      />
    </div>
  );
}
