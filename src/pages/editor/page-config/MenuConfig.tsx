import { useForm } from 'antd/es/form/Form';
import { DSLStoreContext, EditorPageStoreContext, EditorStoreContext } from '@/hooks/context';
import { Key, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Cascader, Col, Form, Input, message, Row, Select, SelectProps, Switch, Tooltip } from 'antd';
import { debounce, flattenDeep, omitBy, uniq } from 'lodash';
import { FormProps } from 'antd/lib';
import DraggableTree from '@/pages/components/draggable-tree';
import { SettingOutlined } from '@ant-design/icons';
import { DataNode } from 'antd/es/tree';
import { ProMenuProps } from '@bilibili/ui';
import { findNode } from '@/pages/components/draggable-tree/utils';
import SelectPage from './SelectPage';
import styles from './index.module.less';
import { mapTree } from '@/util';
import NewFileManager from '@/service/new-file-manager';
import { observer } from 'mobx-react';
import { UrlType } from '@/enum';
import { postVoltronMenuUpdate } from '@/api';
import DSLStore from '@/service/dsl-store';

type MenuConfigProps = {
  projectId: string;
};

type Item = Omit<ProMenuProps['items'][number], 'type'> & {
  type: UrlType;
  pageId?: string;
  url?: string;
  key: string;
  label?: ReactNode;
};

export type MenuItem = (Item & {
  children?: Item[];
});
export type MenuConfig = {
  show?: boolean;
  items?: MenuItem[];
  openKeys?: string[];
  selectedKeys?: string[];
  defaultOpenKeys?: string[];
  defaultSelectedKeys?: string[];
};

type MenuFieldType = MenuConfig;

const typeOptions: SelectProps['options'] = [
  {
    label: '内部链接',
    value: UrlType.INTERNAL_LINK
  },
  {
    label: '外部链接',
    value: UrlType.EXTERNAL_LINK
  }
];

interface Tree {
  children?: Tree[];
  [key: string]: any;
}

/**
 * 移除树的叶子节点
 * @param tree
 */
function removeLeaf<T extends Tree[]>(treeData: T): T | null {
  if (!treeData.length) {
    return null;
  }
  return treeData
    .filter(i => i?.children?.length)
    .map(i => ({
      ...i,
      children: removeLeaf(i.children)
    })) as T;
}

