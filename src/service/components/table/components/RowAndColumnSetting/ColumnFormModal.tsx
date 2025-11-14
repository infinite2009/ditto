import { forwardRef, Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { Column } from '../../form/CustomTableForm';
import {
  Input,
  Form,
  Select,
  InputNumber,
  Drawer,
  Button,
  Space,
  Row,
  Col,
  ButtonProps,
  FormListFieldData,
  App
} from 'antd';
import { DrawerProps, FormProps } from 'antd/lib';
import { omit } from 'lodash';
import { PlusOutlined } from '@ant-design/icons';
import { Resizable } from 'react-resizable';
import ResizableDrawer from '@/components/resizable-drawer';
import { EditPencil, Trash } from '@/components/icon';
import { DSLStoreContext } from '@/hooks/context';
import { buttonTypeOptions } from '@/service/components/button';
import OperatorButtonSetting, { OperatorButtonSettingProps } from './OperatorButtonSetting';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';
import FormSelect from '@/pages/editor/form-panel/basic-form/form-select';
import { RenderType, RenderTypeEnum } from '../../types';
import { OPERATE_COMPONENT_CONFIG_NAME, renderOptions } from '../../const';

type Operator = ButtonProps;
export type FieldValue = Column & {
  renderType: RenderType;
  operators: Operator[];
  // operateNum?: number;
};

export interface ColumnFormProps extends DrawerProps {
  value: Column;
  onChange?: (changedValue: any, values: FieldValue) => void;
}

const formItemLayout = {
  // labelCol: {
  // span: 6
  // },
  // wrapperCol: {
  //   span: 18
  // }
};

export type ColumnFormHandle = any;

const ColumnForm = forwardRef<ColumnFormHandle, ColumnFormProps>((props, ref) => {
  const { message } = App.useApp();
  const { value, onChange, onClose, open, ...rest } = props;
  const [form] = Form.useForm<FieldValue>();
  const [buttonSettingOpen, setButtonSettingOpen] = useState(false);
  const [currentOperateButtonIndex, setCurrentOperateButtonIndex] = useState<number>();
  const dslStore = useContext(DSLStoreContext);

  const renderType = Form.useWatch('renderType', form);
  const operators = Form.useWatch('operators', form);

  const onValuesChange: FormProps<FieldValue>['onValuesChange'] = (changedValue, values) => {
    onChange?.(changedValue, values);
  };

  const onButtonSettingClose = () => {
    setButtonSettingOpen(false);
  };

  const onEditButton = (v: FormListFieldData) => {
    setButtonSettingOpen(true);
    setCurrentOperateButtonIndex(v.key);
  };

  const onButtonChange: OperatorButtonSettingProps['onChange'] = val => {
    const changedValue = {
      operators: {
        [currentOperateButtonIndex]: val
      }
    };
    const operatorsList = operators.map((item, i) => {
      if (i === currentOperateButtonIndex) {
        return {
          ...item,
          ...val
        };
      }
      return item;
    });
    const mergedValues: FieldValue = {
      ...form.getFieldsValue(),
      operators: operatorsList
    };
    form.setFieldValue('operators', operatorsList);
    onChange?.(changedValue, mergedValues);
  };

  useEffect(() => {
    if (open) {
      const renderType = value.renderType;
      const operators: FieldValue['operators'] = [];
      if (renderType === OPERATE_COMPONENT_CONFIG_NAME) {
        const children = dslStore.fetchComponentInDSL(value.render?.[0]?.current)?.children || [];
        children.forEach(child => {
          const props = dslStore.getComponentProps(child.current);
          operators.push(props);
        });
      }
      const rest = {
        renderType,
        operators
      };
      form.setFieldsValue({
        ...value,
        ...rest
      });
    }
  }, [open]);

  return (
    <ResizableDrawer title="列配置" onClose={onClose} open={open} {...rest}>
      <Form
        form={form}
        initialValues={value}
        onValuesChange={onValuesChange}
        labelCol={{
          flex: '96px'
        }}
        labelAlign="left"
        colon={false}
      >
        <Form.Item<FieldValue> name="key" label="唯一key">
          <FormInput disabled variant="borderless"></FormInput>
        </Form.Item>
        <Form.Item<FieldValue> name="title" label="列头显示文字">
          <FormInput></FormInput>
        </Form.Item>
        <Form.Item<FieldValue> name="renderType" label="字段类型">
          <FormSelect options={renderOptions}></FormSelect>
        </Form.Item>
        {renderType !== RenderTypeEnum.Operate && (
          <Form.Item<FieldValue> name="dataIndex" label="绑定数据变量名">
            <FormInput></FormInput>
          </Form.Item>
        )}
        {renderType === RenderTypeEnum.Operate && (
          <>
            <Form.List name="operators">
              {(fields, { add, remove }, { errors }) => (
                <Row gutter={[8, 8]} align="middle">
                  {fields.map((field, index) => (
                    <Fragment key={index}>
                      <Col span={3}>
                        <Button
                          type="text"
                          icon={<EditPencil />}
                          size="small"
                          onClick={() => {
                            onEditButton(field);
                          }}
                        ></Button>
                      </Col>
                      <Col span={9}>
                        <Form.Item noStyle label="按钮名称" name={[field.name, 'children']}>
                          <FormInput size="small" />
                        </Form.Item>
                      </Col>
                      <Col span={9}>
                        <Form.Item noStyle label="按钮类型" name={[field.name, 'type']}>
                          <FormSelect size="small" style={{ width: '100%' }} options={buttonTypeOptions} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Button
                          icon={<Trash></Trash>}
                          type="text"
                          size="small"
                          onClick={() => {
                            remove(field.name);
                          }}
                        ></Button>
                      </Col>
                    </Fragment>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => {
                      if (!value.render?.length) {
                        message.error('请先创建行数据');
                        return;
                      }
                      add({
                        children: '按钮',
                        type: 'link'
                      });
                    }
                    }
                    style={{ width: '60%', marginTop: 12 }}
                    icon={<PlusOutlined />}
                  >
                    新增操作按钮
                  </Button>
                </Row>
              )}
            </Form.List>
          </>
        )}
      </Form>
      <OperatorButtonSetting
        value={operators?.[currentOperateButtonIndex]}
        open={buttonSettingOpen}
        onClose={onButtonSettingClose}
        onChange={onButtonChange}
      />
    </ResizableDrawer>
  );
});

ColumnForm.displayName = 'ColumnForm';

export default ColumnForm;
