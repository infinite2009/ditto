import { InputNumber } from 'antd';
import { ReactNode } from 'react';

export interface INumberInputProps {
  icon?: ReactNode;
  onChange?: (data: number) => void;
  value?: number;
}

export default function NumberInput({ value, onChange, icon }: INumberInputProps) {
  function handleChanging(e: any) {
    if (onChange) {
      onChange(e.target.value);
    }
  }

  return (
    <InputNumber
      prefix={icon}
      value={value}
      onPressEnter={handleChanging}
      onBlur={handleChanging}
      onStep={handleChanging}
      min={1}
      max={1280}
      bordered={false}
    />
  );
}
