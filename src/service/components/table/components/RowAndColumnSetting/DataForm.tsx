import { Button, Form, Input } from 'antd';
import { Column, DataItem } from '../../form/CustomTableForm';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import ResizableDrawer, { ResizableDrawerProps } from '@/components/resizable-drawer';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';

export interface DataFormProps extends ResizableDrawerProps {
  value?: DataItem;
  columns: Column[];
  onChange?: (val: DataItem) => void;
}

export interface DataFormHandle {
  getValues: () => DataItem;
}

const DataForm = forwardRef<DataFormHandle, DataFormProps>((props, ref) => {
  const { value, columns, onChange, ...rest } = props;
  const { open } = rest;
  const [form] = Form.useForm<DataItem>();

  const onValuesChange = (_, values) => {
    onChange?.(values);
  };

  useImperativeHandle(ref, () => ({
    getValues: () => {
      return {
        key: value.key,
        ...form.getFieldsValue()
      };
    }
  }));

  useEffect(() => {
    if (open) {
      console.log('value', value);
      form.setFieldsValue(value);
    }
  }, [open]);
  return (
    <ResizableDrawer {...rest}>
      <Form
        initialValues={{ value }}
        labelCol={{
          flex: '90px'
        }}
        labelAlign="left"
        form={form}
        onValuesChange={onValuesChange}
      >
        {/* {value &&
          Object.keys(value)
            .filter(k => !['key', 'children'].includes(k))
            .map(dataIndex => {
              const item = columns.find(i => i.dataIndex === dataIndex);
              return (
                <Form.Item key={dataIndex} name={dataIndex} label={item?.title}>
                  <FormInput></FormInput>
                </Form.Item>
              );
            })} */}
        {
          columns.filter(i => i.dataIndex && value?.[i.dataIndex] !== undefined).map(item => {
            // const item =
            return <Form.Item key={item.dataIndex} name={item.dataIndex} label={item?.title}>
              <FormInput></FormInput>
            </Form.Item>;
          })
        }
      </Form>
    </ResizableDrawer>
  );
});

DataForm.displayName = 'DataForm';

export default DataForm;
