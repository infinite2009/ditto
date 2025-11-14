import ResizableDrawer, { ResizableDrawerProps } from "@/components/resizable-drawer";
import BasicForm, { IBasicFormProps } from "@/pages/editor/form-panel/basic-form";
import { SchemaConfig } from "@/service/components";

export interface OperatorButtonSettingProps extends ResizableDrawerProps {
  showDivider?: boolean;
  value?: IBasicFormProps['value'];
  onChange?: (value: IBasicFormProps['value']) => void;
}
const OperatorButtonSetting: React.FC<OperatorButtonSettingProps> = (props) => {
  const buttonSchema = SchemaConfig.Button.schema;
  const { showDivider, value = {}, onChange, ...rest } = props;

  return <ResizableDrawer title="按钮配置" {...rest}>
    <BasicForm
      onChange={onChange}
      value={value}
      formSchema={buttonSchema.basic}
      showDivider={showDivider}
    />
  </ResizableDrawer>;
};

export default OperatorButtonSetting;
