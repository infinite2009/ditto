export default interface ComponentSchemaRef {
  current: string;
  isText: boolean;
  configName?: string;
  ext?: Record<string, any>;
}
