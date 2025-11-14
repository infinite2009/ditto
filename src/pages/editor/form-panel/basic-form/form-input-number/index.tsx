import { InputNumber } from 'antd';
import { useEffect, useState } from 'react';

export default function FormInputNumber({ onChange, value, ...otherProps }: any) {
  const [innerValue, setInnerValue] = useState<string>(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  function handleChanging() {
    if (onChange) {
      onChange(innerValue);
    }
  }

  function handleInnerChanging(e) {
    setInnerValue(e);
  }
  return (
    <InputNumber
      onPressEnter={e => (e.target as HTMLElement).blur()}
      onBlur={handleChanging}
      onChange={handleInnerChanging}
      value={innerValue}
      {...otherProps}
    />
  );
}
