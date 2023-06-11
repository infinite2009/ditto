export default interface ISchema {
  // 通过 nano id 生成
  id: string;
  // schema 类型：页面、组件、模板
  type: 'page' | 'component' | 'template',
}
