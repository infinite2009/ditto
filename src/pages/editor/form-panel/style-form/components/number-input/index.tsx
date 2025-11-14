import { InputNumber } from 'antd';
import { ReactNode, useMemo, useRef, useState } from 'react';

import styles from './index.module.less';
import classNames from 'classnames';

export interface INumberInputProps {
  icon?: ReactNode;
  onChange?: (data: number) => void;
  value?: number;
  disabled?: boolean;
}

export default function NumberInput({ disabled, value, onChange, icon }: INumberInputProps) {
  const [bordered, setBordered] = useState<boolean>(false);
  const inputRef = useRef<any>();

  const inputClass = useMemo(() => {
    if (bordered) {
      return classNames({
        [styles.main]: true,
        [styles.bordered]: true
      });
    }
    return styles.main;
  }, [bordered]);

  function handleChanging(value: number) {
    if (onChange) {
      onChange(value);
    }
  }

  function handleFocus() {
    setBordered(true);
  }

  return (
    <InputNumber
      ref={inputRef}
      className={inputClass}
      disabled={disabled}
      prefix={icon}
      value={value}
      onFocus={handleFocus}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onPressEnter={() => {
        inputRef.current.blur();
      }}
      onBlur={e => {
        setBordered(false);
        handleChanging(+e.target.value);
      }}
      onStep={handleChanging}
      min={1}
      max={1280}
      variant="borderless"
    />
  );
}
