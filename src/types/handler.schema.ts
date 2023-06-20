import ISchema from "@/types/schema";

/**
 * @file 事件响应函数定义
 * @description 还没有想好怎么用
 */
export default interface IHandlerSchema extends ISchema {
  name: string;
  desc: string;
  functionType: 'arrow' | 'traditional';
  // 函数签名
  signature: {
    funcName: string;
    params: {
      name: string;
      type: string;
      defaultValue: string;
    }[];
  }[];
  callType: 'callback' | 'sequence';
}
