import ISchema from "./schema";
import IPropsSchema from "@/types/props.schema";
import DynamicObject from "@/types/dynamic-object";

export default interface IComponentSchema extends ISchema {
  // 这个组件的打包方式有关
  importType: 'default' | 'object' | '*';
  // 组件的导入路径
  importPath: string;
  // 组件包的名字
  packageName: string;
  // 组件名，用于代码生成的调用环节
  name: string;
  // 组件展示名，一般是中文
  displayName: string;
  // 组件属性
  props: {
    // 基础属性
    baseProps: DynamicObject<IPropsSchema>;
    // 样式属性
    styleProps: DynamicObject<IPropsSchema>;
    // 事件属性
    eventProps: DynamicObject<IPropsSchema>;
    // 子节点（个别组件的其他 props和children 是冲突的）
    otherProps: {
      children: IPropsSchema;
      [key: string]: IPropsSchema;
    };
  }
}
