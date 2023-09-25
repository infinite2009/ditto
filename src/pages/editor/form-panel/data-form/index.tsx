import { Form } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';

export interface IDataFormProps {
  value?: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}

export default function DataForm({ value, onChange }: IDataFormProps) {
  const [form] = useForm();

  useEffect(() => {
    form.setFieldsValue(value);
  }, [value]);

  function handleChanging(value: Record<string, any>) {
    if (onChange) {
      onChange(value);
    }
  }

  // TODO: 每个组件的数据项数量和格式都不同，看看能不能统一为 JSON 格式
  return (
    <Form form={form} onValuesChange={handleChanging}>
      暂不支持
    </Form>
  );
}
