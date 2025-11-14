import { DSLStoreContext } from '@/hooks/context';
import { DatePicker, DatePickerProps, Form } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';

type FieldValue = {
  start: string;
  end: string;
};

export default observer(function DefaultValue () {
  const dslStore = useContext(DSLStoreContext);
  const component = dslStore.selectedComponent;
  const { defaultValue } = dslStore.dsl.props[component?.id];
  const [start, setStart] = useState(defaultValue.value?.[0] as Dayjs);
  const [end, setEnd] = useState(defaultValue.value?.[1] as Dayjs);

  const onStartChange: DatePickerProps['onChange'] = value => {
    setStart(value);
    dslStore.updateComponentProps({ defaultValue: [value, end] });
  };
  const onEndChange: DatePickerProps['onChange'] = value => {
    setEnd(value);
    dslStore.updateComponentProps({ defaultValue: [start, value] });
  };
  useEffect(() => {
    setStart(defaultValue.value?.[0] as Dayjs);
    setEnd(defaultValue.value?.[1] as Dayjs);
  }, [component?.id]);
  return (
    <>
      <Form.Item<FieldValue> key="placeholder-start" label="开始日期">
        <DatePicker value={start} onChange={onStartChange} allowClear></DatePicker>
      </Form.Item>
      <Form.Item<FieldValue> key="placeholder-end" label="结束日期">
        <DatePicker value={end} onChange={onEndChange} allowClear></DatePicker>
      </Form.Item>
    </>
  );
});
