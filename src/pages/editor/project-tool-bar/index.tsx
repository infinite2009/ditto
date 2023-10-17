import { Input } from 'antd';
import React from 'react';
import { FileAddOutlined, FolderAddOutlined, SearchOutlined } from '@ant-design/icons';

import styles from './index.module.less';

export interface IProjectToolBarProps {
  onSearch: (keyword: string) => void;
  onCreatingProject: () => void;
  onCreatingPage: () => void;
}

export default function ProjectToolBar({ onSearch, onCreatingProject, onCreatingPage }: IProjectToolBarProps) {
  function handleSearch(e: any) {
    if (onSearch) {
      onSearch(e.target.value.trim());
    }
  }

  function handleClickingCreateProject() {
    if (onCreatingProject) {
      onCreatingProject();
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
      <div className={styles.iconWrapper} onClick={handleClickingCreateProject}>
        <FolderAddOutlined className={styles.icon} />
      </div>
      <div className={styles.iconWrapper} onClick={handleClickingCreatePage}>
        <FileAddOutlined className={styles.icon} />
      </div>
    </div>
  );
}
