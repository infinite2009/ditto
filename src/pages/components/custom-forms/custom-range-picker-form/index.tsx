import { DSLStoreContext } from '@/hooks/context';
import { Form, Input, Switch } from 'antd';
import { observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import MultiContainer from './MultiContainer';
import getPropsValue from '@/util';


export { default as RangePickerPlaceholder } from './Placeholder';
export { default as RangePickerDefaultValue } from './DefaultValue';


export default observer(function CustomRangePickerForm() {
  const dslStore = useContext(DSLStoreContext);
  const [form] = Form.useForm();
  const component = dslStore.selectedComponent;
  const props = dslStore.dsl.props[component?.id];
  const {placeholder, allowClear, allowEmpty, showTime } = props;
  const onValuesChange = values => {
    dslStore.updateComponentProps({ ...values });
  };

  const formState = getPropsValue(props);

  useEffect(() => {
    form.setFieldsValue(formState);
  }, [component?.id]);
  return (
    <div style={{ padding: '12px' }}>
      <Form form={form} layout="vertical" initialValues={formState} onValuesChange={onValuesChange}>
        <Form.Item label={placeholder.title} name={placeholder.name}>
          <MultiContainer<string>
            render={{
              component: props => {
                return <Input {...props}></Input>;
              }
            }}
          ></MultiContainer>
        </Form.Item>
        <Form.Item label={allowClear.title} name={allowClear.name}>
          <Switch></Switch>
        </Form.Item>
        <Form.Item label={allowEmpty.title} name={allowEmpty.name}>
          <MultiContainer<boolean>
            render={{
              component: props => {
                return <Switch {...props}></Switch>;
              }
            }}
          ></MultiContainer>
        </Form.Item>
        {/* <Form.Item label={disabled.title} name={disabled.name}>
          <MultiContainer<boolean>
            render={{
              component: props => {
                return <Switch {...props}></Switch>;
              }
            }}
          ></MultiContainer>
        </Form.Item> */}
        <Form.Item label={showTime.title} name={showTime.name}>
          <Switch></Switch>
        </Form.Item>
      </Form>
    </div>
  );
});
