import IComponentConfig, { IPropsConfigItem } from '@/types/component-config';
import IFormConfig, { FormItemSchema, FormSchema, StyleFormConfig } from '@/types/form-config';
import IPropsSchema from '@/types/props.schema';
import { isArray, isEmpty, omit, pick } from 'lodash';
import React from 'react';

// 将部分属性变为可选
type PartialPick<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

type BasePropsWithSchema = Omit<PartialPick<IPropsConfigItem, 'id' | 'name' | 'title'>, 'category' | 'valueType'>;

type BasicPropsWithSchema = BasePropsWithSchema & {
  category: 'basic';
  // type 默认用外层valueType
  schema?: PartialPick<FormItemSchema, 'type' | 'name'>;
  valueType: Exclude<IPropsSchema['valueType'], 'function'>;
};

type StylePropsWithSchema = BasePropsWithSchema & {
  category: 'style';
  schema?: StyleFormConfig;
  valueType: Extract<IPropsSchema['valueType'], 'object'>;
};

type EventPropsWithSchema = BasePropsWithSchema & {
  category: 'event';
  valueType: Extract<IPropsSchema['valueType'], 'function' | 'array'>;
  // schema?: { triggers: EventTrigger[] };
};

type DataPropsWithSchema = BasePropsWithSchema & {
  category: 'data';
  schema?: any;
  valueType: IPropsSchema['valueType'];
};

type ChildrenPropsWithSchema = BasePropsWithSchema & {
  category: 'children';
  valueType: IPropsSchema['valueType'];
  schema?: PartialPick<FormItemSchema, 'type' | 'name'>;
};
type HiddenPropsWithSchema = BasePropsWithSchema & {
  category: 'hidden';
  schema?: any;
  valueType: IPropsSchema['valueType'];
};

//属性的 id、name 与 key 保持一致
// 表单的 name在 schema 中维护
type ComponentPropsWithSchema =
  | BasicPropsWithSchema
  | StylePropsWithSchema
  | EventPropsWithSchema
  | DataPropsWithSchema
  | ChildrenPropsWithSchema
  | HiddenPropsWithSchema;

export type ComponentConfig = Omit<IComponentConfig, 'propsConfig' | 'children'> & {
  propsConfig: {
    // [key: string]: IPropsConfigItem;
    [key: string]: ComponentPropsWithSchema;
  };
  children?: PartialPick<IComponentConfig['children'], 'name' | 'category'> & {
    schema?: PartialPick<FormItemSchema, 'type' | 'name'>;
  };
  formSchema?: PartialPick<IFormConfig, 'configName' | 'schema'>;
};
export function define(config: ComponentConfig) {
  return config;
}

export function omitEmptyProps(props: AnyObject) {
  return omit(props, Object.keys(props).filter(i => isEmpty(props[i])));
}

export function generateDefaultStyleConfig(style: React.CSSProperties = {}, schema: StyleFormConfig | 'all' | (keyof StyleFormConfig)[] = 'all'): StylePropsWithSchema {
  const allSchema: StyleFormConfig = {
    layout: true,
    backgroundColor: true,
    border: true,
    shadow: true,
    text: true
  };
  const getSchema = () => {
    if (schema === 'all') {
      return allSchema;
    }
    if (isArray(schema)) {
      return pick(allSchema, schema);
    }
    return schema;
  };
  return {
    schemaType: 'props',
    category: 'style',
    value: {
      ...style
    },
    valueType: 'object',
    valueSource: 'editorInput',
    schema: getSchema()
  };
}

export function getComponentProps(config: ComponentConfig): IComponentConfig {
  const propsConfig = Object.fromEntries(Object.entries(config.propsConfig).map(([key, value]: [string, ComponentPropsWithSchema]) => {
    const v = {
      ...omit(value, ['schema', 'formSchema']),
      id: key,
      name: value.name ?? key,
      title: value.title ?? ('schema' in value && 'title' in value.schema ? value.schema.title : '')
    };
    return [key, v];
  })) as IComponentConfig['propsConfig'];
  return {
    ...config,
    name: config.name || config.configName,
    propsConfig,
    children: config.children ? omit({
      ...config.children,
      name: config.children.name || 'children',
      category: config.children.category || 'children'
    }, ['schema']) : undefined
  };
}

export function getComponentSchema(config: ComponentConfig): IFormConfig {
  const props = config.propsConfig;
  const schema = config.formSchema || {};
  const basicProps: IFormConfig['schema']['basic'] = Object.fromEntries(Object.entries(props)
    .filter(([_, v]) => (v.category === 'basic') && v.schema)
    .map(([k, v]: [string, BasicPropsWithSchema]) => [k, {
      ...v.schema,
      name: v.name ?? k,
      type: v.schema?.type ?? v.valueType,
    }]));
  const styleProps = Object.values(props).filter(i => i.category === 'style')?.[0]?.schema;
  const childrenSchema = config.children?.schema;
  const childrenProps: FormSchema = (config.children?.category ?? 'children') === 'children' && childrenSchema ? {
    children: {
      ...childrenSchema,
      name: childrenSchema.name ?? 'children',
      type: childrenSchema.type ?? 'string',
      initialValue: childrenSchema.initialValue ?? config.children?.value
    }
  } : undefined;
  const event = {};
  Object.entries(props).filter(([key, value]) => value.category === 'event').forEach(([key, value]) => {
    event[key] = {
      name: key,
      title: value.title,
      component: 'Select'
    };
  });
  return {
    ...schema,
    configName: schema?.configName ?? config.configName,
    schema: omitEmptyProps({
      basic: ({ ...schema?.schema?.basic, ...basicProps, ...childrenProps }),
      style: ({ ...schema?.schema?.style, ...styleProps }),
      event: ({ ...schema?.schema?.event, ...event })
    }),
  };
}