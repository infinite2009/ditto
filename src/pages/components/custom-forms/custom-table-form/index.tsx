import React, { useContext, useEffect, useRef } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import customFormStyle from '@/pages/components/index.module.less';
import { Select, Typography } from 'antd';
import { ExpandThin, Minus, PlusThin } from '@/components/icon';

type ComponentRef = {
  current: string;
  isText: boolean;
};

type ColumnInfo = {
  key: string;
  dataIndex: string;
  title: string;
  render: { current: string; isText: boolean };
};

export default observer(function CustomTableForm() {
  const dslStore = useContext(DSLStoreContext);

  const dataIndexesRef = useRef<string[]>([]);
  const titlesRef = useRef<string[]>([]);

  useEffect(() => {
    if (dslStore?.selectedComponent) {
      const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
      (columns.value as ColumnInfo[]).forEach(item => {
        titlesRef.current.push(item.title);
        dataIndexesRef.current.push(item.dataIndex);
      });
    }
  }, []);

  function removeColumn(dataIndex: string) {
    if (!dslStore.selectedComponent) {
      return;
    }
    const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const renderComponent = (columns.value as ColumnInfo[]).find(item => item.dataIndex === dataIndex);
    if (renderComponent?.render) {
      dslStore.deleteComponent(renderComponent.render.current);
    }
  }

  function handleSelectComponent(data: string, dataIndex: string) {
    if (!dslStore.selectedComponent) {
      return;
    }
    const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const index = (columns.value as ColumnInfo[]).findIndex(item => item.dataIndex === dataIndex);
    if (index >= 0) {
      const newRenderComponent = dslStore.createComponent(data, 'antd');
      columns.value[index].render = {
        current: newRenderComponent.id,
        isText: false
      };
    }
  }

  function renderTheme() {
    return <div></div>;
  }

  function renderColumns() {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
    if (!component?.children) {
      return null;
    }
    const { columns } = dslStore.dsl.props[component.id];
    return (columns.value as ColumnInfo[]).map(item => {
      const { key, dataIndex, title, render } = item;

      const renderComponent = dslStore.dsl.componentIndexes[render.current];
      return (
        <div className={customFormStyle.draggableFromItem} key={key}>
          <div className={customFormStyle.header}>
            <span>*</span>
            <Select
              value={renderComponent.configName}
              placeholder="请选择"
              bordered={false}
              dropdownStyle={{ width: 140 }}
              onChange={e => handleSelectComponent(e, dataIndex)}
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
            <Minus className={customFormStyle.removeIcon} onClick={() => removeColumn(dataIndex)} />
          </div>
          <div className={customFormStyle.config}>
            <span>提示词</span>
            <Typography.Text>{title}</Typography.Text>
          </div>
        </div>
      );
    });
  }

  function renderRows() {
    // 这里要通过 dslStore 中的具体值进行渲染
    return <div></div>;
  }

  function generateNewTitle() {
    let nameSuffix = 1;
    const namePrefix = 'name';
    let nameExists = titlesRef.current.some(item => item === `${namePrefix}${nameSuffix}`);
    while (nameExists) {
      nameSuffix++;
      nameExists = titlesRef.current.some(item => item === `${namePrefix}${nameSuffix}`);
    }
    const newFieldName = `${namePrefix}${nameSuffix}`;
    fieldNamesRef.current.push(newFieldName);
    return newFieldName;
  }

  function addColumn() {
    const newTitle = generateNewTitle();
    const newDataIndex = generateNewDataIndex();
    const newRenderComponent = dslStore.createComponent(data, 'antd');
    const newColumn = {
      key: newDataIndex,
      dataIndex: newDataIndex,
      render: {
        current: newRenderComponent.id,
        isText: false
      }
    };

    dslStore.updateComponentProps({ name: newTitle, label: newDataIndex }, formItem);
    if (formItem) {
      dslStore.insertComponent(formItem.id, 'Input', 'antd');
    }
  }

  function generateNewDataIndex() {
    let labelSuffix = 1;
    const labelPrefix = '字段';
    let nameExists = dataIndexesRef.current.some(item => item === `${labelPrefix}${labelSuffix}`);
    while (nameExists) {
      labelSuffix++;
      nameExists = dataIndexesRef.current.some(item => item === `${labelPrefix}${labelSuffix}`);
    }
    const newLabelName = `${labelPrefix}${labelSuffix}`;
    dataIndexesRef.current.push(newLabelName);
    return newLabelName;
  }

  return (
    <div>
      {renderTheme()}
      <div className={customFormStyle.addItem}>
        <span className={customFormStyle.title}>表单项</span>
        <PlusThin className={customFormStyle.addIcon} onClick={addColumn} />
      </div>
      <div className={customFormStyle.draggableForm}>{renderColumns()}</div>
      {renderRows()}
    </div>
  );
});
