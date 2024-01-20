import { FC, ForwardedRef, useEffect, useState } from 'react';
import { message } from 'antd';
import DraggableComponent from '@/pages/editor/component-panel/draggable-component-item';

import styles from './index.module.less';
import ComponentManager from '@/service/component-manager';

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

export default function CustomComponentPanel() {
  const [componentList, setComponentList] = useState<IComponentInfo[]>([]);

  useEffect(() => {
    fetchComponentList();
  }, []);

  function fetchComponentList() {
    const components = Object.values(ComponentManager.componentConfigList).map(item => Object.values(item));
    const result = components
      .flat(1)
      .filter(item => item.category === 'custom')
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

  function handleClickingComponentItem() {
    message.success('点击成功');
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
          <div className={styles.componentItem} key={item.key} onClick={handleClickingComponentItem}>
            <ComponentIcon className={styles.componentIcon} />
            <p className={styles.componentTitle}>{item.title}</p>
          </div>
        </DraggableComponent>
      );
    });
    return <div className={styles.componentList}>{tpl}</div>;
  }

  return <div className={styles.main}>{renderComponentList()}</div>;
}
