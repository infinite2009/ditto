import { observer } from 'mobx-react';
import { Button, Card, Drawer, Form, Input, Select, Space, Tooltip } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';

import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';

import styles from './index.module.less';
import { reaction, toJS } from 'mobx';
import { useMount } from 'ahooks';
import { Info } from '@/components/icon';

function VariableConfig() {
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);
  const [form] = useForm();

  const [actionOptions, setActionOptions] = useState<any>([]);

  useMount(() => {
    reaction(
      () => toJS(dslStore.dsl?.actions),
      () => {
        setActionOptions(
          Object.values(dslStore.dsl?.actions).map(item => {
            return {
              value: item.id,
              label: item.name
            };
          })
        );
      }
    );
  });

  useEffect(() => {
    form.setFieldValue('list', Object.values(toJS(dslStore.dsl?.variableDict) || {}));
  }, [dslStore.dsl?.variableDict]);

  function onFinish() {
    const result = {};
    form.getFieldValue('list').forEach(item => {
      result[item.key] = {
        ...item
      };
    });
    dslStore.syncVariables(result);
  }

  function renderCardExtraUI(name: number, removeFn: any) {
    const variableInfo = form.getFieldValue(['list', name]);
    const result = dslStore.variableUsageInfo(variableInfo.key);
    if (result) {
      return (
        <Tooltip
          title={
            <span>
              {result.componentId}的{result.propsName}属性正在使用该变量，如需删除请先解除使用
            </span>
          }
        >
          <Info />
        </Tooltip>
      );
    }
    return (
      <CloseOutlined
        onClick={() => {
          removeFn(name);
        }}
      />
    );
  }

  function renderVariableList() {
    return (
      <Form form={form} name="variableList" labelCol={{ span: 6 }} onFinish={onFinish} style={{ maxWidth: 600 }}>
        <Form.List name="list">
          {(fields, { add, remove }, { errors }) => (
            <div className={styles.list}>
              {fields.map((field, index) => (
                <Card
                  size="small"
                  title={`变量 ${field.name + 1}`}
                  key={field.key}
                  extra={renderCardExtraUI(field.name, remove)}
                >
                  <Form.Item
                    label="变量名"
                    name={[field.name, 'name']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: '请输入变量名'
                      }
                    ]}
                  >
                    <Input placeholder="请输入变量中文名" />
                  </Form.Item>
                  <Form.Item
                    label="变量Key"
                    name={[field.name, 'key']}
                    rules={[
                      {
                        required: true,
                        message: '请输入变量 Key'
                      },
                      {
                        validator: (rule, value) => {
                          if (!value && !/^[a-z,A-Z]+/.test(value)) {
                            return Promise.reject(new Error('变量 Key 应以字母开头'));
                          }
                          const duplicatedKeys = form
                            .getFieldsValue()
                            .list.map((variable: { key: string }) => variable.key)
                            .filter((key: string) => key === value);
                          if (duplicatedKeys.length >= 2) {
                            return Promise.reject(new Error('已有同名变量'));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <Input placeholder="请输入变量英文名" />
                  </Form.Item>
                  <Form.Item label="描述" name={[field.name, 'desc']}>
                    <Input placeholder="请输入描述" />
                  </Form.Item>
                  <Form.Item
                    label="变量类型"
                    name={[field.name, 'type']}
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: '请输入变量类型'
                      }
                    ]}
                  >
                    <Select
                      options={[
                        { value: 'string', label: '字符串' },
                        { value: 'object', label: '对象' },
                        { value: 'array', label: '数组' },
                        { value: 'boolean', label: '布尔值' },
                        { value: 'number', label: '数字' }
                      ]}
                      placeholder="请输入变量类型"
                    />
                  </Form.Item>
                  <Form.Item label="初始值" name={[field.name, 'initialValue']}>
                    <Input placeholder="请输入初始值" />
                  </Form.Item>
                  {/*<Form.Item label="发生变化时" name={[field.name, 'onChange']}>*/}
                  {/*  <Select options={actionOptions} placeholder="请选择动作" />*/}
                  {/*</Form.Item>*/}
                </Card>
              ))}
              <div className={styles.formFooter}>
                <Button className={styles.button} type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  变量
                </Button>
              </div>
            </div>
          )}
        </Form.List>
      </Form>
    );
  }

  function submitVariables() {
    form.submit();
  }

  function closeModal() {
    editorStore.closeVariableConfig();
  }

  function closeVariableConfigDrawer() {
    editorStore.closeVariableConfig();
  }

  return (
    <Drawer
      open={editorStore.variableConfigVisible}
      title="变量配置"
      onClose={closeVariableConfigDrawer}
      placement="left"
      extra={
        <Space>
          <Button onClick={closeModal}>取消</Button>
          <Button onClick={submitVariables} type="primary">
            保存
          </Button>
        </Space>
      }
    >
      {renderVariableList()}
    </Drawer>
  );
}

VariableConfig.display = 'VariableConfig';

export default observer(VariableConfig);
