import { Collapse, Input, Tooltip } from 'antd';
import { FC, ForwardedRef, useEffect, useState } from 'react';

import styles from './index.module.less';
import DraggableComponent from '@/pages/editor/component-panel/draggable-component-item';
import { CaretRightOutlined, CodeSandboxOutlined } from '@ant-design/icons';
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
  categories: string[];
}

export default function ComponentPanel() {
  const [componentListByCategory, setComponentListByCategory] = useState<Record<string, IComponentInfo[]>>({});

  useEffect(() => {
    fetchComponentList();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function handleSearching() {}

  function fetchComponentList() {
    const components = Object.values(ComponentManager.componentConfigList).map(item => Object.values(item));
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
          categories: item.categories
        } as unknown as IComponentInfo;
      });
    const result: Record<string, IComponentInfo[]> = {};
    console.log('list: ', list);
    list.forEach((item: IComponentInfo) => {
      (item.categories || ['未知']).forEach(category => {
        result[category] = result[category] || [];
        result[category].push(item);
      });
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
          <Tooltip title={item.title} key={item.key}>
            <div className={styles.componentItem}>
              {ComponentIcon ? (
                <ComponentIcon className={styles.componentIcon} />
              ) : (
                <CodeSandboxOutlined className={styles.defaultIcon} />
              )}
              <p className={styles.componentTitle} title={item.title}>
                {item.title}
              </p>
            </div>
          </Tooltip>
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
