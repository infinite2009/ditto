import componentConfig from '@/data/component-dict';
import { Input } from 'antd';
import { FC, ForwardedRef, useEffect, useState } from 'react';

import styles from './index.module.less';

interface IComponentInfo {
  key: string;
  title: string;
  icon: ForwardedRef<any>;
}

export default function ComponentPanel() {
  const [componentList, setComponentList] = useState<IComponentInfo[]>([]);

  useEffect(() => {
    fetchComponentList();
  }, []);

  function handleSearching() {
    console.log('handle searching component');
  }

  function fetchComponentList() {
    // TODO 这里写死了，后期组件库多了之后，需要修改
    const result = Object.entries(componentConfig.antd).map(([key, val]) => {
      return {
        key,
        title: val.title,
        icon: val.icon
      } as unknown as IComponentInfo;
    });
    setComponentList(result);
  }

  function renderComponentList() {
    const tpl = componentList.map(item => {
      const ComponentIcon = item.icon as FC;
      return (
        <div className={styles.componentItem} key={item.key}>
          <ComponentIcon />
          <p className={styles.componentTitle}>{item.title}</p>
        </div>
      );
    });
    return <div className={styles.componentList}>{tpl}</div>;
  }

  return (
    <div>
      <Input.Search placeholder="请输入组件名" onSearch={handleSearching} />
      {renderComponentList()}
    </div>
  );
}
