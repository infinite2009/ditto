import ISchema from './schema';
import IComponentSchema from './component-schema';

export default interface IPageSchema extends ISchema {
  // 页面展示名，也用来写入代码文件的 file 注释
  displayName: string;
  // 页面名
  name: string;
  // 页面描述
  description: string;
  // 页面的模板
  children: IComponentSchema[];
  // 页面执行的动作，往往是组件响应用户交互，或者页面的周期性行为
  eventHandler: {
    // 一个 key 对应一个事件
    [key: string]: any;
  };
}