import { DatePicker } from 'antd';
import { useMemo } from 'react';
import dayjs from 'dayjs';

export default function FormDatePicker({ value, onChange }: any) {
  const dateFormat = 'YYYY-MM-DD';

  const innerValue = useMemo(() => {
    if (!value) {
      return value;
    }
    return dayjs(value, dateFormat);
  }, [value]);

  function handleChanging(date: any, dateString: string) {
    onChange?.(dateString);
  }

  return <DatePicker value={innerValue} onChange={handleChanging} />;
}