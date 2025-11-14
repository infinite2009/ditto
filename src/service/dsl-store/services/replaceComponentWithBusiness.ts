import { ComponentId } from '@/types';
import DSLStore from '..';
import IComponentSchema from '@/types/component.schema';
import { cloneDeep } from 'lodash';
import { toJS } from 'mobx';
import DynamicObject from '@/types/dynamic-object';
import IPropsSchema from '@/types/props.schema';

export interface ReplaceComponentWithBusinessValues {
  children: string[];
  dependency: string;
  name: string;
  props: string[];
}

export function toCopyId(id: ComponentId) {
  return `__replace_${id}`;
}
/**
 * 使用业务模块替换设计组件
 * @param dslStore
 * @param id 组件名称
 * @param values 替换信息, 为 null 时删除替换
 */
export function replaceComponentWithBusiness(
  dslStore: DSLStore,
  id: ComponentId,
  values: ReplaceComponentWithBusinessValues | null
) {
  const copyId = toCopyId(id);
  if (!dslStore.dsl.businessReplacement) {
    dslStore.dsl.businessReplacement = {};
  }
  const targetComponentSchema = dslStore.dsl.componentIndexes[id];

  // 设置 nodeRef 中的 replacement
  const parentId = targetComponentSchema.parentId;
  if (!parentId) {
    throw new Error(`no_parent_in_component_schema: ${id}`);
  }

  const targetComponentParentSchema = dslStore.dsl.componentIndexes[parentId];

  if (!targetComponentParentSchema) {
    throw new Error(`not_fund_parent_schema_in: ${parentId}`);
  }
  // 设置替换组件的父组件的 children 中的 replacement 设置
  targetComponentParentSchema.children.forEach(childRef => {
    if (childRef.current === id) {
      if (values === null) {
        delete childRef.replacement;
      } else {
        childRef.replacement = {
          type: 'module',
          ref: copyId
        };
      }
    }
  });

  if (values === null) {
    delete dslStore.dsl.businessReplacement[copyId];
  } else {
    // 将替换内容放入 businessReplacement 里
    const schema: IComponentSchema = dslStore.dsl.businessReplacement[copyId] ?? cloneDeep(targetComponentSchema);

    // clone 一份 props 到 dsl.props 中

    const targetComponentProps = dslStore.dsl.props[id];

    if (!targetComponentProps) {
      throw new Error(`not_fund_props_in: ${id}`);
    }

    const copiedProp = cloneDeep(targetComponentProps);
    dslStore.dsl.props[copyId] = toJS(copiedProp);

    // 设置 name
    schema.callingName = values.name;
    schema.importName = values.name;
    schema.name = values.name;
    // 设置 propsRefs
    schema.propsRefs = values.props;
    // 设置 dependency
    schema.dependency = values.dependency;

    // 仅保留 propsRefs 里存在的 props
    dslStore.dsl.props[copyId] = Object.fromEntries(
      Object.entries(copiedProp).filter(([key]) => values.props.includes(key))
    ) as DynamicObject<IPropsSchema<any>>;

    // 设置 children
    if (targetComponentSchema.children) {
      schema.children = cloneDeep(
        targetComponentSchema.children.filter(child => values.children?.includes(child.current))
      );
    }

    // 将替换内容放入 businessReplacement 里
    dslStore.dsl.businessReplacement[copyId] = schema;
  }
}
