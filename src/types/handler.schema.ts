/**
 * @file 事件响应函数定义
 * @description 还没有想好怎么用
 */
export default interface IHandlerSchema {
  name: string;
  desc: string;
  type: 'arrow' | 'traditional';
  body: {
    funcName: string;
    params: {
      name: string;
      type: string;
      defaultValue: string;
    }[];
  }[];
  callType: 'callback' | 'sequence';
}