import { ICustomFormProps } from '@/types';
import { useForm } from 'antd/es/form/Form';
import { Form } from 'antd';
import { useEffect } from 'react';

export default function CustomTableForm(props: ICustomFormProps) {
  const [form] = useForm();

  useEffect(() => {
    console.log('tab props changed: ', props);
  }, [props]);

  function handleChangingFields(changedFields, allFields) {
    console.log('changed fields: ', changedFields);
    console.log('all fields: ', allFields);
  }

  return (
    <Form form={form} onFieldsChange={handleChangingFields}>
      <div>table form works!</div>
    </Form>
  );
}
