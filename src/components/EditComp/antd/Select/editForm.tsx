import { Input, Button, Form, Popconfirm, PopconfirmProps } from 'antd';
import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { OptionProps } from 'antd/es/select';

interface EditFormProps extends Partial<PopconfirmProps> {
  onOK?: (value) => void;
  formInitData?: { label: OptionProps['label']; value: string | number };
  actionIcon?: React.ReactNode;
}
const EditForm: React.FC<EditFormProps> = ({ onOK, formInitData, actionIcon, ...restProps }) => {
  const [formRef] = Form.useForm();
  const onConfirm = () => {
    onOK(formRef.getFieldsValue());
    return;
  };

  const onOpenChange = open => {
    if (open) {
      formRef.setFieldsValue(formInitData);
    } else {
      formRef.resetFields();
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  return (
    <Popconfirm
      title="新增选项"
      icon={null}
      destroyTooltipOnHide
      placement="rightTop"
      zIndex={1060}
      description={
        <Form form={formRef} initialValues={{}}>
          <Form.Item label="选项名" name="label">
            <Input onMouseDown={e => e.stopPropagation()} />
          </Form.Item>
          <Form.Item label="选项值" name="value">
            <Input onMouseDown={e => e.stopPropagation()} />
          </Form.Item>
        </Form>
      }
      trigger="click"
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      {...restProps}
    >
      <Button size='small' type="text" icon={actionIcon || <PlusOutlined />} onClick={onClick} />
    </Popconfirm>
  );
};

export default EditForm;
