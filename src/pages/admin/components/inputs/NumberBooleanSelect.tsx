import { Select } from 'antd';

export function NumberBooleanSelect({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <Select
      value={value}
      onChange={onChange}
      size="small"
      options={[
        { label: '是', value: 1 },
        { label: '否', value: 0 }
      ]}
    />
  );
}
