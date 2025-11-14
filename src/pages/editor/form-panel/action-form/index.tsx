import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Form, FormInstance, Input, Select, Tag } from 'antd';
import { CloseThin, PlusThin } from '@/components/icon';
import ActionType from '@/types/action-type';

import IComponentSchema from '@/types/component.schema';
import styles from './index.module.less';
import { nanoid } from 'nanoid';
import IActionSchema from '@/types/action.schema';
import ComponentManager from '@/service/component-manager';
import NewFileManager from '@/service/new-file-manager';

export interface IActionFormProps {
  actionList: IActionSchema[];
  appIds: string[];
  componentList: IComponentSchema[];
  form: FormInstance;
  onChange?: (data: any) => void;
}

export default function ActionForm({ form, componentList, appIds, onChange, actionList }: IActionFormProps) {
  const [interfaceOptions, setInterfaceOptions] = useState<
    Record<
      string,
      {
        env: any;
        value: string;
        label: string | React.ReactNode;
        method: string;
        path: string;
        name: string;
      }[]
    >
  >({});

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('actions: ', actionList);
    form.setFieldsValue({ actions: actionList });
    // 找到所有的数据请求动作，初始化接口配置
    initAPIOptions(actionList).then();
  }, [actionList]);

  async function initAPIOptions(actionList: IActionSchema[]) {
    const result = {};
    for (const action of actionList) {
      if (action.type === ActionType.HTTP_REQUEST) {
        const appId = (action.options as any).appId;
        if (!result[appId]) {
          const interfaces = await NewFileManager.fetchInterfacesByAppId(appId);
          result[appId] = interfaces.map(item => {
            return {
              key: item.id,
              value: item.path,
              label: item.name,
              method: item.method,
              path: item.path,
              name: item.name,
              env: item.env
            };
          });
        }
      }
    }
    setInterfaceOptions(result);
  }

  const appOptions = useMemo(() => {
    return (appIds || []).map(appId => {
      return {
        value: appId,
        label: appId
      };
    });
  }, [appIds]);

  const layerComponentOptions = useMemo(() => {
    return (componentList || [])
      .filter(cmp => {
        const config = ComponentManager.fetchComponentConfig(cmp.configName, cmp.dependency);
        return config.isLayer;
      })
      .map(cmp => {
        return {
          label: cmp.displayName,
          value: cmp.id
        };
      });
  }, [componentList]);

  function handleAppIdChange(value: string) {
    NewFileManager.fetchInterfacesByAppId(value).then(interfaces => {
      interfaceOptions[value] = interfaces.map(item => {
        return {
          key: item.id,
          value: item.path,
          label: item.name,
          method: item.method,
          path: item.path,
          name: item.name,
          env: item.env
        };
      });
      setInterfaceOptions({ ...interfaceOptions });
    });
    return value;
  }

  function handleInterfaceChange(value: string, appId: string) {
    const res = interfaceOptions[appId].find(item => item.value === value);
    return {
      url: res.path,
      method: res.path
    };
  }

  function handleFormFinish(allValues: any) {
    onChange?.(allValues.actions);
  }

  function renderActionOption(fieldPath: (number | string)[], fieldPathForOptions: (number | string)[]) {
    const action = form.getFieldValue(fieldPath);
    switch (action) {
      case ActionType.PAGE_DIRECTION:
        return renderPageRedirection(fieldPathForOptions);
      case ActionType.EXTERNAL_PAGE_OPEN:
        return renderExternalPageOpen(fieldPathForOptions);
      case ActionType.STATE_TRANSITION:
        return renderStateTransition();
      case ActionType.OPEN_LAYER:
        return renderLayerSelector(fieldPathForOptions);
      case ActionType.CLOSE_LAYER:
        return renderLayerSelector(fieldPathForOptions);
      case ActionType.HTTP_REQUEST:
        return renderHttpRequest(fieldPathForOptions);
      default:
        return <div>请选择一个动作</div>;
    }
  }

  function renderLayerSelector(path: (number | string)[]): React.JSX.Element {
    return (
      <Form.Item name={[...path, 'target']} label="组件">
        <Select options={layerComponentOptions} placeholder="请选择图浮层组件" />
      </Form.Item>
    );
  }

  /**
   * 展示数据请求的表单配置
   */
  function renderHttpRequest(path: (number | string)[]) {
    const methodColorDict = {
      GET: '#2db7f5',
      POST: '#87d068',
      PUT: '#2db',
      DELETE: '#f50'
    };
    const appId = form.getFieldValue(['actions', ...path, 'appId']);
    return (
      <>
        <Form.Item name={[...path, 'appId']} label="app" getValueFromEvent={handleAppIdChange}>
          <Select options={appOptions} />
        </Form.Item>
        <Form.Item
          name={[...path, 'requestOpt']}
          label="接口"
          getValueFromEvent={value => handleInterfaceChange(value, appId)}
        >
          <Select
            options={interfaceOptions[appId]}
            popupMatchSelectWidth={false}
            optionRender={option => {
              return (
                <div>
                  <Tag color={option.data.env.toLowerCase() === 'prod' ? 'green' : 'red'}>{option.data.env}</Tag>
                  <Tag color={methodColorDict[option.data.method] || '#red'}>{option.data.method.toUpperCase()}</Tag>
                  {option.data.label}
                </div>
              );
            }}
          />
        </Form.Item>
      </>
    );
  }

  function renderExternalPageOpen(fieldPath: (number | string)[]) {
    return (
      <Form.Item name={[...fieldPath, 'url']} label="链接地址">
        <Input placeholder="请输入外部链接" />
      </Form.Item>
    );
  }

  function renderPageRedirection(fieldPath: (number | string)[]) {
    return (
      <Form.Item name={[...fieldPath, 'url']} label="路由">
        <Input placeholder="请输入页面路径" />
      </Form.Item>
    );
  }

  function renderStateTransition() {
    return <div>待实现</div>;
  }

  return (
    <Form
      className={styles.actionForm}
      form={form}
      onFinish={handleFormFinish}
      scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}
      labelCol={{ span: 4 }}
    >
      <Form.List name="actions">
        {(fields, { add, remove }) => (
          <div className={styles.formWrapper}>
            <div className={styles.formBody} ref={ref}>
              {fields.map(field => (
                <Card
                  size="small"
                  title={`动作 ${field.name + 1}`}
                  key={field.key}
                  extra={
                    <CloseThin
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  }
                >
                  <Form.Item label="id" name={[field.name, 'id']} hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="名称"
                    name={[field.name, 'name']}
                    rules={[{ required: true, message: '请输入名称' }]}
                  >
                    <Input placeholder="请输入英文、数字或下划线" />
                  </Form.Item>
                  <Form.Item label="描述" name={[field.name, 'desc']}>
                    <Input placeholder="请输入描述，用于注释" />
                  </Form.Item>
                  <Form.Item
                    label="类型"
                    name={[field.name, 'type']}
                    rules={[{ required: true, message: '请选择类型' }]}
                  >
                    <Select
                      placeholder="请选择动作"
                      options={[
                        {
                          label: '跳转页面',
                          value: ActionType.PAGE_DIRECTION
                        },
                        {
                          label: '打开外部链接',
                          value: ActionType.EXTERNAL_PAGE_OPEN
                        },
                        {
                          label: '打开浮层组件',
                          value: ActionType.OPEN_LAYER
                        },
                        {
                          label: '关闭浮层组件',
                          value: ActionType.CLOSE_LAYER
                        },
                        {
                          label: '请求数据',
                          value: ActionType.HTTP_REQUEST
                        }
                      ]}
                    />
                  </Form.Item>
                  <Form.Item label="配置" shouldUpdate={() => true}>
                    {() => renderActionOption(['actions', field.name, 'type'], [field.name, 'options'])}
                  </Form.Item>
                </Card>
              ))}
            </div>
            <Button
              className={styles.actionBtn}
              icon={<PlusThin />}
              onClick={() => {
                add({ id: nanoid() });
                setTimeout(() => {
                  ref.current.scrollTop = ref.current.scrollHeight;
                }, 17);
              }}
            >
              动作
            </Button>
          </div>
        )}
      </Form.List>
    </Form>
  );
}
