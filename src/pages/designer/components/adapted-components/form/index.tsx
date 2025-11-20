import { Form } from 'antd';
import { useMount } from 'ahooks';

export default function AdaptedForm({ children, ...otherProps }: any) {
  const [form] = Form.useForm();

  useMount(() => {
    console.log('adapted form works!');
  });

  return (
    <Form form={form} {...otherProps}>
      {children}
    </Form>
  );
}