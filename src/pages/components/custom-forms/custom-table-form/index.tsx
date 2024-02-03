import React, { useContext, useEffect, useRef, useState } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import customFormStyle from '@/pages/components/index.module.less';
import { Divider, InputNumber, Select, Typography } from 'antd';
import { Draggable, ExpandThin, Minus, Plus } from '@/components/icon';
import { generateSlotId } from '@/util';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { toJS } from 'mobx';
import { HighlightOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid';

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
    const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const columnsCopy = toJS(columns.value);
    const columnIndex = (columnsCopy as ColumnInfo[]).findIndex(item => item.dataIndex === dataIndex);
    if (columnIndex > -1) {
      // 更新 configNames
      const newComponentConfigNames = [...componentConfigNames];
      newComponentConfigNames[columnIndex] = data;
      setComponentConfigNames(newComponentConfigNames);
      // 删除原先的组件，然后再插入新组件
      dslStore.changeColumnForTable(
        dslStore.selectedComponent.id,
        columnIndex,
        { configName: data, dependency: 'antd' },
        () => {
          dslStore.updateComponentProps({ columns: columnsCopy });
        }
      );
      console.log('change component: ', toJS(dslStore.dsl));
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

  function changeActionButtonCount(count: number, columnInfo: ColumnInfo) {
    const columnTemplate = dslStore.dsl.componentIndexes[columnInfo.render.current];
    const difference = Math.abs(count - columnTemplate.children.length);
    const { dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    if (count > columnTemplate.children.length) {
      for (let i = 0; i < difference; i++) {
        dslStore.insertComponent(columnTemplate.id, 'Button', 'antd');
        // 为对应列增加按钮
        ((dataSource.value || []) as Record<string, any>[]).forEach((item, index) => {
          const tableCellId = generateSlotId(dslStore.selectedComponent.id, index, columnInfo.dataIndex);
          dslStore.insertComponent(tableCellId, 'Button', 'antd');
        });
      }
    } else if (count < columnTemplate.children.length) {
      const currentCount = columnTemplate.children.length;
      for (let i = currentCount - 1; i > count - 1; i--) {
        dslStore.deleteComponent(columnTemplate.children[i].current);
        // 为对应列删除按钮
        (dataSource.value as Record<string, any>[]).forEach((item, index) => {
          const tableCellId = generateSlotId(dslStore.selectedComponent.id, index, columnInfo.dataIndex);
          const tableCell = dslStore.dsl.componentIndexes[tableCellId];
          if (tableCell) {
            dslStore.deleteComponent(tableCell.children[i].current);
          }
        });
      }
      console.log('删除后还有多少节点：', toJS(dslStore.dsl));
    }
  }

  function renderColumnSetting(columnInfo: ColumnInfo) {
    const { title, dataIndex, render } = columnInfo;
    const { configName } = render;
    const tpl = [
      <div key="1" className={customFormStyle.config}>
        <span className={customFormStyle.hintText}>表头</span>
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
    ];
    switch (configName) {
      case 'HorizontalFlex':
        // eslint-disable-next-line no-case-declarations
        const columnTemplate = dslStore.dsl.componentIndexes[columnInfo.render.current];
        tpl.push(
          <div key="2" className={customFormStyle.config}>
            <span className={customFormStyle.hintText}>操作个数</span>
            <InputNumber
              value={columnTemplate.children.length}
              onPressEnter={e => {
                (e.target as HTMLElement).blur();
              }}
              onBlur={e => {
                changeActionButtonCount(+e.target.value, columnInfo);
              }}
            />
          </div>
        );
        break;
    }
    return tpl;
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
    const { dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const dataSourceCopy = toJS(dataSource.value);
    (dataSourceCopy as Record<string, any>[]).splice(index, 1);
    dslStore.deleteRowForTable(dslStore.selectedComponent.id, index, () => {
      dslStore.updateComponentProps({ dataSource: dataSourceCopy });
    });
    console.log('Removed row：', toJS(dslStore.dsl));
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
    const templateId = nanoid();
    const dataIndex = generateNewDataIndex();
    const newColumn = {
      key: dataIndex,
      dataIndex: dataIndex,
      title: generateNewTitle(),
      render: {
        configName: defaultComponentConfigName,
        current: templateId,
        isText: false
      }
    };

    const { columns, dataSource } = dslStore.dsl.props[tableComponent.id];
    const newColumns = [...toJS(columns.value as ColumnInfo[])];
    newColumns.push(newColumn as ColumnInfo);
    const newConfigNames = [...componentConfigNames, defaultComponentConfigName];
    setComponentConfigNames(newConfigNames);
    const newDataSource: Record<string, any>[] = (dataSource.value || []) as Record<string, any>[];
    newDataSource.forEach(item => {
      item[newColumn.dataIndex] = '默认字段值';
    });
    dslStore.insertColumnForTable(
      { configName: defaultComponentConfigName, dependency: 'antd' },
      tableComponent.id,
      -1,
      () => {
        dslStore.updateComponentProps({ columns: newColumns }, tableComponent);
      }
    );
    console.log('add column: ', toJS(dslStore.dsl));
  }

  function addRow() {
    const tableComponent = dslStore.selectedComponent;
    const { columns, dataSource } = dslStore.dsl.props[tableComponent.id];
    const newDataSource = toJS(dataSource.value) || [];
    const rowKey = (newDataSource as ColumnInfo[]).length;
    const newRow = {
      key: rowKey
    };
    const columnConfig = [];
    (columns.value as ColumnInfo[]).forEach(column => {
      newRow[column.dataIndex] = '默认字段值';
      columnConfig.push({ configName: column.render.configName, dependency: 'antd' });
    });
    (newDataSource as Record<string, any>[]).push(newRow);
    dslStore.insertRowForTable(columnConfig, tableComponent.id, () => {
      dslStore.updateComponentProps({ dataSource: newDataSource }, tableComponent);
    });
    console.log('add row: ', toJS(dslStore.dsl));
  }

  function generateNewDataIndex() {
    let labelSuffix = 1;
    const labelPrefix = 'field';
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
