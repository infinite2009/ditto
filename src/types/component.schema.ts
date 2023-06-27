/**
 * @file 组件的 DSL 定义
 * @description 这里不会生命组件用了什么属性，主要是处于对代码。前期不支持 importType 和 importPath
 */
import ISchema from "./schema";
import { PropsId } from '@/types/index';

export default interface IComponentSchema extends ISchema {
  // 导入的名字
  importName: string;
  // 组件包的名字
  dependency: string;
  // 组件名，用于代码生成的调用环节
  name: string;
  // 组件属性
  propsRefs: {
    // 基础属性
    basic: PropsId[];
    // 样式属性
    style: PropsId[];
    // 事件属性
    event: PropsId[];
    // 子节点（个别组件的其他 props和children 是冲突的）
    advanced: PropsId[];
  }
}
