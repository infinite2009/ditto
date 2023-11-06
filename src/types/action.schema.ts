import ISchema from './schema';

export default interface IActionSchema extends ISchema {
  /*
   * 动作的类型：
   * state: 转移状态
   * service: 调用服务（需要传参）
   * transfer: 转换和格式化数据
   */
  type: any;
  relatedComponentIds: string[];
  payload: any;
}
