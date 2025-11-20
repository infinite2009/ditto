import { Collapse, Input, Select, Tooltip } from 'antd';
import { FC, ForwardedRef, useContext, useEffect, useState } from 'react';
import DraggableComponent from '@/pages/editor/component-panel/draggable-component-item';
import { CaretRightOutlined, CodeSandboxOutlined } from '@ant-design/icons';
import ComponentManager from '@/service/component-manager';
import debounce from 'lodash/debounce';
import { ExpandDown, SearchIcon } from '@/components/icon';
import EmptySearchResult from '@/components/empty-search-result';

import styles from './index.module.less';
import { observer } from 'mobx-react';
import { EditorStoreContext } from '@/hooks/context';

export interface IComponentIconProps {
  className: string;
}

interface IComponentInfo {
  categories: string[];
  dependency: string;
  icon: ForwardedRef<any>;
  isLayer?: boolean;
  key: string;
  name: string;
  title: string;
}


function ComponentPanel() {
  const editorStore = useContext(EditorStoreContext);

  const [componentListByCategory, setComponentListByCategory] = useState<Record<string, IComponentInfo[]>>({});
  const [selectIsOpen, setSelectIsOpen] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  useEffect(() => {
    fetchComponentList();
  }, [editorStore.selectedComponentLib, searchKeyword]);

  function fetchComponentList() {
    const components = Object.values(ComponentManager.componentConfigDict[editorStore.selectedComponentLib]);
    const lowerCaseSearchKeyword = searchKeyword.toLowerCase();
    const list = components
      .flat(1)
      .filter(item => {
        if (item.isHidden) {
          return false;
        }
        return (
          item.title.includes(searchKeyword) ||
          item.configName.toLowerCase().includes(lowerCaseSearchKeyword) ||
          (item.keywords || []).join('').toLowerCase().includes(lowerCaseSearchKeyword)
        );
      })
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
    const commonItems = (Object.entries(componentListByCategory) as [string, IComponentInfo[]][]).map(([key, val]) => {
      return {
        key,
        label: key,
        children: renderComponentList(val)
      };
    });

    const items = [...commonItems];

    return items?.length ? (
      <Collapse
        items={items}
        onChange={val => {
          setActiveKey(val as unknown as string[]);
        }}
        activeKey={!searchKeyword ? activeKey : items.map(item => item.key)}
        ghost
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      />
    ) : (
      <EmptySearchResult keyword={searchKeyword}>暂无相关组件</EmptySearchResult>
    );
  }

  function handleSelectingComponentLib(data: string) {
    editorStore.setSelectedComponentLib(data);
  }

  const handleSearch = debounce(val => {
    setSearchKeyword(val.target.value.trim());
  }, 100);

  function handleInput(e: any) {
    handleSearch(e);
  }

  function onDropdownVisibleChange(open: boolean) {
    setSelectIsOpen(open);
  }

  return (
    <div className={styles.componentPanel}>
      {/*<Input.Search placeholder="请输入组件名" onSearch={handleSearching} />*/}
      <div className={styles.componentLibSelect}>
        <span>组件库：</span>
        <Select
          className={styles.select}
          variant="filled"
          options={[
            { label: 'Ant Design', value: 'antd' },
          ]}
          defaultValue={'antd'}
          onChange={handleSelectingComponentLib}
          onOpenChange={onDropdownVisibleChange}
          styles={ { popup: { root: { width: 140 }}}}
          suffixIcon={
            <ExpandDown
              style={{
                color: '#9499A0',
                pointerEvents: 'none',
                transform: selectIsOpen ? 'rotate(180deg)' : undefined,
                transition: 'transform .3s ease-in-out'
              }}
            />
          }
        />
      </div>
      <Input
        className={styles.componentSearch}
        classNames={{
          input: styles.componentSearchInput,
          prefix: styles.componentSearchPrefix
        }}
        placeholder="例: Input/输入框"
        allowClear
        prefix={<SearchIcon />}
        variant="borderless"
        onInput={handleInput}
        onPressEnter={handleSearch}
        onBlur={handleSearch}
      />
      <div className={styles.componentWrapper}>{renderComponentPanelBody()}</div>
    </div>
  );
}

ComponentPanel.displayName = 'ComponentPanel';

const Index = observer(ComponentPanel);

export default Index;