import ISchema from '@/types/schema';

/**
 * @file 属性本身的属性定义
 */
export default interface IPropsSchema extends ISchema {
  // 属性的类别：事件、样式、基础、高级
  category: 'event' | 'style' | 'basic' | 'advanced' | 'children';
  // 如果是值，那么该属性变更时，可以用 useEffect 监听并做出响应。目前来说，对于一个组件，值属性最多支持一个
  isValue: boolean;
  // 属性的名字
  name: string;
  // 属性值的类型
  valueType: 'string' | 'boolean' | 'number' | 'function' | 'object';
  /*
   * 这个值的来源
   * fixed: 用户输入的常量，会指导代码生成器生成常量声明和赋值代码，存入 const
   * dataSource: 从后端获取的数据，且没有经过计算转换的，经过转换存入 state
   * calculation: 计算数据，主要是通过后端数据源算出来的，或者根据用户输入算出来的，用 useMemo 实现
   */
  valueSource: 'fixed' | 'dataSource' | 'calculation'
}