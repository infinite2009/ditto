import ISchema from "./schema";

export default interface IComponentSchema extends ISchema {
  //
  importType: 'default' | 'object' | '*' ;
  // 组件的导入路径
  importPath: string;
  // 组件包的名字
  packageName: string;
  // 组件名
  name: string;
  // 组件展示名，一般是中文
  displayName: string;
  // 用户可以填入的 props，不包含需要代码实例化的 ref 和 其他 hooks
  userInputProps: {
    [key: string]: any;
  };
  // 这是专门给代码生成使用的 props，为了保证代码能准确生成,所以就是一行代码字符串，coding man 会直接复制粘贴。如果这里是空的，但是组件运行需要，那么久需要后续人工写代码了
  codeGeneratingProps: {
    [key: string]: string;
  }
}
