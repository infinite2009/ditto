import { useForm } from 'antd/es/form/Form';
import { Form, Switch } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { DSLStoreContext } from '@/hooks/context';
import ComponentFeature from '@/types/component-feature';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';

import cloneDeep from 'lodash/cloneDeep';
import { Minus, PlusThin } from '@/components/icon';
import { DndContext } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import SortableItem from '@/pages/components/sortable-item';
import { toJS } from 'mobx';

import styles from './index.module.less';
import { SwitchProps } from 'antd/lib';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { omit } from 'lodash';

type TabFormField = {
  items: {
    key: string;
    label: string;
    children?: ComponentSchemaRef;
  }[];
  level: number;
};

type ICustomFormProps = {
  value: TabFormField;
  onChange: (value: TabFormField) => void;
};

export default function CustomItemsForm({ value, onChange }: ICustomFormProps) {
  const dslStore = useContext(DSLStoreContext);

  const [form] = useForm();
  const showSlot = useMemo(() => {
    return value.items?.some(item => item.children);
  }, [JSON.stringify(value.items)]);
  const getChangedItem = (originItem: TabFormField['items'][number], e: boolean) => {
    const item = cloneDeep(originItem);
    if (e) {
      return {
        ...item,
        children: item.children || createTemplate()
      };
    } else {
      const { current } = item.children || {};
      if (current) {
        dslStore.dangerousDeleteComponent(current);
      }
      return omit(item, 'children');
    }
  };
  const onItemSwitchChange = (key: string): SwitchProps['onChange'] => {
    const valueClone = cloneDeep(value);
    const index = valueClone.items.findIndex(item => item.key === key);
    const item = valueClone.items[index];

    return (e) => {
      const newItem = getChangedItem(item, e);
      valueClone.items[index] = newItem;
      onChange(valueClone);
    };
  };
  const onSwitchChange: SwitchProps['onChange'] = (v) => {
    let items: TabFormField['items'] = [];
    if (v) {
      items = value.items.map(item => {
        return {
          ...item,
          children: item.children || createTemplate()
        };
      });
    } else {
      items = value.items.map(item => {
        const { current } = item.children || {};
        if (current) {
          dslStore.dangerousDeleteComponent(current);
        }
        return omit(item, 'children');
      });
    }
    onChange({
      ...value,
      items
    });
  };

  function resetFields() {
    if (value?.items) {
      const { items } = value;
      const obj = {};
      items.forEach((item: { key: string; label: string }) => {
        obj[item.key] = item.label;
      });
      form.setFieldsValue(obj);
    }
  }

  function handleChangingValues(changedValues: any) {
    let needChange = false;
    const newValue = cloneDeep(value);
    newValue.items.forEach(item => {
      if (changedValues[item.key]) {
        item.label = changedValues[item.key];
        needChange = true;
      }
    });
    if (onChange && needChange) {
      onChange(newValue);
    }
  }

  function resetComponent(e) {
    if (!e.target.value) {
      resetFields();
    }
  }

  function renderFormItems() {
    // 这里有错误，应该用 fields，而且 fields 不应该用对象，应该用 map 或者数组
    if (!value?.items) {
      return null;
    }
    const { items } = value;

    return (
      <SortableContext items={items.map(item => item.key)}>
        {items.map(item => {
          const showSlot = Boolean(item.children);
          return (
            <SortableItem key={item.key} id={item.key}>
              <div className={styles.formItem}>
                <Form.Item name={item.key}>
                  <FormInput style={{ width: 100 }} />
                </Form.Item>
                <Switch checkedChildren="开启插槽" unCheckedChildren="关闭插槽" checked={showSlot} onChange={onItemSwitchChange(item.key)} />
                {items.length > 1 ? <Minus className={styles.icon} onClick={() => deleteTab(item.key)} /> : null}
              </div>
            </SortableItem>
          );
        })}
      </SortableContext>
    );
  }

  function addTab() {
    const result = {
      key: nanoid(),
      label: `标签页${(value?.items?.length ?? 0) + 1}`,
      // children: createTemplate()
    };
    const newValue = cloneDeep(value);
    newValue.items.push(result);
    if (onChange) {
      onChange(newValue);
    }
  }

  function createTemplate() {
    const node = dslStore.createEmptyContainer('', {
      feature: ComponentFeature.slot
    });
    dslStore.dsl.componentIndexes[node.id] = node;
    if (dslStore.selectedComponent?.id) {
      node.parentId = dslStore.selectedComponent.id;
    } else {
      // 如果没有选中节点，父节点设置为 page root，这本身其实是 bug
      node.parentId = dslStore.dsl.child.current;
    }
    return {
      current: node.id,
      isText: false
    };
  }

  function deleteTab(key: string) {
    const newValue = cloneDeep(value);
    newValue.items = newValue.items.filter((item: { key: string }) => item.key !== key);
    if (onChange) {
      onChange(newValue);
    }
  }

  function handleSortingTabs(e: DragEndEvent) {
    const { active, over } = e;
    const newValue = toJS(value);
    if (active.id === over.id) {
      return;
    }
    const activeIndex = newValue.items.findIndex(item => item.key === active.id);
    const overIndex = newValue.items.findIndex(item => item.key === over.id);
    newValue.items = arrayMove(newValue.items, activeIndex, overIndex);
    if (onChange) {
      onChange(newValue);
    }
  }

  useEffect(() => {
    resetFields();
  }, [value]);

  return (
    <div className={styles.customTabForm}>
      <div className={styles.titleWrapper}>
        <span className={styles.title}>Tab 分栏</span>
        {/* <Switch checkedChildren="开启插槽" unCheckedChildren="关闭插槽" checked={showSlot} onChange={onSwitchChange} /> */}
        <PlusThin className={styles.icon} onClick={addTab} />
      </div>
      <Form className={styles.form} form={form} onValuesChange={handleChangingValues}>
        <DndContext onDragEnd={handleSortingTabs}>{renderFormItems()}</DndContext>
      </Form>
    </div>
  );
}
