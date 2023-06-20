export default interface DynamicObject<T=any> {
  [key: string]: T;
}
