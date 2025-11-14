import { observer } from 'mobx-react';
import { useForm } from 'antd/es/form/Form';
import { Form, Switch } from 'antd';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';
import { useEffect } from 'react';

export type RulesSettingValue = {
  type: 'number' | 'string' | 'other';
  required: boolean;
  max?: number;
  min?: number;
};

export interface RulesSettingProps {
  onChange: (data: RulesSettingValue) => void;
  value: Partial<RulesSettingValue>;
}

function RulesSetting({ onChange, value }: RulesSettingProps) {
  const [form] = useForm();

  useEffect(() => {
    form.setFieldsValue(value);
  }, [value]);

  function renderMinAndMaxSetting() {
    const type = form.getFieldValue('type');
    const required = form.getFieldValue('required');
    if (!required) {
      return null;
    }
    const messageTpl = (
      <Form.Item label="提示语" name="message">
        <FormInput placeholder="请填写提示语"/>
      </Form.Item>
    );
    switch (type) {
      case 'number':
        return (
          <>
            <Form.Item label="最大值" name="max">
              <FormInput placeholder="请填写最大值" />
            </Form.Item>
            <Form.Item label="最小值" name="min">
              <FormInput placeholder="请填写最小值" />
            </Form.Item>
            {messageTpl}
          </>
        );
      case 'string':
        return (
          <>
            <Form.Item label="字数上限" name="max">
              <FormInput placeholder="请填写字数上限"/>
            </Form.Item>
            {messageTpl}
          </>
        );
      default:
        return null;
    }
  }

  function handleValuesChange(_: Partial<RulesSettingValue>, values: RulesSettingValue) {
    onChange?.(values);
  }

  return (
    <Form<RulesSettingValue> form={form} onValuesChange={handleValuesChange}>
      <Form.Item label="必选" name="required">
        <Switch checkedChildren="开启" unCheckedChildren="未开启" />
      </Form.Item>
      <Form.Item noStyle shouldUpdate={(preVal, curVal) => curVal.required}>
        {renderMinAndMaxSetting()}
      </Form.Item>
    </Form>
  );
}

export default observer(RulesSetting);
