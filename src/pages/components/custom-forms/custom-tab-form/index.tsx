import { ICustomFormProps } from '@/types';
import { useForm } from 'antd/es/form/Form';
import { Button, Form, Input } from 'antd';
import { useContext, useEffect } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';
import { DSLStoreContext } from '@/hooks/context';
import ComponentFeature from '@/types/component-feature';

import styles from './index.module.less';

export default function CustomTabForm({ value, onChange }: ICustomFormProps) {
  // const [fields, setFields] = useState<{ key: string; label: string }[]>([]);

  // const templatesRef = useRef<any>({});

  const dslStore = useContext(DSLStoreContext);

  const [form] = useForm();

  useEffect(() => {
    if (value?.items) {
      const { items } = value;
      const obj = {};
      items.forEach((item: { key: string; label: string }) => {
        obj[item.key] = item.label;
      });
      console.log('value changed: ', obj);
      form.setFieldsValue(obj);
    }
  }, [value]);

  // useEffect(() => {
  //   // TODO：会有问题，此时可能会有空的标签页名称
  //   form.setFieldsValue(fields);
  // }, [fields]);

  function handleChangingValues(changedValues: any, allValues: any) {
    console.log('all fields: ', allValues);

    console.log('changed values: ', changedValues);
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
            <Input style={{ width: 100 }} />
          </Form.Item>
          <DeleteOutlined onClick={() => deleteTab(item.key)} />
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
    const newValue = {
      ...value
    };
    newValue.items = [...value.items, result];
    if (onChange) {
      onChange(newValue);
    }
    // templatesRef.current[result.key] = {
    //   ...result,
    //   children: createTemplate()
    // };
    // setFields({
    //   ...fields,
    //   [result.key]: result.label
    // });
  }

  function createTemplate() {
    // TODO: 这里的 id 可能会有问题，需要仔细测试下
    const node = dslStore.createEmptyContainer('', {
      feature: ComponentFeature.slot
    });
    dslStore.dsl.componentIndexes[node.id] = node;
    return {
      current: node.id,
      isText: false
    };
  }

  function deleteTab(key: string) {
    // delete templatesRef.current[key];
    // delete fields[key];
    // setFields(fields);
  }

  return (
    <div>
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
