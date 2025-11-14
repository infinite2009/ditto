import { RenderType, RenderTypeEnum } from "./types";

export const renderOptions: { label: string; value: RenderType }[] = [
  {
    label: '普通文本',
    value: RenderTypeEnum.Default
  },
  {
    label: '文字组件',
    value: RenderTypeEnum.Text
  },
  {
    label: '金额组件',
    value: RenderTypeEnum.Amount
  },
  {
    label: '标签组件',
    value: RenderTypeEnum.Tag
  },
  {
    label: '开关组件',
    value: RenderTypeEnum.Switch
  },
  {
    label: '操作按钮',
    value: RenderTypeEnum.Operate
  }
];

export const DEFAULT_COMPONENT_CONFIG_NAME = 'Text';
export const OPERATE_COMPONENT_CONFIG_NAME = 'HorizontalFlex';