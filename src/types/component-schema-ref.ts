export default interface ComponentSchemaRef {
  configName?: string;
  current: string;
  ext?: Record<string, any>;
  isText: boolean;
  replacement?: {
    type: 'variable' | 'component' | 'module';
    // 这里 ref 是一个引用的名称，可以是变量的 keyPath(例如 ctx.pageData.button0)，可以是模块的 id，也可以是组件的 id
    ref: string;
  };
}
