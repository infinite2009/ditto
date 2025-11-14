import { FC, useEffect, useMemo } from 'react';
import { Button, Cascader, Checkbox, DatePicker, Form, Radio, Switch } from 'antd';
import { useForm } from 'antd/es/form/Form';
import IActionSchema from '@/types/action.schema';

import styles from './index.module.less';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';
import FormInputNumber from '@/pages/editor/form-panel/basic-form/form-input-number';
import FormSelect from '@/pages/editor/form-panel/basic-form/form-select';
import UploadInput from '@/pages/components/upload';

export interface IEventFormProps {
  actionList: IActionSchema[];
  event: Record<string, { name: string; title: string; component: string | FC<any> }>;
  eventList?: Record<string, any>;
  initialValue: Record<string, string>;
  onChange: (value: Record<string, any>) => void;
}

const formItemDict: Record<string, FC<any>> = {
  Input: FormInput,
  InputNumber: FormInputNumber,
  Select: FormSelect,
  Switch: Switch,
  Checkbox: Checkbox,
  Radio: Radio,
  DatePicker: DatePicker,
  'Radio.Group': Radio.Group,
  Cascader: Cascader,
  Upload: UploadInput
};

export default function EventForm({ initialValue, onChange, actionList, event }: IEventFormProps) {
  const [form] = useForm();

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(initialValue);
  }, [initialValue]);

  function handleChangingForm(value: Record<string, { action: string; eventTrackingInfo: string }>) {
    if (onChange) {
      onChange(value);
    }
  }

  const actionOptions = useMemo(() => {
    if (!actionList) {
      return [];
    }
    return actionList.map(item => {
      return {
        value: item.id,
        label: item.name
      };
    });
  }, [actionList]);

  function renderFormItems() {
    return Object.values(event).map(({ name, title, component }) => {
      const Component = formItemDict[component as string];
      return (
        <Form.Item key={name} label={title}>
          <Form.Item label="动作" name={[name, 'action']}>
            <Component options={actionOptions} />
          </Form.Item>
          <Form.Item label="埋点" name={[name, 'eventTrackingInfo']}>
            <FormInput />
          </Form.Item>
        </Form.Item>
      );
    });
  }

  return (
    <Form className={styles.eventForm} form={form} onFinish={handleChangingForm}>
      {renderFormItems()}
      <div className={styles.submitWrapper}>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </div>
    </Form>
  );
}

EventForm.displayName = 'EventForm';
