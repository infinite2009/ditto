import { useEffect, useState } from 'react';
import { Menu, Tree } from 'antd';
import { generateProjectData } from '@/service/file';

interface PageData {
  key: string;
  title: string;
  children?: PageData[];
}

export interface IPagePanel {
  data: any[];
}

export default function PagePanel({ data = [] }: IPagePanel) {
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
        treeData={data}
      />
    </div>
  );
}
