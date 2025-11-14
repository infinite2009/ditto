import { Switch } from "antd";
import { RowSelection } from "../../form/CustomTableForm";
import { useEffect, useState } from "react";
import { SwitchProps } from "antd/lib";

interface RowSelectionSettingProps {
  value?: RowSelection;
  onChange?: (val: RowSelection) => void;
}

const RowSelectionSetting: React.FC<RowSelectionSettingProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState<boolean>();

  const onSwitchChange: SwitchProps['onChange'] = (val) => {
    setOpen(val);
    if (val) {
      onChange?.({});
    } else {
      onChange?.(undefined);
    }
  };

  useEffect(() => {
    setOpen(!!value);
  }, [value]);
  return <>
    <Switch value={open} checkedChildren="开启" unCheckedChildren="关闭" onChange={onSwitchChange}></Switch>
    {/* TODO: pagination config */}
  </>;
};

export default RowSelectionSetting;
