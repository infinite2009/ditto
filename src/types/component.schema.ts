/**
 * @file 组件的 DSL 定义
 * @description 这里不会生命组件用了什么属性，主要是处于对代码。前期不支持 importType 和 importRelativePath
 */
import ISchema from "./schema";
import { ImportType, PropsId } from '@/types/index';

export default interface IComponentSchema extends ISchema {
  desc?: string;
  // 调用名，如果导入的名字和调用的名字不一样，调用时用这个
  callingName?: string;
  // 组件包的名字
  dependency: string;
  // 导入的相对路径，缺失时系统默认为 ''
  importRelativePath?: string;
  /**
   * 导入类型：如果导入类型缺失，依照依照以下两种情况处理：
   * 1. 如果导入相对路径缺失，按照 object 处理
   * 2. 如果导入相对路径存在，按照 default 处理
   */
  importType?: ImportType;
  // 组件名，用于代码生成的导入和调用环节
  name: string;
  // 组件属性
  propsRefs?: PropsId[];
  children: (IComponentSchema)[];
}
