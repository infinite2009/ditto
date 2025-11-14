import { Input } from 'antd';
import React, { useRef } from 'react';

import styles from './index.module.less';
import { NewPage, SearchIcon } from '@/components/icon';
import debounce from 'lodash/debounce';
import { Tooltip } from 'antd/lib';
import { useSearchParams } from 'react-router-dom';

export interface IProjectToolBarProps {
  onCreatingPage?: () => void;
  onSearch?: (keyword: string) => void;
}

export default function ProjectToolBar({ onSearch, onCreatingPage }: IProjectToolBarProps) {
  const projectToolbarRef = useRef<HTMLDivElement>(null);

  const [searchParams] = useSearchParams();

  function handleSearch(e: any) {
    if (onSearch) {
      onSearch(e.target.value.trim());
    }
  }

  const handleInputWithDebounce = debounce(handleSearch, 100);

  function handleClickingCreatePage() {
    if (onCreatingPage) {
      onCreatingPage();
    }
  }

  return (
    <div className={styles.projectToolBar} ref={projectToolbarRef}>
      <Input
        className={styles.pageSearch}
        classNames={{
          input: styles.pageSearchInput,
          prefix: styles.pageSearchPrefix
        }}
        placeholder="搜索页面..."
        allowClear
        prefix={<SearchIcon />}
        variant="borderless"
        onInput={handleInputWithDebounce}
        onPressEnter={handleSearch}
        onBlur={handleSearch}
      />
      {/*<NewFolder className={styles.icon} onClick={handleClickingCreateProject} />*/}
      <Tooltip
        classNames={{
          root: styles.tooltip
        }}
        getPopupContainer={() => projectToolbarRef.current}
        placement="top"
        title="新增页面"
        arrow={{ pointAtCenter: true }}
        autoAdjustOverflow={false}
      >
        <NewPage className={styles.icon} onClick={handleClickingCreatePage} />
      </Tooltip>
    </div>
  );
}
