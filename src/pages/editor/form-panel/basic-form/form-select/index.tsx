import Select, { BaseOptionType, DefaultOptionType, SelectProps } from 'antd/es/select';

import styles from './index.module.less';

export default function FormSelect<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType
>(props: React.PropsWithChildren<SelectProps<ValueType, OptionType>>) {
  return <Select<ValueType, OptionType> className={styles.select} variant="filled" allowClear {...props} />;
}
