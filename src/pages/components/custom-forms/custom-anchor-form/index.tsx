import { ICustomFormProps } from '@/types';
import { useForm } from 'antd/es/form/Form';
import { Form } from 'antd';
import { useEffect } from 'react';
import { nanoid } from 'nanoid';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';

import cloneDeep from 'lodash/cloneDeep';
import { Minus, PlusThin } from '@/components/icon';
import { DndContext } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import SortableItem from '@/pages/components/sortable-item';
import { toJS } from 'mobx';
import ComponentTreeSelect from '@/pages/editor/component-tree-select';

import styles from './index.module.less';

export default function CustomAnchorForm({ value, onChange }: ICustomFormProps) {
  const [form] = useForm();

  useEffect(() => {
    resetFields();
  }, [value]);

  function resetFields() {
    const { items, getContainer } = value || {};
    if (getContainer) {
      form.setFieldsValue({
        getContainer
      });
    }
    if (items) {
      const obj = {};
      items.forEach((item: { key: string; title: string; href: string }) => {
        obj[item.key] = item.title;
        obj[`${item.key}_href`] = item.href; // 锚点需要的关联元素id（href）
      });
      form.setFieldsValue(obj);
    }
  }

  function handleChangingValues(changedValues: Record<string, string>) {
    let needChange = false;
    const newValue = cloneDeep(value);
    newValue.items.forEach(item => {
      if (changedValues[item.key]) {
        item.title = changedValues[item.key];
        needChange = true;
      }
      if (changedValues[`${item.key}_href`]) {
        item.href = changedValues[`${item.key}_href`];
        needChange = true;
      }
    });
    if (changedValues.getContainer !== newValue.getContainer) {
      newValue.getContainer = changedValues.getContainer;
      needChange = true;
    }
    if (onChange && needChange) {
      onChange(newValue);
    }
  }

  function renderFormItemSetting(item) {
    return (
      <div>
        <span>锚点关联元素</span>
        <Form.Item name={`${item.key}_href`}>
          <ComponentTreeSelect allowClear showSearch treeNodeFilterProp="name" />
        </Form.Item>
      </div>
    );
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
          return (
            <SortableItem key={item.key} id={item.key} footer={renderFormItemSetting(item)}>
              <div className={styles.formItem}>
                <Form.Item name={item.key}>
                  <FormInput style={{ width: 100 }} />
                </Form.Item>
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
      title: '新建锚点',
      href: undefined
    };
    const newValue = cloneDeep(value);
    newValue.items.push(result);
    if (onChange) {
      onChange(newValue);
    }
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

  return (
    <div className={styles.customAnchorForm}>
      <Form className={styles.form} form={form} onValuesChange={handleChangingValues}>
        {value.affix && (
          <Form.Item label="指定滚动容器" name="getContainer">
            <ComponentTreeSelect allowClear />
          </Form.Item>
        )}
        <div>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>Anchor 锚点</span>
            <PlusThin className={styles.icon} onClick={addTab} />
          </div>
          <DndContext onDragEnd={handleSortingTabs}>{renderFormItems()}</DndContext>
        </div>
      </Form>
    </div>
  );
}
