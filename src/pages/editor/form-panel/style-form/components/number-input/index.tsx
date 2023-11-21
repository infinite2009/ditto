import { InputNumber } from 'antd';
import { useState } from 'react';

export interface INumberInputProps {
  onChange: (data: number) => void;
  value: number;
}

export default function NumberInput({ value, onChange }: INumberInputProps) {
  const [internalValue, setInternalValue] = useState<number>();

  function handleChanging(e: any) {
    debugger;
    if (onChange) {
      onChange(e.target.value);
    }
  }

  return <InputNumber value={value} onPressEnter={handleChanging} onBlur={handleChanging} onStep={handleChanging} />;
}
