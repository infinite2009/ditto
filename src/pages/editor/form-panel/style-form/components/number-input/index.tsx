import { InputNumber } from 'antd';
import { ReactNode, useMemo, useState } from 'react';

import styles from './index.module.less';
import classNames from 'classnames';

export interface INumberInputProps {
  icon?: ReactNode;
  onChange?: (data: number) => void;
  value?: number;
}

export default function NumberInput({ value, onChange, icon }: INumberInputProps) {
  const [bordered, setBordered] = useState<boolean>(false);

  const inputClass = useMemo(() => {
    if (bordered) {
      return classNames({
        [styles.main]: true,
        [styles.bordered]: true
      });
    }
    return styles.main;
  }, [bordered]);

  function handleChanging(e: any) {
    if (onChange) {
      onChange(e.target.value);
    }
  }

  function handleFocus() {
    setBordered(true);
  }

  return (
    <InputNumber
      className={inputClass}
      prefix={icon}
      value={value}
      onFocus={handleFocus}
      onPressEnter={handleChanging}
      onBlur={e => {
        setBordered(false);
        handleChanging(e);
      }}
      onStep={handleChanging}
      min={1}
      max={1280}
      bordered={false}
    />
  );
}
