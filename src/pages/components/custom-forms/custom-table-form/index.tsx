import React, { useContext, useEffect, useRef } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import customFormStyle from '@/pages/components/index.module.less';
import { Select, Typography } from 'antd';
import { ExpandThin, Minus } from '@/components/icon';
import IComponentSchema from '@/types/component.schema';
import { ComponentId } from '@/types';

export default observer(function CustomTableForm() {
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

  function generateDefaultColumn() {
    return {
      title: '默认字段',
      defaultValue: '',
      componentName: 'Input',
      useSort: false,
      useFilter: false
    };
  }

  function removeFormItem(id: ComponentId) {
    dslStore.deleteComponent(id);
  }

  function handleSelectComponent(data: string, component: IComponentSchema) {
    dslStore.replaceChild(component.id, 0, data, 'antd');
  }

  function renderTheme() {
    return <div></div>;
  }

  function renderColumns() {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
    const { componentIndexes } = dslStore.dsl;
    if (!component?.children) {
      return null;
    }
    const columns = component.children.map(item => {
      return componentIndexes[item.current];
    });
    return columns.map(item => {
      const { name, label } = dslStore.dsl.props[item.id];
      const childRef = item.children[0];
      const childComponent = childRef ? componentIndexes[childRef.current] : null;
      return (
        <div className={customFormStyle.draggableFromItem} key={name.value as string}>
          <div className={customFormStyle.header}>
            <span>*</span>
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
            <span>提示词</span>
            <Typography.Text>{name.value as string}</Typography.Text>
          </div>
        </div>
      );
    });
  }

  function renderRows() {
    return <div></div>;
  }

  return (
    <div>
      {renderTheme()}
      {renderColumns()}
      {renderRows()}
    </div>
  );
});
