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
  isLayer?: boolean;
  name: string;
  icon: ForwardedRef<any>;
  dependency: string;
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
    const components = Object.values(componentConfig).map(item => Object.values(item));
    const result = components
      .flat(1)
      .filter(item => item.category === 'basic')
      .map(item => {
        return {
          key: item.configName,
          title: item.title,
          icon: item.icon,
          isLayer: item.isLayer,
          name: item.configName,
          dependency: item.dependency
        } as unknown as IComponentInfo;
      });
    setComponentList(result);
  }

  function renderComponentList() {
    const tpl = componentList.map(item => {
      const ComponentIcon = item.icon as FC<IComponentIconProps>;
      return (
        <DraggableComponent
          key={`${item.dependency}_${item.name}`}
          name={item.name}
          isLayer={item.isLayer}
          dependency={item.dependency}
          title={item.title}
        >
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
