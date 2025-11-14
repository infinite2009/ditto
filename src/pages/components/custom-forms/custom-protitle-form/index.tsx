import { useForm } from 'antd/es/form/Form';
import { Form, Switch, Radio } from 'antd';
import { useContext, useEffect } from 'react';
import { DSLStoreContext } from '@/hooks/context';
import ComponentFeature from '@/types/component-feature';
import { has } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import styles from './index.module.less';

// 状态options
const extraContentOptions = [
  {
    value: undefined,
    label: '无'
  },
  {
    value: 'left',
    label: '左'
  },
  {
    value: 'right',
    label: '右'
  },
  {
    value: 'both',
    label: '左&右'
  }
];

export default function CustomProTitleForm({ value, onChange }) {
  const dslStore = useContext(DSLStoreContext);

  const [form] = useForm();

  useEffect(() => {
    resetFields();
  }, [value]);

  function resetFields() {
    const obj = {};

    // 启用「说明ICON」
    if (value?.icon) {
      obj['icon'] = true;
    }

    // 启用「标题区」额外元素
    if (value?.extraContent) {
      obj['extraContent'] = undefined;
      if (value?.extraContent?.left) {
        obj['extraContent'] = 'left';
      }
      if (value?.extraContent?.right) {
        obj['extraContent'] = 'right';
      }
      if (value?.extraContent?.left && value?.extraContent?.right) {
        obj['extraContent'] = 'both';
      }
    }

    form.setFieldsValue(obj);
  }

  /**
   * 创建插槽
   */
  function createSlotComponent() {
    const newComponent = dslStore.dangerousInsertComponent(
      dslStore.selectedComponent.id,
      'VerticalFlex',
      'antd',
      -1,
      { feature: ComponentFeature.slot } // 创建一个slot占位，不会被选中
    );
    return {
      current: newComponent.id,
      configName: newComponent.configName,
      isText: false
    };
  }

  /**
   * 表单值变更
   */
  function handleChangingValues(changedValues) {
    let needChange = false;
    const newValue = cloneDeep(value);

    // 启用「说明ICON」
    if (has(changedValues, 'icon')) {
      if (changedValues.icon) {
        newValue.icon = createSlotComponent();
      } else {
        // 删除组件
        if (newValue.icon?.current) {
          dslStore.deleteComponent(newValue.icon.current);
        }
        newValue.icon = undefined;
      }
      needChange = true;
    }

    // 启用「标题区」额外元素
    if (has(changedValues, 'extraContent')) {
      // 先删除插槽，防止重复添加
      if (newValue.extraContent?.left?.current) {
        dslStore.deleteComponent(newValue.extraContent.left.current);
      }
      if (newValue.extraContent?.right?.current) {
        dslStore.deleteComponent(newValue.extraContent.right.current);
      }
      newValue.extraContent.left = undefined;
      newValue.extraContent.right = undefined;

      // 添加插槽
      if (['left', 'right', 'both'].includes(changedValues.extraContent)) {
        newValue.extraContent = {
          left: ['left', 'both'].includes(changedValues.extraContent) ? createSlotComponent() : undefined,
          right: ['right', 'both'].includes(changedValues.extraContent) ? createSlotComponent() : undefined
        };
      }
      needChange = true;
    }

    if (onChange && needChange) {
      onChange(newValue);
    }
  }

  return (
    <div className={styles.customProTitleForm}>
      <Form className={styles.form} form={form} onValuesChange={handleChangingValues}>
        {/* 启用「说明ICON」 */}
        <section>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>
              <Form.Item name="icon" label="启用「说明ICON」：">
                <Switch></Switch>
              </Form.Item>
            </span>
          </div>
        </section>

        {/* 「标题区」额外元素 */}
        <section>
          <Form.Item name="extraContent" label="启用「标题区」额外元素：" layout="vertical">
            <Radio.Group optionType="button" options={extraContentOptions}></Radio.Group>
          </Form.Item>
        </section>
      </Form>
    </div>
  );
}
