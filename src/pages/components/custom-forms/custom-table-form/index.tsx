import React, { useContext, useEffect, useRef, useState } from 'react';

import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import customFormStyle from '@/pages/components/index.module.less';
import styles from './index.module.less';
import { Button, Divider, Form, Input, InputNumber, message, Modal, Select, Typography } from 'antd';
import { ExpandThin, Minus, Plus } from '@/components/icon';
import { generateSlotId } from '@/util';
import ComponentSchemaRef from '@/types/component-schema-ref';
import { toJS } from 'mobx';
import { HighlightOutlined } from '@ant-design/icons';
import { DndContext } from '@dnd-kit/core';
import { DragEndEvent } from '@dnd-kit/core/dist/types';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import SortableItem from '@/pages/components/sortable-item';
import { useForm } from 'antd/es/form/Form';
import AppSelect from '@/components/akali/app-select';
import InterfaceSelect from '@/components/akali/interface-select';
import NewFileManager from '@/service/new-file-manager';
import FieldModal from './field-modal';

type ColumnInfo = {
  key: string;
  dataIndex: string;
  title: string;
  render: ComponentSchemaRef[];
};

const defaultComponentConfigName = 'Text';

export default observer(function CustomTableForm() {
  const [componentConfigNames, setComponentConfigNames] = useState<string[]>([]);
  const [actionBtnCounts, setActionBtnCounts] = useState<number[]>([]);
  const [columnAdderOpen, setColumnAdderOpen] = useState<boolean>(false);
  const [fieldModalOpen, setFieldModalOpen] = useState<boolean>(false);
  const dslStore = useContext(DSLStoreContext);
  const [appId, setAppId] = useState<string>();

  const dataIndexesRef = useRef<string[]>([]);
  const titlesRef = useRef<string[]>([]);
  const [form] = useForm();

  useEffect(() => {
    if (dslStore?.selectedComponent) {
      const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
      const configNames = [];
      (columns.value as ColumnInfo[]).forEach((item, index) => {
        titlesRef.current.push(item.title);
        dataIndexesRef.current.push(item.dataIndex);
        configNames.push((item.render?.[0] as { configName: string })?.configName || defaultComponentConfigName);
        if (item.render?.[0]?.configName === 'HorizontalFlex') {
          actionBtnCounts[index] = dslStore.fetchComponentInDSL(item.render?.[0].current).children.length;
        } else {
          actionBtnCounts[index] = 1;
        }
      });
      setActionBtnCounts([...actionBtnCounts]);
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
      changeColumnForTable(columnIndex, {
        configName: data,
        dependency: dslStore.selectedComponent.dependency
      });
    }
  }

  function changeColumnForTable(columnIndex: number, newColumn: { configName: string; dependency: string }) {
    const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const columnsCp = toJS(columns.value);
    const column = columnsCp[columnIndex];
    column.render = column.render.map((item: { current: string; configName: string; isText: false }) => {
      dslStore.dangerousDeleteComponent(item.current);
      const newComponent = dslStore.createComponent(newColumn.configName, newColumn.dependency);
      if (newColumn.configName === 'HorizontalFlex') {
        dslStore.dangerousInsertComponent(newComponent.id, 'Button', newColumn.dependency);
      }
      return {
        configName: newComponent.configName,
        current: newComponent.id
      };
    });
    dslStore.updateComponentProps({ columns: columnsCp }, dslStore.selectedComponent);
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

  function changeActionButtonCount(count: number, index: number) {
    const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const columnsCp = toJS(columns.value);
    columnsCp[index].render.forEach(({ configName, current, isText }) => {
      const btnCount = dslStore.fetchComponentInDSL(current).children.length;
      const difference = Math.abs(count - btnCount);
      if (count > btnCount) {
        const componentConfig = new Array(difference).fill({
          name: 'Button',
          dependency: dslStore.selectedComponent.dependency
        });
        dslStore.insertComponentsInBatch(current, componentConfig);
      } else if (count < btnCount) {
        dslStore.deleteComponentsInBatch(current, -1, difference);
      }
    });
    actionBtnCounts[index] = count;
    setActionBtnCounts([...actionBtnCounts]);
  }

  function renderColumnSetting(columnInfo: ColumnInfo, index: number) {
    const { title, dataIndex, render } = columnInfo;
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
    const configName = componentConfigNames[index];
    switch (configName) {
      case 'HorizontalFlex':
        tpl.push(
          <div key="2" className={customFormStyle.config}>
            <span className={customFormStyle.hintText}>操作个数</span>
            <InputNumber
              value={actionBtnCounts[index]}
              min={1}
              onPressEnter={e => {
                (e.target as HTMLElement).blur();
              }}
              onBlur={e => {
                changeActionButtonCount(+e.target.value, index);
              }}
            />
          </div>
        );
        break;
    }
    return tpl;
  }

  function handleSortingColumns(e: DragEndEvent) {
    const { over, active } = e;
    if (over.id === active.id) {
      return;
    }
    const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const columnsCp = toJS(columns.value);

    const activeIndex = (columnsCp as ColumnInfo[]).findIndex(item => item.key === (active.id as string));
    const overIndex = (columnsCp as ColumnInfo[]).findIndex(item => item.key === (over?.id as string));

    setActionBtnCounts(arrayMove(actionBtnCounts, activeIndex, overIndex));
    setComponentConfigNames(arrayMove(componentConfigNames, activeIndex, overIndex));

    dslStore.updateComponentProps({
      columns: arrayMove(columnsCp as ColumnInfo[], activeIndex, overIndex)
    });
  }

  function handleSortingRows(e: DragEndEvent) {
    const { over, active } = e;
    if (over.id === active.id) {
      return;
    }
    const { dataSource, columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const dataSourceCp = toJS(dataSource.value);
    const columnsCp = toJS(columns.value);

    const activeIndex = (dataSourceCp as Record<string, any>[]).findIndex(item => item.key === (active.id as string));
    const overIndex = (dataSourceCp as Record<string, any>[]).findIndex(item => item.key === (over?.id as string));

    const afterSwap = arrayMove(dataSourceCp as ColumnInfo[], activeIndex, overIndex);

    (columnsCp as ColumnInfo[]).forEach(col => {
      col.render = arrayMove(col.render, activeIndex, overIndex);
    });

    dslStore.updateComponentProps({
      dataSource: afterSwap,
      columns: columnsCp
    });
  }

  function renderColumns() {
    const component = dslStore.selectedComponent;
    if (!component) {
      return null;
    }
    const { columns } = dslStore.dsl.props[component.id];

    return (
      <SortableContext items={(columns.value as ColumnInfo[]).map(item => item.key)}>
        {(columns.value as ColumnInfo[]).map((item, index) => {
          const { key, dataIndex } = item;

          return (
            <SortableItem key={key} id={key} footer={renderColumnSetting(item, index)}>
              {
                <>
                  <Select
                    value={componentConfigNames[index]}
                    placeholder="请选择"
                    variant="borderless"
                    onChange={e => handleSelectComponent(e, dataIndex)}
                    suffixIcon={<ExpandThin style={{ pointerEvents: 'none' }} />}
                    styles={{
                      popup: {
                        root: { width: 140 }
                      }
                    }}
                  >
                    <Select.Option value="Text">普通内容列</Select.Option>
                    <Select.Option value="Amount">金额列</Select.Option>
                    <Select.Option value="Tag">标签列</Select.Option>
                    <Select.Option value="Switch">开关</Select.Option>
                    <Select.Option value="HorizontalFlex">操作</Select.Option>
                  </Select>
                  <Minus className={customFormStyle.removeIcon} onClick={() => removeColumn(dataIndex)} />
                </>
              }
            </SortableItem>
          );
        })}
      </SortableContext>
    );
  }

  function removeRow(index: number) {
    const { columns, dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const columnsCp = toJS(columns.value);
    (columnsCp as ColumnInfo[]).forEach(col => {
      col.render.splice(index, 1);
    });
    const dataSourceCopy = toJS(dataSource.value);
    (dataSourceCopy as Record<string, any>[]).splice(index, 1);
    dslStore.updateComponentProps({ columns: columnsCp, dataSource: dataSourceCopy });
  }

  function renderRows() {
    // 这里要通过 dslStore 中的具体值进行渲染
    const { dataSource } = dslStore.dsl.props[dslStore.selectedComponent.id];
    if (!dataSource?.value) {
      return null;
    }

    return (
      <SortableContext items={(dataSource.value as Record<string, any>[]).map(item => item.key)}>
        {(dataSource.value as Record<string, any>[]).map((item, index) => {
          const { key } = item;
          return (
            <SortableItem key={key} id={key} footer={null}>
              {
                <div className={customFormStyle.draggableFromItem} key={index}>
                  <div className={customFormStyle.header}>
                    <span className={customFormStyle.hintText}>第{index + 1}行</span>
                    <Minus className={customFormStyle.removeIcon} onClick={() => removeRow(index)} />
                  </div>
                </div>
              }
            </SortableItem>
          );
        })}
      </SortableContext>
    );
  }

  function generateNewTitle() {
    let nameSuffix = 1;
    const namePrefix = '字段';
    let nameExists = titlesRef.current.some(item => item === `${namePrefix}${nameSuffix}`);
    while (nameExists) {
      nameSuffix++;
      nameExists = titlesRef.current.some(item => item === `${namePrefix}${nameSuffix}`);
    }
    const newFieldName = `${namePrefix}${nameSuffix}`;
    titlesRef.current.push(newFieldName);
    return newFieldName;
  }

  function addColumn(
    opt: {
      dataIndex: string;
      title: string;
    } = undefined
  ) {
    const tableComponent = dslStore.selectedComponent;
    const dataIndex = opt?.dataIndex || generateNewDataIndex();
    const newColumn = {
      key: dataIndex,
      dataIndex: dataIndex,
      title: opt?.title || generateNewTitle(),
      render: []
    };

    const { columns, dataSource } = dslStore.dsl.props[tableComponent.id];
    const newColumns = [...toJS(columns.value as ColumnInfo[])];
    if (newColumns.length > 0) {
      for (let i = 0; i < newColumns[0].render.length; i++) {
        const component = dslStore.createComponent(defaultComponentConfigName, dslStore.selectedComponent.dependency);
        if (component.configName === 'HorizontalFlex') {
          dslStore.dangerousInsertComponent(component.id, 'Button', component.dependency);
        }
        newColumn.render.push({
          configName: component.configName,
          current: component.id,
          isText: false
        });
      }
    }

    newColumns.push(newColumn as ColumnInfo);
    const newConfigNames = [...componentConfigNames, defaultComponentConfigName];
    setComponentConfigNames(newConfigNames);
    const newDataSource: Record<string, any>[] = toJS(dataSource.value || []) as Record<string, any>[];
    newDataSource.forEach(item => {
      item[newColumn.dataIndex] = '默认字段值';
    });
    dslStore.updateComponentProps({ columns: newColumns });
    // 无脑加一个操作按钮计数
    actionBtnCounts.push(1);
    setActionBtnCounts([...actionBtnCounts]);
  }

  async function addColumnInBatch() {
    const formValues = form.getFieldsValue();
    const columnsInfo = await resolveColumnsInfo(
      (formValues.columnNames?.split(/\s+/) || []).filter(col => !!col),
      formValues.interface?.key
    );
    if (!columnsInfo) {
      return;
    }
    columnsInfo.forEach(col => {
      addColumn(col);
    });
    closeColumnAdder();
  }

  /**
   * 解析列信息
   */
  async function resolveColumnsInfo(columnNames: string[], interfaceId: string) {
    const columnInfo = [];
    const data = await NewFileManager.fetchInterfacesDetail(interfaceId);
    console.log('addColumnInBatch: ', data);

    if (!data) {
      message.error('接口定义不存在或出现网络问题，请稍候重试或联系管理员');
      return;
    }

    let dataIndexDict: Record<string, { description: string; [key: string]: string }> = {};
    // 以下逻辑基于对后端返回数据的结构进行的约定式解析，如果接口结构发生变化，则以下代码失效
    if (data.type === 'object') {
      dataIndexDict = data.properties?.list?.items?.properties;
    } else if (data.type === 'array') {
      dataIndexDict = data.items?.properties;
    }
    const dataIndexArr = Object.entries(dataIndexDict).map(([key, val]: [string, { description: string }]) => {
      return { dataIndex: key, description: val.description };
    });
    for (let i = 0, l = columnNames.length; i < l; i++) {
      const columnName = columnNames[i];
      const result = dataIndexArr.find(item => item.description.indexOf(columnName) >= 0);
      if (result) {
        // 去重，如果以前已经加过相同 dataIndex 的，跳过当前
        const existing = dataIndexesRef.current.some(ref => ref === result.dataIndex);
        if (!existing) {
          columnInfo.push({
            title: columnName,
            dataIndex: result.dataIndex
          });
          // 把自定义的 dataIndex 加入到 dataIndexesRef 里边
          dataIndexesRef.current.push(result.dataIndex);
        }
      } else {
        columnInfo.push({
          title: columnName,
          dataIndex: generateNewDataIndex()
        });
      }
    }
    return columnInfo;
  }

  function openColumnAdder() {
    setColumnAdderOpen(true);
  }

  function closeColumnAdder() {
    setColumnAdderOpen(false);
  }

  function handleChangingAppId(appId: string) {
    console.log('handleChangingAppId：', appId);
    setAppId(appId);
    return appId;
  }

  function addRow() {
    const tableComponent = dslStore.selectedComponent;
    const { columns, dataSource } = dslStore.dsl.props[tableComponent.id];
    const newDataSource = toJS(dataSource.value) || [];
    const rowKey = (newDataSource as ColumnInfo[]).length;
    const newRow = {
      key: rowKey
    };
    (columns.value as ColumnInfo[]).forEach(column => {
      newRow[column.dataIndex] = '默认字段值';
    });
    const newColumns = (columns.value as ColumnInfo[]).map((column, index) => {
      const cp = toJS(column);
      const configName = componentConfigNames[index];
      const component = dslStore.createComponent(configName, dslStore.selectedComponent.dependency);
      if (component.configName === 'HorizontalFlex') {
        const componentConfig = new Array(actionBtnCounts[index]).fill({
          name: 'Button',
          dependency: dslStore.selectedComponent.dependency
        });
        dslStore.insertComponentsInBatch(component.id, componentConfig);
      }
      cp.render.push({ configName, isText: false, current: component.id });
      return cp;
    });

    (newDataSource as Record<string, any>[]).push(newRow);
    dslStore.updateComponentProps({ dataSource: newDataSource, columns: newColumns });
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
        <div>
          <Plus className={customFormStyle.addIcon} onClick={() => addColumn()} />
          <Button className={styles.ml5} type="default" onClick={openColumnAdder}>
            批量添加
          </Button>
          <Button className={styles.ml5} type="default" onClick={() => setFieldModalOpen(true)}>
            字段维护
          </Button>
        </div>
      </div>
      <DndContext onDragEnd={handleSortingColumns}>
        <div className={customFormStyle.draggableForm}>{renderColumns()}</div>
      </DndContext>
      <Divider className={customFormStyle.divider} />
      <DndContext onDragEnd={handleSortingRows}>{renderRowSetting()}</DndContext>
      <Modal
        open={columnAdderOpen}
        title="批量添加字段"
        onCancel={closeColumnAdder}
        onOk={addColumnInBatch}
      >
        <Form form={form}>
          <Form.Item name="columnNames" label="批量字段">
            <Input.TextArea
              placeholder="请从 PRD 复制多行字段，Voltron 会自动解析"
              styles={{ textarea: { height: 200 } }}
            />
          </Form.Item>
          <Divider plain>字段自动匹配（可选）</Divider>
          <Form.Item name="appId" label="App" getValueFromEvent={handleChangingAppId}>
            <AppSelect />
          </Form.Item>
          <Form.Item name="interface" label="接口">
            <InterfaceSelect appId={appId} />
          </Form.Item>
        </Form>
      </Modal>
      {/* 字段信息浮层 */}
      <FieldModal open={fieldModalOpen} onClose={() => setFieldModalOpen(false)}></FieldModal>
    </div>
  );
});
