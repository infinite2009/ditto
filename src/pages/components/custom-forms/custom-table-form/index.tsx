import React, { useContext, useEffect, useRef, useState } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import customFormStyle from '@/pages/components/index.module.less';
import { Select, Typography } from 'antd';
import { ExpandThin, Minus, PlusThin } from '@/components/icon';
import { generateSlotId } from '@/util';
import ComponentSchemaRef from '@/types/component-schema-ref';

type ColumnInfo = {
  key: string;
  dataIndex: string;
  title: string;
  render: ComponentSchemaRef;
};

const defaultComponentConfigName = 'Text';

export default observer(function CustomTableForm() {
  const [componentConfigNames, setComponentConfigNames] = useState<string[]>([]);

  const dslStore = useContext(DSLStoreContext);

  const dataIndexesRef = useRef<string[]>([]);
  const titlesRef = useRef<string[]>([]);

  useEffect(() => {
    if (dslStore?.selectedComponent) {
      const { columns, dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
      const configNames = [];
      (columns.value as ColumnInfo[]).forEach(item => {
        titlesRef.current.push(item.title);
        dataIndexesRef.current.push(item.dataIndex);
        configNames.push((item.render as { configName: string }).configName);
      });
      setComponentConfigNames(configNames);
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
      const newRenderComponent = dslStore.insertComponent(dslStore.selectedComponent.id, data, 'antd');
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
    const { columns } = dslStore.dsl.props[component.id];
    return (columns.value as ColumnInfo[]).map((item, index) => {
      const { key, dataIndex, title } = item;

      return (
        <div className={customFormStyle.draggableFromItem} key={key}>
          <div className={customFormStyle.header}>
            <span>*</span>
            <Select
              value={componentConfigNames[index]}
              placeholder="请选择"
              bordered={false}
              dropdownStyle={{ width: 140 }}
              onChange={e => handleSelectComponent(e, dataIndex)}
              suffixIcon={<ExpandThin style={{ pointerEvents: 'none' }} />}
            >
              <Select.Option value="Text">普通文本</Select.Option>
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

  function removeRow(index: number) {
    const { rows } = dslStore.dsl.props[dslStore.selectedComponent.id];
    (rows.value as Record<string, any>[]).splice(index, 1);
    dslStore.updateComponentProps({ rows: rows.value });
  }

  function renderRows() {
    // 这里要通过 dslStore 中的具体值进行渲染
    const { dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    if (!dataSource?.value) {
      return null;
    }
    return (dataSource.value as Record<string, any>[]).map((item, index) => {
      return (
        <div className={customFormStyle.draggableFromItem} key={index}>
          <div className={customFormStyle.header}>
            <span>第{index + 1}行</span>
            <Minus className={customFormStyle.removeIcon} onClick={() => removeRow(index)} />
          </div>
        </div>
      );
    });
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
    titlesRef.current.push(newFieldName);
    return newFieldName;
  }

  function addColumn() {
    const tableComponent = dslStore.selectedComponent;
    const newTitle = generateNewTitle();
    const newDataIndex = generateNewDataIndex();
    const newColumn = {
      key: newDataIndex,
      dataIndex: newDataIndex,
      title: newTitle,
      render: {
        configName: defaultComponentConfigName
      }
    };

    const { columns, dataSource } = dslStore.dsl.props[tableComponent.id];
    (columns.value as ColumnInfo[]).push(newColumn as ColumnInfo);
    setComponentConfigNames([...componentConfigNames, defaultComponentConfigName]);
    dataSource.value = dataSource.value || [];
    (dataSource.value as Record<string, any>[]).forEach((row, index) => {
      (columns.value as ColumnInfo[]).forEach((column, i) => {
        if (!row[column.dataIndex]) {
          const componentId = generateSlotId(tableComponent.id, index, column.dataIndex);
          if (!dslStore.dsl.componentIndexes[componentId]) {
            dslStore.insertComponent(dslStore.selectedComponent.id, componentConfigNames[i], 'antd', 0, {
              customId: componentId
            });
          }
        }
      });
    });
    dslStore.updateComponentProps({ columns: columns.value }, tableComponent);
  }

  function addRow() {
    const tableComponent = dslStore.selectedComponent;
    const { columns, dataSource } = dslStore.dsl.props[tableComponent.id];
    dataSource.value = dataSource.value || [];
    const rowKey = (dataSource.value as ColumnInfo[]).length;
    const newRow = {
      key: rowKey
    };
    (columns.value as ColumnInfo[]).forEach(column => {
      newRow[column.dataIndex] = '默认字段值';
      dslStore.insertComponent(dslStore.selectedComponent.id, defaultComponentConfigName, 'antd', 0, {
        customId: generateSlotId(tableComponent.id, rowKey, column.dataIndex)
      });
    });
    (dataSource.value as Record<string, any>[]).push(newRow);
    dslStore.updateComponentProps({ rows: dataSource.value }, tableComponent);
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

  function renderRowSetting() {
    if (!dslStore.selectedComponent) {
      return null;
    }
    const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    if (!(columns.value as ColumnInfo[])?.length) {
      return null;
    }
    return (
      <>
        <div className={customFormStyle.addItem}>
          <span className={customFormStyle.title}>行数据</span>
          <PlusThin className={customFormStyle.addIcon} onClick={addRow} />
        </div>
        <div className={customFormStyle.draggableForm}>{renderRows()}</div>
      </>
    );
  }

  return (
    <div>
      {renderTheme()}
      <div className={customFormStyle.addItem}>
        <span className={customFormStyle.title}>表单项</span>
        <PlusThin className={customFormStyle.addIcon} onClick={addColumn} />
      </div>
      <div className={customFormStyle.draggableForm}>{renderColumns()}</div>
      {renderRowSetting()}
    </div>
  );
});
