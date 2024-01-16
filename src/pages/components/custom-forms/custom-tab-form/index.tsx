import { ICustomFormProps } from '@/types';
import { useForm } from 'antd/es/form/Form';
import { Button, Form, Input } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { DSLStoreContext } from '@/hooks/context';
import ComponentFeature from '@/types/component-feature';

import styles from './index.module.less';
import cloneDeep from 'lodash/cloneDeep';

export default function CustomTabForm({ value, onChange }: ICustomFormProps) {
  const [key, setKey] = useState<number>(0);
  // const [fields, setFields] = useState<{ key: string; label: string }[]>([]);

  // const templatesRef = useRef<any>({});

  const dslStore = useContext(DSLStoreContext);

  const [form] = useForm();

  useEffect(() => {
    resetFields();
  }, [value]);

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
    return items.map((item, index) => {
      return (
        <div key={item.key} className={styles.formItem}>
          <Form.Item label={`标签页${index}名称`} name={item.key}>
            <Input style={{ width: 100 }} onBlur={resetComponent} />
          </Form.Item>
          {items.length > 1 ? <DeleteOutlined onClick={() => deleteTab(item.key)} /> : null}
        </div>
      );
    });
  }

  function addTab() {
    const result = {
      key: nanoid(),
      label: '新建标签页',
      children: createTemplate()
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
    debugger;
    dslStore.dsl.componentIndexes[node.id] = node;
    if (dslStore.selectedComponent?.id) {
      node.parentId = dslStore.selectedComponent.id;
    } else {
      // 如果没有选中节点，父节点设置为 page root，这本身其实是 bug
      node.parentId = dslStore.dsl.child.current;
    }
    debugger;
    return {
      current: node.id,
      isText: false
    };
  }

  function deleteTab(key: string) {
    const newValue = cloneDeep(value);
    newValue.items = newValue.items.filter(item => item.key !== key);
    if (onChange) {
      onChange(newValue);
    }
  }

  return (
    <div key={key}>
      <Form form={form} onValuesChange={handleChangingValues}>
        {renderFormItems()}
      </Form>
      <Button onClick={addTab}>
        <PlusOutlined />
        加一页
      </Button>
    </div>
  );
}
