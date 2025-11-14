import { observer } from 'mobx-react';
import { useForm } from 'antd/es/form/Form';
import { useContext, useEffect } from 'react';
import { DSLStoreContext } from '@/hooks/context';
import { Cascader, Form, FormProps, Input, Radio, Switch } from 'antd';
import DraggableTree from '../../draggable-tree';
import cloneDeep from 'lodash/cloneDeep';
import getPropsValue from '@/util';

export default observer(function customCascaderForm() {
  const [form] = useForm();

  const dslStore = useContext(DSLStoreContext);
  const component = dslStore.selectedComponent;
  const props = dslStore.dsl.props[component?.id];
  const { placeholder, allowClear, size, multiple, defaultValue, showSearch, options } = props;
  // 深拷贝，解决observable对象新增属性不会被监测的问题
  const value = cloneDeep((options.value || []) as any[]);
  const update: FormProps['onValuesChange'] = values => {
    dslStore.updateComponentProps({ ...values });
  };

  const formState = getPropsValue(props);

  const isMultiple = Form.useWatch(multiple.name, form);

  useEffect(() => {
    form.setFieldsValue({
      ...formState,
      options: value
    });
  }, [component?.id]);
  return (
    <div style={{ padding: '12px' }}>
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          ...formState,
          options: value
        }}
        onValuesChange={update}
      >
        <Form.Item name={options.name} label={options.title}>
          <DraggableTree
            fieldNames={{
              title: 'label',
              key: 'value'
            }}
          />
        </Form.Item>
        <Form.Item name={size.name} label={size.title}>
          <Radio.Group>
            <Radio value="large">大</Radio>
            <Radio value="middle">中</Radio>
            <Radio value="small">小</Radio>
            <Radio value={undefined}>默认</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name={placeholder.name} label={placeholder.title}>
          <Input></Input>
        </Form.Item>

        <Form.Item name={allowClear.name} label={allowClear.title}>
          <Switch></Switch>
        </Form.Item>

        <Form.Item name={multiple.name} label={multiple.title}>
          <Switch></Switch>
        </Form.Item>

        <Form.Item name={defaultValue.name} label={defaultValue.title}>
          <Cascader options={value} multiple={isMultiple}></Cascader>
        </Form.Item>

        <Form.Item name={showSearch.name} label={showSearch.title}>
          <Switch></Switch>
        </Form.Item>
      </Form>
    </div>
  );
});
