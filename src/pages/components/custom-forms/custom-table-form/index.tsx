import React, { useContext, useEffect, useRef, useState } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import customFormStyle from '@/pages/components/index.module.less';
import { Divider, Select, Typography } from 'antd';
import { Draggable, ExpandThin, Minus, Plus, PlusThin } from '@/components/icon';
import { generateSlotId } from '@/util';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { toJS } from 'mobx';
import { HighlightOutlined } from '@ant-design/icons';

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
    const { columns, dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const newColumns = (columns.value as ColumnInfo[]).filter(item => item.dataIndex !== dataIndex);
    (dataSource.value as Record<string, any>[]).map(item => {
      const result = { ...item };
      delete result[dataIndex];
      return result;
    });
    dslStore.updateComponentProps({ columns: newColumns, dataSource: dataSource.value });
    // 删除对应列的组件
    (dataSource.value as Record<string, any>[]).forEach((item, index) => {
      const componentId = generateSlotId(dslStore.selectedComponent.id, index, dataIndex);
      dslStore.deleteComponent(componentId);
    });
  }

  function handleSelectComponent(data: string, dataIndex: string) {
    if (!dslStore.selectedComponent) {
      return;
    }
    const { columns, dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const columnsCopy = toJS(columns.value);
    const columnIndex = (columnsCopy as ColumnInfo[]).findIndex(item => item.dataIndex === dataIndex);
    if (columnIndex > -1) {
      const column = columnsCopy[columnIndex];
      if ((dataSource?.value as Record<string, any>[])?.length) {
        // 删除原先的组件
        (dataSource.value as Record<string, any>[]).forEach((item, index) => {
          const tableCellId = generateSlotId(dslStore.selectedComponent.id, index, dataIndex);
          // BUG: 这里有撤销重做的问题
          dslStore.deleteComponent(tableCellId);
          dslStore.insertComponent(dslStore.selectedComponent.id, data, 'antd', 0, {
            customId: tableCellId
          });
        });
      }
      // 更新 configNames
      const newComponentConfigNames = [...componentConfigNames];
      newComponentConfigNames[columnIndex] = data;
      setComponentConfigNames(newComponentConfigNames);

      // 修改 column 的 render
      column.render = {
        current: '',
        configName: data,
        isText: false
      };
      dslStore.updateComponentProps({ columns: columnsCopy });
    }
  }

  function renderTheme() {
    return <div></div>;
  }

  function handleEditingColumnName(val: string, dataIndex: string) {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
    const { columns } = dslStore.dsl.props[component.id];
    const newColumnsCopy = toJS(columns.value) as ColumnInfo[];
    const column = newColumnsCopy.find(item => item.dataIndex === dataIndex);
    if (column) {
      column.title = val.trim() || column.title;
    }
    dslStore.updateComponentProps({ columns: newColumnsCopy });
  }

  function renderColumnSetting(columnInfo: ColumnInfo) {
    const { title, dataIndex, render } = columnInfo;
    const { configName } = render;
    switch (configName) {
      default:
        return (
          <div className={customFormStyle.config}>
            <span className={customFormStyle.hintText}>列名</span>
            <Typography.Text
              className={customFormStyle.textValue}
              editable={{
                icon: <HighlightOutlined />,
                tooltip: 'click to edit text',
                onChange: e => handleEditingColumnName(e, dataIndex),
                enterIcon: null
              }}
            >
              {title}
            </Typography.Text>
          </div>
        );
    }
  }

  function renderColumns() {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
    const { columns } = dslStore.dsl.props[component.id];
    return (columns.value as ColumnInfo[]).map((item, index) => {
      const { key, dataIndex } = item;

      return (
        <div className={customFormStyle.draggableFromItem} key={key}>
          <div className={customFormStyle.header}>
            <Draggable className={customFormStyle.draggableIcon} />
            <Select
              value={componentConfigNames[index]}
              placeholder="请选择"
              bordered={false}
              dropdownStyle={{ width: 140 }}
              onChange={e => handleSelectComponent(e, dataIndex)}
              suffixIcon={<ExpandThin style={{ pointerEvents: 'none' }} />}
            >
              <Select.Option value="Text">普通内容列</Select.Option>
              <Select.Option value="Amount">金额列</Select.Option>
              <Select.Option value="Tag">标签列</Select.Option>
              <Select.Option value="Switch">开关</Select.Option>
              <Select.Option value="HorizontalFlex">操作</Select.Option>
            </Select>
            <Minus className={customFormStyle.removeIcon} onClick={() => removeColumn(dataIndex)} />
          </div>
          {renderColumnSetting(item)}
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
            <span className={customFormStyle.hintText}>第{index + 1}行</span>
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
    const newColumns = [...toJS(columns.value as ColumnInfo[])];
    newColumns.push(newColumn as ColumnInfo);
    const newConfigNames = [...componentConfigNames, defaultComponentConfigName];
    setComponentConfigNames(newConfigNames);
    const newDataSource: Record<string, any>[] = (dataSource.value || []) as Record<string, any>[];
    newDataSource.forEach((row, index) => {
      (newColumns as ColumnInfo[]).forEach((column, i) => {
        if (!(column.dataIndex in row)) {
          const componentId = generateSlotId(tableComponent.id, index, column.dataIndex);
          if (!dslStore.dsl.componentIndexes[componentId]) {
            dslStore.insertComponent(dslStore.selectedComponent.id, newConfigNames[i], 'antd', 0, {
              customId: componentId
            });
          }
        }
      });
    });
    dslStore.updateComponentProps({ columns: newColumns }, tableComponent);
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
      dslStore.insertComponent(dslStore.selectedComponent.id, column.render.configName, 'antd', 0, {
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
          <span className={customFormStyle.title}>行</span>
          <Plus className={customFormStyle.addIcon} onClick={addRow} />
        </div>
        <div className={customFormStyle.draggableForm}>{renderRows()}</div>
      </>
    );
  }

  return (
    <div>
      {renderTheme()}
      <Divider className={customFormStyle.divider} />
      <div className={customFormStyle.addItem}>
        <span className={customFormStyle.title}>列</span>
        <Plus className={customFormStyle.addIcon} onClick={addColumn} />
      </div>
      <div className={customFormStyle.draggableForm}>{renderColumns()}</div>
      <Divider className={customFormStyle.divider} />
      {renderRowSetting()}
    </div>
  );
});
