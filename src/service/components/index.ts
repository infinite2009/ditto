import { default as Button } from './button';
import { default as PageRoot } from './page-root';
import { default as HorizontalFlex } from './horizontal-flex';
import { default as VerticalFlex } from './vertical-flex';
import { default as Text } from './text';
import { default as Table } from './table';
import { default as DatePicker } from './date-picker';
import { getComponentProps, getComponentSchema } from './utils';

const components = {
  Button,
  Text,
  Table,
  DatePicker,
};

const nativeComponents = {
  PageRoot,
  HorizontalFlex,
  VerticalFlex
};


const ComponentConfig = Object.fromEntries(Object.values(components).map((config) => {
  return [config.configName, getComponentProps(config)];
}));

const SchemaConfig = Object.fromEntries(Object.values(components).map((config) => {
  return [config.configName, getComponentSchema(config)];
}));

const NativeComponentsConfig = Object.fromEntries(Object.values(nativeComponents).map((config) => {
  return [config.configName, getComponentProps(config)];
}));
const NativeSchemaConfig = Object.fromEntries(Object.values(nativeComponents).map((config) => {
  return [config.configName, getComponentSchema(config)];
}));

export { ComponentConfig, SchemaConfig, NativeComponentsConfig, NativeSchemaConfig };