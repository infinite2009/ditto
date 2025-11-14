import { Cascader, Checkbox, Divider, Form, Radio, Switch } from 'antd';
import { FC, Fragment, useEffect } from 'react';
import { FormSchema } from '@/types/form-config';
import { useForm } from 'antd/es/form/Form';

import FormInput from '@/pages/editor/form-panel/basic-form/form-input';
import FormInputNumber from '@/pages/editor/form-panel/basic-form/form-input-number';
import UploadInput from '@/pages/components/upload';
import { typeOf } from '@/util';

import style from './index.module.less';
import FormSelect from '@/pages/editor/form-panel/basic-form/form-select';
import FormDatePicker from '@/pages/editor/form-panel/basic-form/form-datepicker';

export interface IBasicFormProps {
  formSchema: FormSchema;
  onChange: (value: Record<string, any>) => void;
  onReRender?: () => void;
  showDivider?: boolean;
  value?: Record<string, any>;
}

const formItemDict: Record<string, FC<any>> = {
  Input: FormInput,
  InputNumber: FormInputNumber,
  Select: FormSelect,
  Switch: Switch,
  Checkbox: Checkbox,
  Radio: Radio,
  DatePicker: FormDatePicker,
  'Radio.Group': Radio.Group,
  Cascader: Cascader,
  Upload: UploadInput
};

function BasicForm({ value, onChange, formSchema, onReRender, showDivider }: IBasicFormProps) {
  const [form] = useForm();

  useEffect(() => {
    form.setFieldsValue(value);
  }, [value]);
  function handleChanging(value: Record<string, any>) {
    if (Object.keys(value).some(i => formSchema[i]?.reRenderWhenChange)) {
      onReRender?.();
    }
    if (onChange) {
      const key = Object.keys(value)?.[0];
      const formItem = formSchema[key];
      if (formItem?.valueTransform) {
        value[key] = formItem.valueTransform(value[key]);
      }
      onChange(value);
    }
  }

  function renderFormItems() {
    if (!formSchema) {
      return null;
    }
    return Object.entries(formSchema).map(([name, config]) => {
      const Component =
        typeOf(config.component) === 'string' ? formItemDict[config.component as string] : config.component;

      const help = config.help ? <div style={{ wordBreak: 'break-word' }}>{config.help}</div> : null;
      if (!Component) {
        return (
          <Form.Item key={name} label={config.title} name={name} help={help}>
            <div>错误：不存在的表单项组件</div>
          </Form.Item>
        );
      }
      const componentProps =
        typeof config.componentProps === 'function' ? config.componentProps(value) : config.componentProps;
      return (
        <Fragment key={name}>
          <Form.Item label={config.title} name={name} help={help}>
            <Component {...componentProps} />
          </Form.Item>
          {showDivider && <Divider/>}
        </Fragment>
      );
    });
  }

  return (
    <div className={style.basicForm}>
      <Form form={form} onValuesChange={handleChanging} colon={false}>
        {renderFormItems()}
      </Form>
    </div>
  );
}

BasicForm.displayName = 'BasicForm';

export default BasicForm;
