import classNames from 'classnames';
import { ICustomFormProps } from '@/types';
import { useForm } from 'antd/es/form/Form';
import { Form } from 'antd';
import { useContext, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { DSLStoreContext } from '@/hooks/context';
import ComponentFeature from '@/types/component-feature';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';
import FormInputNumber from '@/pages/editor/form-panel/basic-form/form-input-number';
import isNil from 'lodash/isNil';

import cloneDeep from 'lodash/cloneDeep';
import { Minus, PlusThin } from '@/components/icon';
import { DndContext } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import SortableItem from '@/pages/components/sortable-item';
import { toJS } from 'mobx';

import styles from './index.module.less';

export default function CustomItemsForm({ value, onChange }: ICustomFormProps) {
  const dslStore = useContext(DSLStoreContext);

  const [form] = useForm();

  useEffect(() => {
    resetFields();
  }, [value]);

  function resetFields() {
    const obj = {};

    // 列表项数据源
    if (value?.items) {
      const { items } = value;
      items.forEach((item: { key: string; label: string; span?: number }) => {
        obj[item.key] = item.key;
        obj[`${item.key}_label`] = item.label;
        obj[`${item.key}_span`] = item.span;
      });
    }

    form.setFieldsValue(obj);
  }

  /**
   * 表单值变更
   */
  function handleChangingValues(changedValues) {
    let needChange = false;
    const newValue = cloneDeep(value);

    // 数据源
    newValue.items.forEach(item => {
      if (!isNil(changedValues[`${item.key}_label`])) {
        item.label = changedValues[`${item.key}_label`];
        needChange = true;
      }
      if (!isNil(changedValues[`${item.key}_span`])) {
        item.span = changedValues[`${item.key}_span`];
        needChange = true;
      }
    });

    if (onChange && needChange) {
      onChange(newValue);
    }
  }

  /**
   * 新增列表项
   */
  function addItem() {
    const result = {
      key: nanoid(),
      label: '内容描述',
      children: createTemplate()
    };
    const newValue = cloneDeep(value);
    newValue.items.push(result);
    if (onChange) {
      onChange(newValue);
    }
  }

  /**
   * 创建插槽组件
   */
  function createTemplate() {
    const node = dslStore.createEmptyContainer('', {
      feature: ComponentFeature.slot
    });
    dslStore.dsl.componentIndexes[node.id] = node;
    if (dslStore.selectedComponent?.id) {
      node.parentId = dslStore.selectedComponent.id;
    } else {
      node.parentId = dslStore.dsl.child.current;
    }
    return {
      current: node.id,
      isText: false
    };
  }

  /**
   * 删除列表项
   */
  function deleteItem(key: string) {
    const newValue = cloneDeep(value);
    newValue.items = newValue.items.filter((item: { key: string }) => item.key !== key);
    if (onChange) {
      onChange(newValue);
    }
  }

  /**
   * 排序列表项
   */
  function handleSortingItem(e: DragEndEvent) {
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

  function renderFormItems() {
    if (!value?.items) {
      return null;
    }
    const { items } = value;

    return (
      <SortableContext items={items.map(item => item.key)}>
        {items.map(item => {
          return (
            <SortableItem key={item.key} id={item.key} style={{ marginBottom: '2px' }}>
              <div className={styles.formItemContainer}>
                <div className={styles.formItemContent}>
                  <Form.Item name={`${item.key}_label`} label="描述" className={styles.formItem}>
                    <FormInput style={{ width: 130 }} />
                  </Form.Item>
                  <Form.Item
                    name={`${item.key}_span`}
                    label="列数"
                    className={classNames([styles['formItem'], styles['mt2']])}
                  >
                    <FormInputNumber style={{ width: 130 }} precision={0} />
                  </Form.Item>
                </div>
                {items.length > 1 ? <Minus className={styles.icon} onClick={() => deleteItem(item.key)} /> : null}
              </div>
            </SortableItem>
          );
        })}
      </SortableContext>
    );
  }

  return (
    <div className={styles.customDescriptionsForm}>
      <Form className={styles.form} form={form} onValuesChange={handleChangingValues}>
        {/* 数据源 */}
        <section>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>列表项</span>
            <PlusThin className={styles.icon} onClick={addItem} />
          </div>
          <section className={styles.dataSourceContent}>
            <DndContext onDragEnd={handleSortingItem}>{renderFormItems()}</DndContext>
          </section>
        </section>
      </Form>
    </div>
  );
}
