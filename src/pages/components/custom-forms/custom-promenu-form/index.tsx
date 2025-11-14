import { useContext, useEffect } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { Form } from 'antd';
import { useForm } from 'antd/es/form/Form';
import EditCascaderOptions from '../custom-cascader-form/EditCascaderOptions';
import { has } from 'lodash';

import styles from './index.module.less';

interface TreeNode {
  children?: TreeNode[];
  [key: string]: string | TreeNode[];
}

export default function CustomStepsForm({ value, onChange }) {
  const [form] = useForm();

  const dslStore = useContext(DSLStoreContext);
  const component = dslStore.selectedComponent;
  const props = dslStore.dsl.props[component?.id];

  useEffect(() => {
    resetFields();
  }, [value]);

  function resetFields() {
    form.setFieldsValue(value);
  }

  /**
   * 递归处理树形数据结构，追加key，处理children
   */
  function recursiveFilter(data: TreeNode[]): TreeNode[] {
    return (
      data?.map(item => {
        // 将唯一value赋key字段，用于promenu组件
        item.key = item.value || item.key;
        // 递归处理，如果children为空数组置为undefined以允许选择菜单
        if (item.children?.length) {
          item.children = recursiveFilter(item.children);
        } else {
          delete item.children;
        }
        return item;
      }) || []
    );
  }

  /**
   * 表单值变更
   */
  function handleChangingValues(changedValues) {
    let needChange = false;

    // 菜单项数据变更
    if (has(changedValues, 'items')) {
      needChange = true;

      // items过滤超过3级的数据 + 将底层tree绑定的value赋key字段给ProMenu
      changedValues.items = recursiveFilter(changedValues?.items);

      if (onChange && needChange) {
        onChange(changedValues);
      }
    }
  }

  return (
    <div className={styles.customProMenuForm}>
      <Form
        layout="vertical"
        className={styles.form}
        form={form}
        onValuesChange={handleChangingValues}
        initialValues={{
          items: props.items.value
        }}
      >
        <Form.Item name={props.items.name} label={props.items.title} className={styles.formItem}>
          <EditCascaderOptions fieldNames={{ title: 'label', key: 'key' }} />
        </Form.Item>
      </Form>
    </div>
  );
}
