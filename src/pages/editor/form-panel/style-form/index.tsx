import { Form } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { CSSProperties, useEffect } from 'react';

export interface IStyleFormProps {
  value: CSSProperties;
  onChange: (style: CSSProperties) => void;
}
export default function StyleForm({ onChange, value }: IStyleFormProps) {
  const [form] = useForm();

  useEffect(() => {
    form.setFieldsValue(value);
  }, [value]);

  function handleChangingStyle() {
    if (onChange) {
      onChange(form.getFieldsValue());
    }
  }

  return (
    <Form form={form} onChange={handleChangingStyle}>
      <Form.Item></Form.Item>
    </Form>
  );
}
