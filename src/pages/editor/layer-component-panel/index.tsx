import { FC, ForwardedRef, useEffect, useState } from 'react';
import { message } from 'antd';
import componentConfig from '@/data/component-dict';

import styles from './index.module.less';

interface IComponentIconProps {
  className: string;
}

interface IComponentInfo {
  key: string;
  title: string;
  icon: ForwardedRef<any>;
}

export default function LayerComponentPanel() {
  const [componentList, setComponentList] = useState<IComponentInfo[]>([]);

  useEffect(() => {
    fetchComponentList();
  }, []);

  function fetchComponentList() {
    // TODO 这里写死了，后期组件库多了之后，需要修改
    const result = Object.entries(componentConfig.antd)
      .filter(([, val]) => val.category === 'layer')
      .map(([key, val]) => {
        return {
          key,
          title: val.title,
          icon: val.icon
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
        <div className={styles.componentItem} key={item.key} onClick={handleClickingComponentItem}>
          <ComponentIcon className={styles.componentIcon} />
          <p className={styles.componentTitle}>{item.title}</p>
        </div>
      );
    });
    return <div className={styles.componentList}>{tpl}</div>;
  }

  return (
    <div className={styles.main}>
      {renderComponentList()}
    </div>
  );
}
