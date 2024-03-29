/**
 * @file 组件的 DSL 定义
 * @description 这里不会生命组件用了什么属性，主要是处于对代码。前期不支持 importType 和 importRelativePath
 */
import ISchema from './schema';
import { ImportType, PropsId } from '@/types/index';
import ComponentSchemaRef from '@/types/component-schema-ref';
import ComponentFeature from '@/types/component-feature';

export default interface IComponentSchema extends ISchema {
  // 调用名，如果导入的名字和调用的名字不一样，调用时用这个
  callingName?: string;
  children: ComponentSchemaRef[];
  configName?: string;
  // 组件包的名字
  dependency: string;
  desc?: string;
  displayName: string;
  feature: ComponentFeature;
  // 导入名称，特别针对 Input.Text 这种情况
  importName?: string;
  // 导入的相对路径，缺失时系统默认为 ''
  importRelativePath?: string;
  /**
   * 导入类型：如果导入类型缺失，依照以下两种情况处理：
   * 1. 如果导入相对路径缺失，按照 object 处理
   * 2. 如果导入相对路径存在，按照 default 处理
   */
  importType?: ImportType;
  // 不生成导入语句
  noImport?: boolean;
  // 组件名，用于代码生成的导入和调用环节
  name: string;
  // PageRoot 没有 parentId
  parentId?: string;
  // 组件属性
  propsRefs: PropsId[];
}
