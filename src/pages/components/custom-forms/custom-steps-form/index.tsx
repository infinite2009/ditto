import classNames from 'classnames';
import { useForm } from 'antd/es/form/Form';
import { Form, Select, Switch } from 'antd';
import { useContext, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { DSLStoreContext } from '@/hooks/context';
import ComponentFeature from '@/types/component-feature';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';
import has from 'lodash/has';

import cloneDeep from 'lodash/cloneDeep';
import { Minus, PlusThin } from '@/components/icon';
import { DndContext } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import SortableItem from '@/pages/components/sortable-item';
import { toJS } from 'mobx';

import styles from './index.module.less'; // 状态options

// 状态options
const statusOptions = [
  {
    value: 'wait',
    label: 'wait'
  },
  {
    value: 'process',
    label: 'process'
  },
  {
    value: 'finish',
    label: 'finish'
  },
  {
    value: 'error',
    label: 'error'
  }
];

export default function CustomStepsForm({ value, onChange }) {
  const dslStore = useContext(DSLStoreContext);

  const [form] = useForm();

  useEffect(() => {
    resetFields();
  }, [value]);

  function resetFields() {
    const obj = {};

    // 列表项表单值处理
    if (value?.items) {
      const { items } = value;
      items.forEach((item: Record<string, string>) => {
        obj[item.key] = item.key;
        obj[`${item.key}_title`] = item.title;
        obj[`${item.key}_subTitle`] = item.subTitle;
        obj[`${item.key}_description`] = item.description;
        obj[`${item.key}_status`] = item.status;
        obj[`${item.key}_icon`] = item.icon;
        obj[`${item.key}_disabled`] = item.disabled;
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
      // 标题
      if (has(changedValues, `${item.key}_title`)) {
        item.title = changedValues[`${item.key}_title`];
        needChange = true;
      }
      // 副标题
      if (has(changedValues, `${item.key}_subTitle`)) {
        item.subTitle = changedValues[`${item.key}_subTitle`];
        needChange = true;
      }
      // 描述
      if (has(changedValues, `${item.key}_description`)) {
        item.description = changedValues[`${item.key}_description`];
        needChange = true;
      }
      // 状态
      if (has(changedValues, `${item.key}_status`)) {
        if (changedValues[`${item.key}_status`]) {
          item.status = changedValues[`${item.key}_status`];
        } else {
          delete item.status;
        }
        needChange = true;
      }
      // 图标（动态增删插槽）
      if (has(changedValues, `${item.key}_icon`)) {
        if (changedValues[`${item.key}_icon`]) {
          // 创建插槽
          const newComponent = dslStore.dangerousInsertComponent(
            dslStore.selectedComponent.id,
            'VerticalFlex',
            'antd',
            -1,
            { feature: ComponentFeature.slot } // 创建一个slot占位，不会被选中
          );
          item.icon = {
            current: newComponent.id,
            configName: newComponent.configName,
            isText: false
          };
        } else {
          // 删除组件
          if (item.icon.current) {
            dslStore.deleteComponent(item.icon.current);
          }
          item.icon = undefined;
        }
        needChange = true;
      }
      // 禁用
      if (has(changedValues, `${item.key}_disabled`)) {
        item.disabled = changedValues[`${item.key}_disabled`];
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
      title: 'title',
      subTitle: 'sub title',
      description: 'description'
    };
    const newValue = cloneDeep(value);
    newValue.items.push(result);
    if (onChange) {
      onChange(newValue);
    }
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

  /**
   * 为了给Switch设置宽度包了一个div，所以需要使用HOC方式注入props
   */
  function SwitchHOC(props) {
    return (
      <div style={{ width: 130 }}>
        <Switch checkedChildren="开启" unCheckedChildren="关闭" {...props} />
      </div>
    );
  }

  /**
   * 列表项渲染
   */
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
                  <Form.Item name={`${item.key}_title`} label="标题" className={styles.formItem}>
                    <FormInput style={{ width: 130 }} />
                  </Form.Item>
                  <Form.Item
                    name={`${item.key}_subTitle`}
                    label="副标题"
                    className={classNames([styles['formItem'], styles['mt2']])}
                  >
                    <FormInput style={{ width: 142 }} />
                  </Form.Item>
                  <Form.Item
                    name={`${item.key}_description`}
                    label="描述"
                    className={classNames([styles['formItem'], styles['mt2']])}
                  >
                    <FormInput style={{ width: 130 }} />
                  </Form.Item>
                  <Form.Item
                    name={`${item.key}_status`}
                    label="状态"
                    className={classNames([styles['formItem'], styles['mt2']])}
                  >
                    <Select style={{ width: 130, height: 24 }} allowClear options={statusOptions} />
                  </Form.Item>
                  <Form.Item
                    name={`${item.key}_icon`}
                    label="图标"
                    valuePropName="checked"
                    className={classNames([styles['formItem'], styles['mt2']])}
                  >
                    <SwitchHOC />
                  </Form.Item>
                  <Form.Item
                    name={`${item.key}_disabled`}
                    label="禁用"
                    valuePropName="checked"
                    className={classNames([styles['formItem'], styles['mt2']])}
                  >
                    <SwitchHOC />
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
