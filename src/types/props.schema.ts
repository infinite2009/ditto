/**
 * @file 属性本身的属性定义定义
 */
export default interface IPropsSchema {
  [key: string]: {
    // 属性的类别：事件、样式、基础、高级
    category: 'event' | 'style' | 'basic' | 'advanced';
    // 是否是值，如果是值，那么该属性变更时，可以用 useEffect 监听并做出响应。目前来说，对于一个组件，值属性最多支持一个
    isValue: boolean;
    // 属性的名字，和 key 总是相同的
    name: string;
    // 属性值的类型
    valueType: 'string' | 'boolean' | 'number' | 'function' | 'object'
  }
}