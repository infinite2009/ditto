import { Input } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';

import styles from './index.module.less';
import { NewFolder, NewPage } from '@/components/icon';

export interface IProjectToolBarProps {
  onSearch: (keyword: string) => void;
  onCreatingDirectory: () => void;
  onCreatingPage: () => void;
}

export default function ProjectToolBar({ onSearch, onCreatingDirectory, onCreatingPage }: IProjectToolBarProps) {
  function handleSearch(e: any) {
    if (onSearch) {
      onSearch(e.target.value.trim());
    }
  }

  function handleClickingCreateProject() {
    if (onCreatingDirectory) {
      onCreatingDirectory();
    }
  }

  function handleClickingCreatePage() {
    if (onCreatingPage) {
      onCreatingPage();
    }
  }

  return (
    <div className={styles.main}>
      <Input
        placeholder="搜索页面..."
        addonBefore={<SearchOutlined />}
        onPressEnter={handleSearch}
        onBlur={handleSearch}
        style={{ width: 112 }}
      />
      <NewFolder className={styles.icon} onClick={handleClickingCreateProject} />
      <NewPage className={styles.icon} onClick={handleClickingCreatePage} />
    </div>
  );
}
