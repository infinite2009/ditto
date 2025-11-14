
export enum RenderTypeEnum {
  /**
   * 普通文本
   */
  Default = '',
  /**
   * 文字组件
   */
  Text = 'Text',
  /**
   * 金额组件
   */
  Amount = 'Amount',
  /**
   * 标签组件
   */
  Tag = 'Tag',
  /**
   * 开关组件
   */
  Switch = 'Switch',
  /**
   * 操作
   */
  Operate = 'HorizontalFlex'
}

export type RenderType = RenderTypeEnum | `${RenderTypeEnum}`;


