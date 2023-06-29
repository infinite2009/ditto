export default interface ISchema {
  // 通过 nano id 生成
  id: string;
  // schema 类型：页面、组件、模板、事件、处理器、动作、属性
  schemaType: 'page' | 'component' | 'template' | 'event' | 'handler' | 'action' | 'props' | 'httpService',
}
