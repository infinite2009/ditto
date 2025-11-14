import { ICustomFormProps } from '@/types';
import { useForm } from 'antd/es/form/Form';
import { Form, Switch } from 'antd';
import { useEffect } from 'react';
import FormInputNumber from '@/pages/editor/form-panel/basic-form/form-input-number';
import isNil from 'lodash/isNil';
import isBoolean from 'lodash/isBoolean';

import cloneDeep from 'lodash/cloneDeep';

import styles from './index.module.less';

export default function CustomSliderForm({ value, onChange }: ICustomFormProps) {
  const [form] = useForm();

  useEffect(() => {
    resetFields();
  }, [value]);

  /**
   * 表单值初始化
   */
  function resetFields() {
    const obj = {};
    // 双滑块模式
    if (isBoolean(value?.range)) {
      obj['twiceRange'] = value?.range;
      // 如果双滑块模式切换为false，范围刻度是否可被拖拽表单值也置为false
      if (!value?.range) {
        obj['draggableTrack'] = false;
      }
    }
    // 范围刻度是否可被拖拽（如果范围刻度是否可被拖拽表单值为true，则将双滑块模式也置为true）
    if (value?.range?.draggableTrack) {
      obj['draggableTrack'] = true;
      obj['twiceRange'] = true;
    }

    // 默认值
    if (Array.isArray(value?.defaultValue)) {
      const { defaultValue } = value;
      obj[`defaultValue_0`] = defaultValue[0] || 0;
      obj[`defaultValue_1`] = defaultValue[1] || 0;
    } else {
      obj[`defaultValue_0`] = value?.defaultValue;
    }

    form.setFieldsValue(obj);
  }

  /**
   * 表单项数据变更
   */
  function handleChangingValues(changedValues: any) {
    let needChange = false;
    const newValue = cloneDeep(value);

    // 双滑块模式
    // “是否启用双滑块模式”，优先级低于“范围刻度是否可被拖拽”
    if (!isNil(changedValues['twiceRange'])) {
      newValue.range = changedValues['twiceRange'];
      needChange = true;
    }
    // 范围刻度是否可被拖拽
    if (!isNil(changedValues['draggableTrack'])) {
      if (changedValues['draggableTrack']) {
        newValue.range = { draggableTrack: true };
      } else {
        newValue.range = form.getFieldValue('twiceRange') || false; // 范围刻度是否可被拖拽为false，先取“启用双滑块模式”的值
      }
      needChange = true;
    }
    // 如果是双滑块模式，默认值改为数组，否则改为number
    if (newValue?.range?.draggableTrack || newValue?.range) {
      newValue.defaultValue = [
        changedValues['defaultValue_0'] || form.getFieldValue('defaultValue_0') || 0,
        changedValues['defaultValue_1'] || form.getFieldValue('defaultValue_1') || 0
      ];
      needChange = true;
    } else {
      newValue.defaultValue = changedValues['defaultValue_0'] || form.getFieldValue('defaultValue_0') || 0;
      needChange = true;
    }

    if (onChange && needChange) {
      onChange(newValue);
    }
  }

  /**
   * 双滑块模式
   */
  function renderOperationsSetting() {
    return (
      <div className={styles.operationItem}>
        <div className={styles.operationItemContent}>
          <Form.Item name="twiceRange" label="启用双滑块模式">
            <Switch />
          </Form.Item>
          <Form.Item name="draggableTrack" label="范围刻度是否可被拖拽">
            <Switch />
          </Form.Item>
        </div>
      </div>
    );
  }

  /**
   * 默认值
   */
  function renderDefaultValue() {
    // 单滑块
    if (!value.range) {
      return (
        <div className={styles.operationItem}>
          <div className={styles.operationItemContent}>
            <Form.Item name="defaultValue_0" label="默认值">
              <FormInputNumber style={{ width: 130 }} />
            </Form.Item>
          </div>
        </div>
      );
    }

    // 双滑块
    return (
      <div className={styles.operationItem}>
        <div className={styles.operationItemContent}>
          <Form.Item name="defaultValue_0" label="默认值1">
            <FormInputNumber style={{ width: 130 }} />
          </Form.Item>
          <Form.Item name="defaultValue_1" label="默认值2">
            <FormInputNumber style={{ width: 130 }} />
          </Form.Item>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.customSliderForm}>
      <Form className={styles.form} form={form} onValuesChange={handleChangingValues}>
        {/* 默认值 */}
        <section>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>默认值：</span>
          </div>
          <div>{renderDefaultValue()}</div>
        </section>

        {/* 操作文案 */}
        <section>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>双滑块模式：</span>
          </div>
          <div>{renderOperationsSetting()}</div>
        </section>
      </Form>
    </div>
  );
}