export default observer(function MenuConfig({projectId}: MenuConfigProps)  {
  const [form] = useForm();
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);
  const [messageApi, contextHolder] = message.useMessage();
  const { editorPageMethod } = useContext(EditorPageStoreContext);

  const [loading, setLoading] = useState(false);

  const menu = editorStore.menuConfig ?? {};
  const initialValues: MenuFieldType = {
    ...menu
  };

  const items = Form.useWatch<MenuFieldType['items']>('items', form) || [];
  const itemsWithoutLeaf = removeLeaf(items);

  const onValuesChange = (value, values) => {
    const defaultOpenKeys = uniq(flattenDeep(values.defaultOpenKeys));
    const defaultSelectedKeys = uniq(flattenDeep(values.defaultSelectedKeys));
    editorStore.setMenuConfig({
      ...menu,
      ...values,
      show: values.show,
      defaultOpenKeys,
      defaultSelectedKeys
    });
  };

  const [showSetting, setShowSetting] = useState<Record<string, boolean>>({});
  const [externalUrl, setExternalUrl] = useState<Record<string, string>>({});

  const handleSetting = (nodeData: DataNode) => {
    showSetting[nodeData.key as string] = !showSetting[nodeData.key as string];
    setShowSetting(showSetting);
  };

  const deepCheckSetting = (list: DataNode[]) => {
    list.forEach(i => {
      if (i?.children?.length) {
        showSetting[i.key as string] = false;
        deepCheckSetting(i.children);
      }
    });
  };
  const findTreeNode = (key?: Key) => {
    return findNode(items, curNode => {
      return curNode.key === key;
    })[0];
  };

  const checkComplete = (data: any) => {
    if (!data?.children?.length) {
      return Boolean(data.pageId || data.url);
    } else {
      return data.children.every(child => checkComplete(child));
    }
  };


  const saveMenu = async () => {
    setLoading(true);
    const pageId = dslStore.currentPageId;
    try {
      const menusParams = mapTree(menu.items, (item: any) => omitBy({
        ...item,
        id: item.id,
        name: item.label,
        urlType: item.type,
        url: item.type === UrlType.EXTERNAL_LINK ? item.url : item.pageId,
        key: undefined,
        label: undefined,
        pageId: undefined,
        type: undefined
      }, value => value === undefined));
      await postVoltronMenuUpdate({
        projectId,
        menus: menusParams
      });
      await NewFileManager.updatePage(pageId, { showMenu: Number(menu.show) });
      setLoading(false);
      messageApi.success('菜单保存成功');
      await editorPageMethod.fetchMenu();
    } catch {
      setLoading(false);
      messageApi.error('菜单保存失败');
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      ...menu
    });
  }, [menu]);

  return (
    <div className={styles['wrapper']}>
      {contextHolder}
      <div className={styles['save-btn']}>
        <Button
          size="small"
          type="primary"
          loading={loading}
          onClick={e => {
            saveMenu();
          }}
        >
          保存
        </Button>
      </div>
      <Form
        layout="vertical"
        className={styles['form-wrapper']}
        form={form}
        initialValues={initialValues}
        onValuesChange={onValuesChange}
      >
        <Form.Item<MenuFieldType> label="是否显示菜单" name="show">
          <Switch></Switch>
        </Form.Item>
        <Form.Item<MenuFieldType> label="菜单" name="items">
          <DraggableTree
            fieldNames={{
              title: 'label'
            }}
            expandedKeyPath={menu.openKeys}
            styles={{
              input(data: any) {
                if (checkComplete(data)) {
                  return {
                    borderColor: 'green'
                  };
                }
                return null;
              }
            }}
            renderExtra={(nodeData: Item) => {
              if (!nodeData) return null;
              const isExternal = nodeData.type === UrlType.EXTERNAL_LINK;
              return showSetting[nodeData.key] ? (
                <div style={{ padding: '8px' }}>
                  <Row align="middle" style={{ marginBottom: '8px' }}>
                    <Col span={8}>链接类型：</Col>
                    <Col span={16}>
                      <Select
                        placeholder="选择链接类型"
                        options={typeOptions}
                        value={nodeData.type}
                        onChange={e => {
                          const item = findTreeNode(nodeData.key);
                          item.type = e;
                          form.setFieldValue('items', items);
                          onValuesChange(items, form.getFieldsValue());
                        }}
                      />
                    </Col>
                  </Row>
                  {isExternal ? (
                    <Row align="middle" style={{ marginBottom: '8px' }}>
                      <Col span={8}>链接地址：</Col>
                      <Col span={16}>
                        <Input
                          placeholder="输入链接地址"
                          value={externalUrl[nodeData.key]}
                          defaultValue={nodeData.url}
                          onChange={e => {
                            externalUrl[nodeData.key] = e.target.value;
                            setExternalUrl({
                              ...externalUrl
                            });
                            const item = findTreeNode(nodeData.key);
                            item.url = e.target.value;
                            form.setFieldValue('items', items);
                            onValuesChange(items, form.getFieldsValue());
                          }}
                        />
                      </Col>
                    </Row>
                  ) : (
                    <Row align="middle" style={{ marginBottom: '8px' }}>
                      <Col span={8}>关联页面：</Col>
                      <Col span={16}>
                        <SelectPage
                          placeholder="选择关联页面"
                          value={nodeData.pageId}
                          onChange={e => {
                            const item = findTreeNode(nodeData.key);
                            item.pageId = e;
                            form.setFieldValue('items', items);
                            onValuesChange(items, form.getFieldsValue());
                          }}
                        ></SelectPage>
                      </Col>
                    </Row>
                  )}
                </div>
              ) : null;
            }}
            renderExtraAction={nodeData => {
              return nodeData?.children?.length ? null : (
                <Tooltip title="高级配置">
                  <SettingOutlined onClick={e => handleSetting(nodeData)}></SettingOutlined>
                </Tooltip>
              );
            }}
            onDragend={dataList => {
              deepCheckSetting(dataList);
            }}
          />
        </Form.Item>
        <Form.Item<MenuFieldType> label="默认展开项" name="defaultOpenKeys">
          <Cascader
            options={itemsWithoutLeaf}
            changeOnSelect
            showCheckedStrategy={Cascader.SHOW_CHILD}
            fieldNames={{
              value: 'key'
            }}
          ></Cascader>
        </Form.Item>
        <Form.Item<MenuFieldType> label="默认选中项" name="defaultSelectedKeys">
          <Cascader
            options={items}
            fieldNames={{
              value: 'key'
            }}
          ></Cascader>
        </Form.Item>
      </Form>
    </div>
  );
});
