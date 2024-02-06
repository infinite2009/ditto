import React, { useContext, useEffect, useRef } from 'react';
import { Select, Typography } from 'antd';
import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';
import { Draggable, ExpandThin, Minus, PlusThin } from '@/components/icon';
import IComponentSchema from '@/types/component.schema';
import { ComponentId } from '@/types';

import customFormStyle from '../../index.module.less';
import { HighlightOutlined } from '@ant-design/icons';

export default observer(function CustomFormForm() {
  const dslStore = useContext(DSLStoreContext);

  const fieldNamesRef = useRef<string[]>([]);
  const fieldLabelsRef = useRef<string[]>([]);

  useEffect(() => {
    if (dslStore?.selectedComponent) {
      const propsDict = dslStore.dsl.props;
      dslStore.selectedComponent.children?.forEach(item => {
        fieldLabelsRef.current.push(propsDict[item.current].label.value as string);
        fieldNamesRef.current.push(propsDict[item.current].name.value as string);
      });
    }
  }, []);

  function handleSelectComponent(data: string, component: IComponentSchema) {
    dslStore.replaceChild(component.id, 0, data, 'antd');
  }
  function removeFormItem(id: ComponentId) {
    dslStore.deleteComponent(id);
  }

  /**
   * 编辑表单项名称
   */
  function handleEditingFormItemName(val: string, index: number) {
    const form = dslStore.dsl.componentIndexes[dslStore.selectedComponent.id];
    const formItem = dslStore.dsl.componentIndexes[form.children[index].current];
    if (val.trim()) {
      dslStore.updateComponentProps({ label: val.trim() }, formItem);
    }
  }

  function renderFormItems() {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
    const { componentIndexes } = dslStore.dsl;
    if (!component?.children) {
      return null;
    }
    const formItems = component.children.map(item => {
      return componentIndexes[item.current];
    });
    return formItems.map((item, index) => {
      const { label, name } = dslStore.dsl.props[item.id];
      const childRef = item.children[0];
      const childComponent = childRef ? componentIndexes[childRef.current] : null;
      return (
        <div className={customFormStyle.draggableFromItem} key={name.value as string}>
          <div className={customFormStyle.header}>
            <Draggable />
            <Select
              value={childComponent?.configName}
              placeholder="请选择"
              bordered={false}
              dropdownStyle={{ width: 140 }}
              onChange={e => handleSelectComponent(e, item)}
              suffixIcon={<ExpandThin style={{ pointerEvents: 'none' }} />}
            >
              <Select.Option value="Input">普通输入框</Select.Option>
              <Select.Option value="Input.Password">密码输入框</Select.Option>
              <Select.Option value="Select">下拉选择器</Select.Option>
              <Select.Option value="Cascader">级联选择器</Select.Option>
              <Select.Option value="DatePicker">日期选择器</Select.Option>
              <Select.Option value="RangePicker">时间范围选择器</Select.Option>
              <Select.Option value="Radio">单选按钮</Select.Option>
              <Select.Option value="Checkbox">复选框</Select.Option>
              <Select.Option value="Switch">开关</Select.Option>
            </Select>
            <Minus className={customFormStyle.removeIcon} onClick={() => removeFormItem(item.id)} />
          </div>
          <div className={customFormStyle.config}>
            <span>表单项名</span>
            <Typography.Text
              className={customFormStyle.textValue}
              editable={{
                icon: <HighlightOutlined />,
                tooltip: 'click to edit text',
                onChange: text => handleEditingFormItemName(text, index),
                enterIcon: null
              }}
            >
              {label.value as string}
            </Typography.Text>
          </div>
        </div>
      );
    });
  }

  function addFormItem() {
    // 创建 form item
    const formItem = dslStore.insertComponent(dslStore.selectedComponent.id, 'FormItem', 'antd');
    // 更新它的 name
    const newFieldName = generateNewFieldName();
    const newLabelName = generateNewLabelName();
    dslStore.updateComponentProps({ name: newFieldName, label: newLabelName }, formItem);
    if (formItem) {
      dslStore.insertComponent(formItem.id, 'Input', 'antd');
    }
  }

  function generateNewFieldName() {
    let nameSuffix = 1;
    const namePrefix = 'name';
    let nameExists = fieldNamesRef.current.some(item => item === `${namePrefix}${nameSuffix}`);
    while (nameExists) {
      nameSuffix++;
      nameExists = fieldNamesRef.current.some(item => item === `${namePrefix}${nameSuffix}`);
    }
    const newFieldName = `${namePrefix}${nameSuffix}`;
    fieldNamesRef.current.push(newFieldName);
    return newFieldName;
  }

  function generateNewLabelName() {
    let labelSuffix = 1;
    const labelPrefix = '字段';
    let nameExists = fieldLabelsRef.current.some(item => item === `${labelPrefix}${labelSuffix}`);
    while (nameExists) {
      labelSuffix++;
      nameExists = fieldLabelsRef.current.some(item => item === `${labelPrefix}${labelSuffix}`);
    }
    const newLabelName = `${labelPrefix}${labelSuffix}`;
    fieldLabelsRef.current.push(newLabelName);
    return newLabelName;
  }

  return (
    <div className={customFormStyle.form}>
      <div className={customFormStyle.addItem}>
        <span className={customFormStyle.title}>表单项</span>
        <PlusThin className={customFormStyle.addIcon} onClick={addFormItem} />
      </div>
      <div className={customFormStyle.draggableForm}>{renderFormItems()}</div>
    </div>
  );
});
