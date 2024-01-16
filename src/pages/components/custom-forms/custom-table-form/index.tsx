import { useEffect } from 'react';
import { useForm } from 'antd/es/form/Form';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Switch, Typography } from 'antd';
import { toJS } from 'mobx';
import { ICustomFormProps } from '@/types';

import style from './index.module.less';

export default function CustomTableForm(props: ICustomFormProps) {
  const [form] = useForm();

  useEffect(() => {
    const convertedColumns = props.value.columns.map(col => {
      return {
        title: col.title,
        defaultValue: '',
        componentName: 'Input',
        useSort: false,
        useFilter: false
      };
    });
    form.setFieldsValue({
      columns: convertedColumns
    });
  }, [props]);

  function generateDefaultColumn() {
    return {
      title: '默认字段',
      defaultValue: '',
      componentName: 'Input',
      useSort: false,
      useFilter: false
    };
  }

  return (
    <Form form={form}>
      <Form.Item>
        <p>列设置</p>
        <Form.List name="columns">
          {(fields, { add, remove }) => (
            <div>
              {fields.map(field => (
                <div key={field.name} className={style.fieldWrapper}>
                  <div>
                    <Form.Item label="名字" name={[field.name, 'title']}>
                      <Input />
                    </Form.Item>
                    <Form.Item label="默认值" name={[field.name, 'defaultValue']}>
                      <Input />
                    </Form.Item>
                    <Form.Item label="组件" name={[field.name, 'componentName']}>
                      <Select>
                        <Select.Option value="Input">输入框</Select.Option>
                        <Select.Option value="Select">选择器</Select.Option>
                        <Select.Option value="Switch">开关</Select.Option>
                        <Select.Option value="Checkbox">复选框</Select.Option>
                        <Select.Option value="Radio">复选框</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, nextValues) =>
                        prevValues.columns[field.name].componentName !== nextValues.columns[field.name].componentName
                      }
                    >
                      {({ getFieldValue }) => {
                        const value = getFieldValue(['columns', field.name, 'componentName']);
                        if (value !== 'Select') {
                          return null;
                        }
                        return (
                          <>
                            <div>选项</div>
                            <Form.List name={[field.name, 'componentProps', 'options']}>
                              {(subFields, subOpt) => (
                                <div>
                                  {subFields.map(subField => (
                                    <div key={subField.name}>
                                      <div>
                                        <Form.Item label="名称" name={[subField.name, 'label']}>
                                          <Input />
                                        </Form.Item>
                                        <Form.Item label="值" name={[subField.name, 'value']}>
                                          <Input />
                                        </Form.Item>
                                      </div>
                                      <CloseOutlined onClick={() => subOpt.remove(subField.name)} />
                                    </div>
                                  ))}
                                  <Button onClick={() => subOpt.add()} icon={<PlusOutlined />} />
                                </div>
                              )}
                            </Form.List>
                          </>
                        );
                      }}
                    </Form.Item>
                    <Form.Item label="排序" name={[field.name, 'useSort']}>
                      <Switch />
                    </Form.Item>
                    <Form.Item label="过滤" name={[field.name, 'useFilter']}>
                      <Switch />
                    </Form.Item>
                  </div>
                  <CloseOutlined onClick={() => remove(field.name)} />
                </div>
              ))}
              <Button icon={<PlusOutlined />} onClick={() => add(generateDefaultColumn())}></Button>
            </div>
          )}
        </Form.List>
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {() => (
          <Typography>
            <pre>{JSON.stringify(form.getFieldsValue(), null, 2)}</pre>
          </Typography>
        )}
      </Form.Item>
    </Form>
  );
}
