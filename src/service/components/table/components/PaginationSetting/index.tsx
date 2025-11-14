import { Switch } from "antd";
import { Pagination } from "../../form/CustomTableForm";
import { useEffect, useState } from "react";
import { SwitchProps } from "antd/lib";

interface PaginationSettingProps {
  value?: Pagination;
  onChange?: (val: Pagination) => void;
}

const PaginationSetting: React.FC<PaginationSettingProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState<boolean>();

  const onSwitchChange: SwitchProps['onChange'] = (val) => {
    setOpen(val);
    if (val) {
      onChange?.({});
    } else {
      onChange?.(false);
    }
  };

  useEffect(() => {
    setOpen(!!value);
  }, [value]);
  return <>
    <Switch value={open} checkedChildren="开启" unCheckedChildren="关闭" onChange={onSwitchChange}></Switch>
  </>;
};

export default PaginationSetting;
