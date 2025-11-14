import { GetVoltronModuleListAll } from '@/api';
import useDSLFragmentStore from '@/store/useDSLFragment';
import { Form, FormProps, Input, Modal, ModalProps } from 'antd';
import { omit } from 'lodash';
import { useEffect, useState } from 'react';

interface RenameModuleComponentModalProps extends ModalProps {
  data: GetVoltronModuleListAll.ListItem;
  // onChange?: (values: FormState) => void;
}

type FormState = {
  name: string;
};

const RenameModuleComponentModal: React.FC<RenameModuleComponentModalProps> = props => {
  const { data, ...rest } = props;
  const dslFragmentStore = useDSLFragmentStore();

  const [form] = Form.useForm<FormState>();

  const onCancel: ModalProps['onCancel'] = (e) => {
    rest?.onCancel?.(e);
    rest?.onClose?.(e);
  };
  const onOk: ModalProps['onOk'] = async (e) => {
    const values = await form.validateFields();

    const updateItem = omit(
      {
        ...data,
        name: values.name
      },
      ['dsl']
    );

    dslFragmentStore.updateItem(updateItem);
    rest?.onClose?.(e);
  };

  useEffect(() => {
    if (rest.open) {
      form.setFieldsValue({
        name: data?.name
      });
    } else {
      form.resetFields();
    }
  }, [rest.open]);

  return (
    <Modal title="修改名称" onOk={onOk} onCancel={onCancel} {...rest}>
      <Form form={form} autoComplete='off'>
        <Form.Item<FormState> required label="名称" name="name">
          <Input></Input>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RenameModuleComponentModal;
