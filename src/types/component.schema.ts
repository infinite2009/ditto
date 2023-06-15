import ISchema from "./schema";

export default interface IComponentSchema extends ISchema {
  //
  importType: 'default' | 'object' | '*' ;
  // 组件的导入路径
  importPath: string;
  // 组件包的名字
  packageName: string;
  // 组件名，用于代码生成的调用环节
  name: string;
  // 组件展示名，一般是中文
  displayName: string;
  props: {
    // 基础属性
    baseProps: {
      [key: string]: any;
    };
    // 样式属性
    styleProps: {
      [key: string]: any;
    };
    // 事件属性
    eventProps: {
      [key: string]: any;
    };
  }
}
