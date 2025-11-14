import classNames from 'classnames';
import { ICustomFormProps } from '@/types';
import { useForm } from 'antd/es/form/Form';
import { Form } from 'antd';
import { useContext, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { DSLStoreContext } from '@/hooks/context';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';
import isNil from 'lodash/isNil';

import cloneDeep from 'lodash/cloneDeep';
import { Minus, PlusThin } from '@/components/icon';
import { DndContext } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import SortableItem from '@/pages/components/sortable-item';
import { toJS } from 'mobx';

import styles from './index.module.less';

export default function CustomTransferForm({ value, onChange }: ICustomFormProps) {
  const dslStore = useContext(DSLStoreContext);

  const [form] = useForm();

  useEffect(() => {
    resetFields();
  }, [value]);

  /**
   * 表单值初始化
   */
  function resetFields() {
    const obj = {};
    // 数据源
    if (value?.dataSource) {
      const { dataSource } = value;
      dataSource.forEach((item: { key: string; title: string; description: string }) => {
        obj[item.key] = item.key;
        obj[`${item.key}_title`] = item.title;
        obj[`${item.key}_description`] = item.description;
      });
    }
    // 操作方向
    if (value?.operations) {
      const { operations } = value;
      operations.forEach((item: string, index: number) => {
        obj[`operation_${index}`] = item;
      });
    }
    // 标题集合
    if (value?.titles) {
      const { titles } = value;
      titles.forEach((item: string, index: number) => {
        obj[`title_${index}`] = item;
      });
    }

    form.setFieldsValue(obj);
  }

  /**
   * 表单项数据变更
   */
  function handleChangingValues(changedValues) {
    let needChange = false;
    const newValue = cloneDeep(value);

    // 数据源
    newValue.dataSource.forEach(item => {
      if (!isNil(changedValues[`${item.key}_title`])) {
        item.title = changedValues[`${item.key}_title`];
        needChange = true;
      }
      if (!isNil(changedValues[`${item.key}_description`])) {
        item.description = changedValues[`${item.key}_description`];
        needChange = true;
      }
    });

    // 操作文案
    if (!isNil(changedValues['operation_0'])) {
      newValue.operations[0] = changedValues['operation_0'];
      needChange = true;
    }
    if (!isNil(changedValues['operation_1'])) {
      newValue.operations[1] = changedValues['operation_1'];
      needChange = true;
    }

    // 标题集合
    if (!isNil(changedValues['title_0'])) {
      newValue.titles[0] = changedValues['title_0'];
      needChange = true;
    }
    if (!isNil(changedValues['title_1'])) {
      newValue.titles[1] = changedValues['title_1'];
      needChange = true;
    }

    if (onChange && needChange) {
      onChange(newValue);
    }
  }

  /**
   * 渲染数据源配置项
   */
  function renderFormItems() {
    if (!value?.dataSource) {
      return null;
    }
    const { dataSource } = value;

    return (
      <SortableContext items={dataSource.map(item => item.key)}>
        {dataSource.map(item => {
          return (
            <SortableItem key={item.key} id={item.key} style={{ marginBottom: '2px' }}>
              <div className={styles.formItemContainer}>
                <div className={styles.formItemContent}>
                  <Form.Item name={`${item.key}_title`} label="内容" className={styles.formItem}>
                    <FormInput style={{ width: 130 }} />
                  </Form.Item>
                  <Form.Item
                    name={`${item.key}_description`}
                    label="描述"
                    className={classNames([styles['formItem'], styles['mt2']])}
                  >
                    <FormInput style={{ width: 130 }} />
                  </Form.Item>
                </div>
                {dataSource.length > 1 ? (
                  <Minus className={styles.icon} onClick={() => deleteDataSource(item.key)} />
                ) : null}
              </div>
            </SortableItem>
          );
        })}
      </SortableContext>
    );
  }

  /**
   * 新增数据源
   */
  function addDataSource() {
    const { dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const copy = toJS(dataSource.value);
    const newItem = {
      key: nanoid(),
      title: '',
      description: ''
    };
    (copy as Record<string, any>[]).push(newItem);
    dslStore.updateComponentProps({ dataSource: copy }, dslStore.selectedComponent);
  }

  /**
   * 删除数据源
   */
  function deleteDataSource(key: string) {
    const newValue = cloneDeep(value);
    newValue.dataSource = newValue.dataSource.filter((item: { key: string }) => item.key !== key);
    if (onChange) {
      onChange(newValue);
    }
  }

  /**
   * 数据源排序
   */
  function handleSortingDataSource(e: DragEndEvent) {
    const { active, over } = e;
    const newValue = toJS(value);
    if (active.id === over.id) {
      return;
    }
    const activeIndex = newValue.dataSource.findIndex(item => item.key === active.id);
    const overIndex = newValue.dataSource.findIndex(item => item.key === over.id);
    newValue.dataSource = arrayMove(newValue.dataSource, activeIndex, overIndex);
    if (onChange) {
      onChange(newValue);
    }
  }

  /**
   * 渲染操作文案配置项
   */
  function renderOperationsSetting() {
    if (!value?.operations) {
      return null;
    }
    return (
      <div className={styles.operationContainer}>
        <div className={styles.operationItemContent}>
          <Form.Item name="operation_0" label="从左到右">
            <FormInput style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="operation_1" label="从右到左">
            <FormInput style={{ width: 130 }} />
          </Form.Item>
        </div>
      </div>
    );
  }

  /**
   * 渲染标题集合配置项
   */
  function renderTitlesSetting() {
    if (!value?.titles) {
      return null;
    }
    return (
      <div className={styles.operationContainer}>
        <div className={styles.operationItemContent}>
          <Form.Item name="title_0" label="左侧栏标题">
            <FormInput style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="title_1" label="右侧栏标题">
            <FormInput style={{ width: 130 }} />
          </Form.Item>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.customTransferForm}>
      <Form className={styles.form} form={form} onValuesChange={handleChangingValues}>
        {/* 数据源 */}
        <section>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>数据源：</span>
            <PlusThin className={styles.icon} onClick={addDataSource} />
          </div>
          <section className={styles.dataSourceContent}>
            <DndContext onDragEnd={handleSortingDataSource}>{renderFormItems()}</DndContext>
          </section>
        </section>

        {/* 操作文案 */}
        <section>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>操作文案：</span>
          </div>
          <div>{renderOperationsSetting()}</div>
        </section>

        {/* 标题集合 */}
        <section>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>标题集合：</span>
          </div>
          <div>{renderTitlesSetting()}</div>
        </section>
      </Form>
    </div>
  );
}
