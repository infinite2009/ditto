import { useEffect, useRef, useState } from 'react';
import { Input, InputRef } from 'antd';
import styles from './index.module.less';
import { InputProps } from 'antd/lib';

export interface IFormInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value?: string;
  autoFocus?: boolean;
  onChange?: (val: string) => void;
}

export default function FormInput({ value, onChange, autoFocus, ...otherProps }: IFormInputProps) {
  const [innerValue, setInnerValue] = useState<string>(value);
  const inputRef = useRef<InputRef>();
  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  function handleChanging() {
    if (onChange) {
      onChange(innerValue);
    }
  }

  function handleInnerChanging(e) {
    setInnerValue(e.target.value);
  }

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus?.();
    }
  }, [autoFocus]);
  return (
    <Input
      className={styles.formInput}
      variant="filled"
      size="small"
      ref={inputRef}
      onPressEnter={e => (e.target as HTMLElement).blur()}
      onBlur={handleChanging}
      onChange={handleInnerChanging}
      value={innerValue}
      style={otherProps?.style}
      {...otherProps}
    />
  );
}
