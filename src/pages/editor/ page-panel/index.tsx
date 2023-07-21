import { useEffect, useState } from 'react';
import { Menu, Tree } from 'antd';
import { FileOutlined, FolderOutlined } from '@ant-design/icons';

export default function PagePanel() {
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  function fetchPages() {
    setPages([{
      key: '123',
      label: '文件夹1',
      icon: <FolderOutlined />,
      children: [{
        key: '456',
        label: '页面1',
        icon: <FileOutlined />
      }]
    }]);
  }



  return (
    <div>
      <Tree.DirectoryTree
        multiple
        defaultExpandAll
        onSelect={onSelect}
        onExpand={onExpand}
        treeData={treeData}
      />
    </div>
  );
}