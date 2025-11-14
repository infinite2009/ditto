import { DSLStoreContext } from '@/hooks/context';
import { Form, Input, InputProps } from 'antd';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';

type FieldValue = {
  start: string;
  end: string;
};

export default observer(function Placeholder() {
  const dslStore = useContext(DSLStoreContext);
  const component = dslStore.selectedComponent;
  const { placeholder } = dslStore.dsl.props[component?.id];

  const [start, setStart] = useState(placeholder.value?.[0] as string);
  const [end, setEnd] = useState(placeholder.value?.[1] as string);

  const onStartChange: InputProps['onChange'] = e => {
    const { value } = e.target;
    setStart(value);
    dslStore.updateComponentProps({ placeholder: [value, end] });
  };
  const onEndChange: InputProps['onChange'] = e => {
    const { value } = e.target;
    setEnd(value);
    dslStore.updateComponentProps({ placeholder: [start, value] });
  };

  useEffect(() => {
    setStart(placeholder.value?.[0] as string);
    setEnd(placeholder.value?.[1] as string);
  }, [component?.id]);
  return (
    <>
      <Form.Item<FieldValue> key="placeholder-start" label="开始日期">
        <Input value={start} onChange={onStartChange} allowClear></Input>
      </Form.Item>
      <Form.Item<FieldValue> key="placeholder-end" label="结束日期">
        <Input value={end} onChange={onEndChange} allowClear></Input>
      </Form.Item>
    </>
  );
});
