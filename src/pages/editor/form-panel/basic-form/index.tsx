import { Cascader, Checkbox, Form, Input, InputNumber, Radio, Select, Switch } from 'antd';
import { FC, useEffect } from 'react';
import { FormSchema } from '@/types/form-config';
import { useForm } from 'antd/es/form/Form';

import style from './index.module.less';
import { typeOf } from '@/util';

export interface IBasicFormProps {
  onChange: (value: Record<string, any>) => void;
  value?: Record<string, any>;
  formSchema: FormSchema;
}

const formItemDict: Record<string, FC<any>> = {
  Input: Input,
  InputNumber: InputNumber,
  Select: Select,
  Switch: Switch,
  Checkbox: Checkbox,
  Radio: Radio,
  Cascader: Cascader
};

export default function BasicForm({ value, onChange, formSchema }: IBasicFormProps) {
  const [form] = useForm();

  useEffect(() => {
    form.setFieldsValue(value);
  }, [value]);
  function handleChanging(value: Record<string, any>) {
    if (onChange) {
      onChange(value);
    }
  }

  function renderFormItems() {
    if (!formSchema) {
      return null;
    }
    return Object.entries(formSchema).map(([name, config]) => {
      const Component = typeOf(config.component === 'string')
        ? formItemDict[config.component as string]
        : config.component;
      if (!Component) {
        <Form.Item key={name} label={config.title} name={name} help={config.help}>
          <div>错误：不存在的表单项组件</div>
        </Form.Item>;
      }
      return (
        <Form.Item key={name} label={config.title} name={name} help={config.help}>
          <Component {...config.componentProps} />
        </Form.Item>
      );
    });
  }

  return (
    <div className={style.basicForm}>
      <Form form={form} onValuesChange={handleChanging}>
        {renderFormItems()}
      </Form>
    </div>
  );
}
