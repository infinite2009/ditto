import { Tree } from 'antd';
import { Key } from 'antd/es/table/interface';

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
  function handlingSelect(selectedKeys: Key[]) {
    if (onSelect) {
      onSelect(selectedKeys[0] as string);
    }
  }

  return (
    <div>
      <Tree.DirectoryTree selectedKeys={[selected]} defaultExpandAll onSelect={handlingSelect} treeData={data} />
    </div>
  );
}
