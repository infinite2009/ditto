import componentConfig from '@/data/component-dict';
import { Input } from 'antd';
import { FC, ForwardedRef, useEffect, useState } from 'react';

import styles from './index.module.less';
import DraggableComponent from '@/pages/editor/component-panel/draggable-component-item';

interface IComponentIconProps {
  className: string;
}

interface IComponentInfo {
  key: string;
  title: string;
  name: string;
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
    const result = Object.entries(componentConfig.antd)
      .filter(([, val]) => val.category === 'basic')
      .map(([key, val]) => {
        return {
          key,
          title: val.title,
          icon: val.icon,
          name: val.name,
        } as unknown as IComponentInfo;
      });
    setComponentList(result);
  }

  function renderComponentList() {
    const tpl = componentList.map(item => {
      const ComponentIcon = item.icon as FC<IComponentIconProps>;
      return (
        <DraggableComponent key={item.name} name={item.title}>
          <div className={styles.componentItem} key={item.key}>
            <ComponentIcon className={styles.componentIcon} />
            <p className={styles.componentTitle}>{item.title}</p>
          </div>
        </DraggableComponent>
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
