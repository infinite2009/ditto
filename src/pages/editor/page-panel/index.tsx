import { useEffect, useState } from 'react';
import { Menu, Tree } from 'antd';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';

interface PageData {
  key: string;
  title: string;
  children?: PageData[];
}

export default function PagePanel() {
  const [pages, setPages] = useState<PageData[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  function fetchPages() {
    setPages([{
      key: '1.2.0',
      title: '1.2.0 迭代',
      children: [{
        key: '1.2.0-1',
        title: '核心链路监控',
      }]
    }, {
      key: '1.2.1',
      title: '1.2.1 迭代',
      children: [{
        key: '1.2.1-1',
        title: '核心链路监控改版'
      }]
    }]);
  }

  function handlingSelect() {
    console.log('page selected');
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
        treeData={pages}
      />
    </div>
  );
}