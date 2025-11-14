import { Col, Form, Input, Row, Select, Space, Upload, Card, Button, SelectProps, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { EditorPageStoreContext, EditorStoreContext } from '@/hooks/context';
import { nanoid } from 'nanoid';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { cloneDeep, debounce, isNumber } from 'lodash';
import { FormProps } from 'antd/lib';
import SortableItem from '@/pages/components/sortable-item';
import SelectPage from './SelectPage';
import styles from './index.module.less';
import { observer } from 'mobx-react';
import { PostVoltronNavigationUpdate, postVoltronNavigationUpdate } from '@/api';
import { UrlType } from '@/enum';
import UploadInput from '@/pages/components/upload';

type NavConfigProps = {
  projectId: string;
};

export type NavItem = {
  label: string;
  key: string | number;
  url?: string;
  pageId?: string;
  type?: UrlType;
};

export type NavConfig = {
  logo?: string;
  items?: NavItem[];
};

type NavFieldType = Omit<NavConfig, 'logo'> & {
  logo: string;
};

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

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 }
  }
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 }
  }
};

export default observer(function NavConfig({ projectId }: NavConfigProps) {
  const [form] = useForm();
  const editorStore = useContext(EditorStoreContext);
  const { editorPageMethod } = useContext(EditorPageStoreContext);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);

  const nav = editorStore.navConfig ?? {};

  const initialValues: NavFieldType = useMemo(() => {
    return {
      logo: nav?.logo,
      items: nav?.items?.length
        ? nav.items
        : [{ label: '', key: nanoid(), url: '', pageId: '', type: UrlType.EXTERNAL_LINK }]
    };
  }, []);

  const items = Form.useWatch<NavFieldType['items']>('items', form) || [];

  const itemsKeys = useMemo(() => {
    return items.map(i => String(i.key));
  }, [items]);
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (active.id === over.id) return;
    const activeIndex = items.findIndex(item => String(item.key) === active.id);
    const overIndex = items.findIndex(item => String(item.key) === over.id);
    const newItems = arrayMove(items, activeIndex, overIndex);
    form.setFieldsValue({
      items: newItems
    });
    editorStore.setNavConfig({
      ...nav,
      items: newItems.filter(i => i?.label)
    });
  };

  const onValuesChange = (value, values) => {
    const config = {
      logo: values.logo,
      items: values.items?.length ? values.items.filter(i => i?.label) : []
    };
    editorStore.setNavConfig(config);
  };

  const saveNav = async () => {
    setLoading(true);
    try {
      const navigationList: PostVoltronNavigationUpdate.NavigationListItem[] = (nav.items ?? []).map(i => ({
        name: i.label,
        id: isNumber(i.key) ? i.key : undefined,
        url: i.type === UrlType.EXTERNAL_LINK ? i.url : i.pageId,
        urlType: i.type
      }));
      await postVoltronNavigationUpdate({
        projectId,
        navigationList
      });
      messageApi.success('导航栏保存成功');
      await editorPageMethod.fetchNav();

      setLoading(false);
    } catch {
      messageApi.error('导航栏保存失败');
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      logo: nav?.logo,
      items: nav?.items?.length
        ? nav.items
        : [{ label: '', key: nanoid(), url: '', pageId: '', type: UrlType.EXTERNAL_LINK }]
    });
  }, [nav]);

  return (
    <div className={styles['wrapper']}>
      {contextHolder}
      <div className={styles['save-btn']}>
        <Button
          size="small"
          type="primary"
          loading={loading}
          onClick={e => {
            saveNav();
          }}
        >
          保存
        </Button>
      </div>
      <Form
        className={styles['form-wrapper']}
        layout="vertical"
        form={form}
        initialValues={initialValues}
        onValuesChange={onValuesChange}
      >
        <Form.Item<NavFieldType> label="Logo" name="logo">
          <UploadInput></UploadInput>
        </Form.Item>
        <DndContext onDragEnd={onDragEnd}>
          <Form.List name="items">
            {(fields, { add, remove }, { errors }) => (
              <div>
                {fields.map((field, index) => (
                  <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? '菜单' : ''}
                    required={false}
                    key={field.key}
                  >
                    <SortableContext items={itemsKeys}>
                      <SortableItem
                        styles={{
                          header: {
                            alignItems: 'center'
                          },
                          dragItem: {
                            marginRight: '8px'
                          }
                        }}
                        key={`${items?.[index]?.key}`}
                        id={`${items?.[index]?.key})`}
                      >
                        <Card
                          style={{ flex: 1 }}
                          styles={{
                            body: {
                              padding: '12px'
                            }
                          }}
                        >
                          <Row align="middle" style={{ marginBottom: '8px' }} key={`label_${items?.[index]?.key}`}>
                            <Col span={8}>菜单名：</Col>
                            <Col span={16}>
                              <Form.Item {...field} name={[field.name, 'label']} noStyle>
                                <Input placeholder="输入菜单名" />
                              </Form.Item>
                            </Col>
                          </Row>
                          <Row align="middle" style={{ marginBottom: '8px' }} key={`type_${items?.[index]?.key}`}>
                            <Col span={8}>链接类型：</Col>
                            <Col span={16}>
                              <Form.Item {...field} name={[field.name, 'type']} noStyle>
                                <Select placeholder="选择链接类型" options={typeOptions} />
                              </Form.Item>
                            </Col>
                          </Row>
                          {items?.[index]?.type === UrlType.EXTERNAL_LINK ? (
                            <Row align="middle" style={{ marginBottom: '8px' }} key={`url_${items?.[index]?.key}`}>
                              <Col span={8}>链接地址：</Col>
                              <Col span={16}>
                                <Form.Item {...field} name={[field.name, 'url']} noStyle>
                                  <Input placeholder="输入链接地址" />
                                </Form.Item>
                              </Col>
                            </Row>
                          ) : (
                            <Row align="middle" style={{ marginBottom: '8px' }} key={`pageId_${items?.[index]?.key}`}>
                              <Col span={8}>关联页面：</Col>
                              <Col span={16}>
                                <Form.Item {...field} name={[field.name, 'pageId']} noStyle>
                                  <SelectPage placeholder="选择关联页面"></SelectPage>
                                </Form.Item>
                              </Col>
                            </Row>
                          )}
                        </Card>
                        <Space>
                          {fields.length > 1 ? (
                            <MinusCircleOutlined
                              className="dynamic-delete-button"
                              style={{ marginLeft: '8px', flex: '0 0 auto' }}
                              onClick={() => remove(field.name)}
                            />
                          ) : null}
                        </Space>
                      </SortableItem>
                    </SortableContext>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => {
                      add({
                        label: `菜单${fields.length}`,
                        key: nanoid(),
                        type: UrlType.EXTERNAL_LINK
                      });
                    }}
                    style={{ width: '60%' }}
                    icon={<PlusOutlined />}
                  >
                    新增
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </div>
            )}
          </Form.List>
        </DndContext>
      </Form>
    </div>
  );
});
