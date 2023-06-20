import ISchema from './schema';
import IComponentSchema from './component.schema';
import DynamicObject from "@/types/dynamic-object";

export default interface IPageSchema extends ISchema {
  // 页面展示名，也用来写入代码文件的 file 注释
  displayName: string;
  // 页面的总体介绍，用于写入代码文件的 desc 注释
  desc: string;
  // 页面名
  name: string;
  // 页面描述
  description: string;
  // 页面的模板
  children: IComponentSchema[];
  // 客户端存储
  storage: DynamicObject;
  // 从 url 获取参数
  query: DynamicObject<string>;
}