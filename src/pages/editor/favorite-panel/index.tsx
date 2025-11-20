import useDSLFragmentStore from '@/store/useDSLFragment';
import DraggableFavoriteComponent from '@/pages/editor/component-panel/draggable-favorite-component-item';
import { Tooltip } from 'antd';
import { CaretRightOutlined, CodeSandboxOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import { Collapse, Image, Input, message, Modal } from 'antd';
import { Eye, OpenedBox, SearchIcon } from '@/components/icon';
import { FC, Fragment, useRef, useState } from 'react';
import EmptySearchResult from '@/components/empty-search-result';
import ComponentContextMenu, { IComponentContextMenuProps } from '../component-context-menu';
import {
  DELETE_MODULE_COMPONENT_MENU,
  ModuleComponentOperateKey,
  PREVIEW_MODULE_COMPONENT_MENU,
  RENAME_MODULE_COMPONENT_MENU,
  SHARE_MODULE_COMPONENT_MENU
} from '@/data/constant';
import { GetVoltronModuleListAll } from '@/api';
import { IComponentIconProps } from '../component-panel';
import ComponentManager from '@/service/component-manager';
import RenameModuleComponentModal from './RenameModuleComponentModal';
import NewFileManager from '@/service/new-file-manager';

type DataItem = GetVoltronModuleListAll.ListItem;

export default function FavoritePanel() {
  const dslFragmentStore = useDSLFragmentStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [activeKey, setActiveKey] = useState<string[]>(['default']);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<DataItem>();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewPicName, setPreviewPicName] = useState('');
  const isCompose = useRef(false);
  function generateContextMenus(data: DataItem): IComponentContextMenuProps['items'] {
    return [
      [RENAME_MODULE_COMPONENT_MENU, DELETE_MODULE_COMPONENT_MENU],
      ...[data.coverUrl ? [PREVIEW_MODULE_COMPONENT_MENU] : []],
      [SHARE_MODULE_COMPONENT_MENU]
    ];
  }

  function renameModuleComponent(data: DataItem) {
    setRenameOpen(true);
    setCurrentItem(data);
  }

  function deleteModuleComponent(data: DataItem) {
    Modal.confirm({
      title: '删除组件',
      content: `确认删除组件${data.name}`,
      onOk: () => {
        dslFragmentStore.deleteItem(data.id);
      }
    });
  }

  async function handlePreview(batchKey: string, name: string) {
    if (!batchKey) return;
    const url = await NewFileManager.fetchUrl(batchKey);
    setPreviewUrl(url);
    setPreviewVisible(true);
    setPreviewPicName(name);
  }

  function handleShare(data: DataItem) {
    message.warning('暂未实现');
  }

  async function handleClickDropDownMenu(key: string, data: DataItem) {
    switch (key) {
      case ModuleComponentOperateKey.PREVIEW_MODULE_COMPONENT:
        handlePreview(data.coverUrl, data.name);
        break;
      case ModuleComponentOperateKey.RENAME_MODULE_COMPONENT:
        renameModuleComponent(data);
        break;
      case ModuleComponentOperateKey.DELETE_MODULE_COMPONENT:
        deleteModuleComponent(data);
        break;
      case ModuleComponentOperateKey.SHARE_MODULE_COMPONENT:
        handleShare(data);
        break;
    }
  }

  function renderFavoriteList() {
    const list = dslFragmentStore.dslFragmentList;

    const filterList = searchKeyword
      ? list?.filter(item => {
        return item.name.toLocaleUpperCase().includes(searchKeyword.toLocaleUpperCase());
      })
      : list;

    if (!filterList?.length) {
      return (
        <div className={styles.emptyWrapper}>
          {searchKeyword ? (
            <EmptySearchResult keyword={searchKeyword}>暂无相关组件</EmptySearchResult>
          ) : (
            <Fragment>
              <OpenedBox className={styles.eventIcon} />
              <span>暂无组件</span>
            </Fragment>
          )}
        </div>
      );
    }

    const tpl = filterList.map((item, index) => {
      let ComponentIcon: FC<IComponentIconProps>;
      const child = item.dsl?.child || {};
      const { configName = '', current = '' } = child;
      if (configName && current) {
        const dependence = item.dsl.componentIndexes?.[current]?.dependency;
        ComponentIcon = ComponentManager.fetchComponentConfig(configName, dependence).icon;
      }
      return (
        <Fragment key={index}>
          {contextHolder}

          <DraggableFavoriteComponent name={item.name} dsl={item.dsl}>
            <ComponentContextMenu items={generateContextMenus(item)} data={item} onClick={handleClickDropDownMenu}>
              <Tooltip title={item.name}>
                <div className={styles.componentItem}>
                  {ComponentIcon ? (
                    <ComponentIcon className={styles.componentIcon} />
                  ) : (
                    <CodeSandboxOutlined className={styles.defaultIcon} />
                  )}
                  <p className={styles.componentTitle} title={item.name}>
                    {item.name}
                  </p>
                  {Boolean(item.coverUrl) && <Eye className={styles.preview} onClick={() => handlePreview(item.coverUrl, item.name)} />}
                </div>
              </Tooltip>
            </ComponentContextMenu>
          </DraggableFavoriteComponent>
        </Fragment>
      );
    });
    return <div className={styles.componentList}>{tpl}</div>;
  }

  function renderComponentPanelBody() {
    const favorite = {
      key: 'default',
      label: '默认收藏',
      children: renderFavoriteList()
    };

    const items = [favorite];

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

  const handleSearch = val => {
    setSearchKeyword(val.target.value.trim());
  };

  return (
    <div className={styles.componentPanel}>
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
        onChange={val => {
          if (isCompose.current) return;
          handleSearch(val);
        }}
        onCompositionStart={() => {
          isCompose.current = true;
        }}
        onCompositionEnd={val => {
          handleSearch(val);
          isCompose.current = false;
        }}
      />
      <div className={styles.componentWrapper}>{renderComponentPanelBody()}</div>
      <RenameModuleComponentModal
        data={currentItem}
        open={renameOpen}
        onClose={() => {
          setRenameOpen(false);
        }}
      />
      <Image
        width={100}
        style={{ display: 'none' }}
        src={previewUrl}
        alt={previewPicName}
        preview={{
          visible: previewVisible,
          scaleStep: 0.5,
          src: previewUrl,
          imageRender(originalNode, info) {
            return originalNode;
          },
          onVisibleChange: value => {
            setPreviewVisible(value);
          }
        }}
      />
    </div>
  );
}
