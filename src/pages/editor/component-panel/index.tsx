import componentConfig from '@/data/component-dict';
import { Collapse, Input } from 'antd';
import { FC, ForwardedRef, useEffect, useState } from 'react';

import styles from './index.module.less';
import DraggableComponent from '@/pages/editor/component-panel/draggable-component-item';
import { CaretRightOutlined } from '@ant-design/icons';

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
  category: string;
}

export default function ComponentPanel() {
  const [componentListByCategory, setComponentListByCategory] = useState<Record<string, IComponentInfo[]>>({});

  useEffect(() => {
    fetchComponentList();
  }, []);

  function handleSearching() {
    console.log('handle searching component');
  }

  function fetchComponentList() {
    const components = Object.values(componentConfig).map(item => Object.values(item));
    const list = components
      .flat(1)
      .filter(item => !item.isHidden)
      .map(item => {
        return {
          key: item.configName,
          title: item.title,
          icon: item.icon,
          isLayer: item.isLayer,
          name: item.configName,
          dependency: item.dependency,
          category: item.category
        } as unknown as IComponentInfo;
      });
    const result: Record<string, IComponentInfo[]> = {};
    list.forEach((item: IComponentInfo) => {
      result[item.category] = result[item.category] || [];
      result[item.category].push(item);
    });
    setComponentListByCategory(result);
  }

  function renderComponentList(list: IComponentInfo[]) {
    const tpl = list.map(item => {
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
            <div className={styles.componentIcon} />
            <p className={styles.componentTitle} title={item.title}>
              {item.title}
            </p>
          </div>
        </DraggableComponent>
      );
    });
    return <div className={styles.componentList}>{tpl}</div>;
  }

  function renderComponentPanelBody() {
    const items = (Object.entries(componentListByCategory) as [string, IComponentInfo[]][]).map(([key, val]) => {
      return {
        key,
        label: key,
        children: renderComponentList(val)
      };
    });
    return (
      <Collapse items={items} ghost expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />} />
    );
  }

  return (
    <div className={styles.main}>
      <Input.Search placeholder="请输入组件名" onSearch={handleSearching} />
      <div className={styles.componentWrapper}>{renderComponentPanelBody()}</div>
    </div>
  );
}
