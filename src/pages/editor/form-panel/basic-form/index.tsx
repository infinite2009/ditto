import { Form } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';

export interface IBasicFormProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}

export default function BasicForm({ value, onChange }: IBasicFormProps) {
  const [form] = useForm();

  useEffect(() => {
    form.setFieldsValue(value);
  }, [value]);
  function handleChanging(value: Record<string, any>) {
    if (onChange) {
      onChange(value);
    }
  }

  return <Form form={form} onValuesChange={handleChanging}></Form>;
}
