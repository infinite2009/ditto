import ISchema from './schema';
import IHttpServicePayload from '@/types/service-payload.schema';
import IStatePayload from '@/types/state.schema';
import IDataConversionPayload from '@/types/data-conversion-payload';

export default interface IActionSchema extends ISchema {
  /*
   * 动作的类型：
   * state: 转移状态
   * service: 调用服务（需要传参）
   * transfer: 转换和格式化数据
   */
  type: 'stateSetting' | 'service' | 'dataConversion' | 'pageRedirection' | 'visibilityToggle';
  payload: IHttpServicePayload | IStatePayload | IDataConversionPayload;
}
