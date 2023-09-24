import Form, { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';

export interface IEventFormProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}

export default function EventForm({ value, onChange }: IEventFormProps) {
  const [form] = useForm();

  useEffect(() => {
    form.setFieldsValue(value);
  }, [value]);

  function handleChangingForm(value: Record<string, any>) {
    if (onChange) {
      onChange(value);
    }
  }

  // TODO: 事件每个组件都一样，Ditto 自己实现即可
  return <Form form={form} onValuesChange={handleChangingForm}></Form>;
}
