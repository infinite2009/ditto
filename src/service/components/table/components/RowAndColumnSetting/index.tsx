import { EditPencil, Plus, Trash } from '@/components/icon';
import { DSLStoreContext } from '@/hooks/context';
import SortableItem from '@/pages/components/sortable-item';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { Button, Col, Divider, Flex, Form, Input, message, Modal, Row, Space, Tooltip } from 'antd';
import { toJS } from 'mobx';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './index.module.less';
import type { FieldValue as TableFormFieldValue } from '../../form/CustomTableForm';
import { Column, DataItem } from '../../form/CustomTableForm';
import type { ColumnFormProps, FieldValue } from './ColumnFormModal';
import ColumnFormModal from './ColumnFormModal';
import { cloneDeep, isEqual } from 'lodash';
import FormInput from '@/pages/editor/form-panel/basic-form/form-input';
import FormSelect from '@/pages/editor/form-panel/basic-form/form-select';
import { RenderType, RenderTypeEnum } from '../../types';
import { DEFAULT_COMPONENT_CONFIG_NAME, OPERATE_COMPONENT_CONFIG_NAME, renderOptions } from '../../const';
import { useComponent } from '../../hooks/useComponent';
import { observer } from 'mobx-react';
import DataForm, { DataFormProps } from './DataForm';
import { nanoid } from 'nanoid';
import DraggableTree, { DraggableTreeProps } from '@/pages/components/draggable-tree';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import {
  addNodeByIndices,
  deleteNode,
  findKeyIndices,
  findNodeByIndices,
  findNodeByKey,
  removeNodeByIndices,
  updateNodeByIndices
} from '@/pages/components/draggable-tree/utils';
import AppSelect from '@/components/akali/app-select';
import InterfaceSelect from '@/components/akali/interface-select';
import FieldModal from '@/pages/components/custom-forms/custom-table-form/field-modal';
import { useForm } from 'antd/es/form/Form';
import NewFileManager from '@/service/new-file-manager';

export interface ColumnSettingProps {
  dependency: string;
  // dataSource?: DataItem[];
  onChange?: (val: TableFormFieldValue['rowAndCol']) => void;
  value?: TableFormFieldValue['rowAndCol'];
}

const RowAndColumnSetting: React.FC<ColumnSettingProps> = ({ value, dependency, onChange }) => {
  const keyRefs = useRef<string[]>([]);
  const { columns, dataSource } = value;
  const [columnFormOpen, setColumnFormOpen] = useState(false);
  const [dataFormOpen, setDataFormOpen] = useState(false);
  // const columnFormRef = useRef<ColumnFormHandle>();
  const dslStore = useContext(DSLStoreContext);
  const [currentData, setCurrentData] = useState<DataItem>();
  const [columnAdderOpen, setColumnAdderOpen] = useState<boolean>(false);
  const [currentColumn, setCurrentColumn] = useState<Column>();
  const [fieldModalOpen, setFieldModalOpen] = useState<boolean>(false);
  const [appId, setAppId] = useState<string>();

  const { generateComponent } = useComponent({ dependency });

  const dataIndexesRef = useRef<string[]>([]);

  const [form] = useForm();

  const currentDataIndices = useMemo(
    () => (currentData ? findKeyIndices(dataSource, currentData.key) : []),
    [currentData, dataSource]
  );

  const titlesRef = useMemo(() => {
    return new Set(columns.map(i => i.title));
  }, [columns]);

  const showEditColumn = (columnKey: string) => {
    setCurrentColumn(columns.find(i => i.key === columnKey));
    setColumnFormOpen(true);
  };

  const onColumnFormClose = () => {
    setColumnFormOpen(false);
  };

  const onDataFormClose = () => {
    setDataFormOpen(false);
  };

  function generateNewKey() {
    let labelSuffix = 1;
    const labelPrefix = 'field';
    let nameExists = keyRefs.current.some(item => item === `${labelPrefix}${labelSuffix}`);
    while (nameExists) {
      labelSuffix++;
      nameExists = keyRefs.current.some(item => item === `${labelPrefix}${labelSuffix}`);
    }
    const newLabelName = `${labelPrefix}${labelSuffix}`;
    keyRefs.current.push(newLabelName);
    return newLabelName;
  }

  function generateNewTitle() {
    let nameSuffix = 1;
    const namePrefix = '字段';
    let nameExists = titlesRef.has(`${namePrefix}${nameSuffix}`);
    while (nameExists) {
      nameSuffix++;
      nameExists = titlesRef.has(`${namePrefix}${nameSuffix}`);
    }
    const newFieldName = `${namePrefix}${nameSuffix}`;
    // titlesRef.current.push(newFieldName);
    return newFieldName;
  }

  const deleteColumnRenderComponents = (columnKey: string) => {
    /**
     * 递归删除组件
     */
    const recurseRemoveComponent = (render: Column['render']) => {
      if (render.length) {
        render.forEach(r => {
          if (!r.isText && r.current) {
            dslStore.dangerousDeleteComponent(r.current);
          }
          if (r?.children?.length) {
            recurseRemoveComponent(r.children);
          }
        });
      }
    };
    const column = columns.find(c => c.key === columnKey);
    recurseRemoveComponent(column.render);
  };

  /**
   * 新增列
   */
  const addColumn = (opt?) => {
    // 1. 新增列
    const key = opt?.key || generateNewKey();

    const newColumn: Column = {
      key,
      dataIndex: key,
      title: opt?.title || generateNewTitle(),
      renderType: '',
      render: []
    };
    const newColumns = toJS(columns);
    const newDataSource = toJS(dataSource);
    newColumns.push(newColumn);

    /**
     * 递归新增字段
     */
    const recurseAddColumn = (column: Column, dataSource: DataItem[], text = '默认字段值') => {
      if (dataSource.length) {
        dataSource.forEach(i => {
          if (column.dataIndex) {
            i[column.dataIndex] = text;
          }
          if (i?.children?.length) {
            recurseAddColumn(column, i.children);
          }
        });
      }
    };

    recurseAddColumn(newColumn, newDataSource);
    onChange?.({
      dataSource: newDataSource,
      columns: newColumns
    });
  };

  /**
   * 删除列
   * @param columnKey
   */
  const removeColumn = (columnKey: string) => {
    const deletedColumn = columns.find(item => item.key === columnKey);
    const finalColumns = columns.filter(item => item.key !== columnKey);
    const newDataSource = toJS(dataSource);
    deleteColumnRenderComponents(columnKey);

    /**
     * 递归删除组件
     */
    const recurseRemoveData = (dataSource: DataItem[], deletedColumn: Column) => {
      if (dataSource.length) {
        dataSource.forEach(i => {
          if (deletedColumn.dataIndex) {
            delete i[deletedColumn.dataIndex];
          }
          if (i?.children?.length) {
            recurseRemoveData(i.children, deletedColumn);
          }
        });
      }
    };

    // 若有行数据，删除行单元格
    recurseRemoveData(newDataSource, deletedColumn);
    onChange?.({
      columns: finalColumns,
      dataSource: finalColumns.length ? newDataSource : []
    });
  };

  const editColumns = (columnKey: string, value: Record<string, unknown>, needCalcDataSource = true) => {
    const columnsCopy = toJS(columns);
    const columnIndex = (columnsCopy as Column[]).findIndex(i => i.key === columnKey);
    if (columnIndex > -1) {
      columnsCopy[columnIndex] = {
        ...columnsCopy[columnIndex],
        ...value
      };
    }
    onChange?.({
      columns: columnsCopy,
      dataSource: needCalcDataSource ? calcDataSourceWithColumns(columnsCopy) : dataSource
    });
  };

  const sortColumns = (e: DragEndEvent) => {
    const { over, active } = e;
    if (over.id === active.id) {
      return;
    }
    const columnsCp = toJS(columns);

    const activeIndex = columnsCp.findIndex(item => item.key === (active.id as string));
    const overIndex = columnsCp.findIndex(item => item.key === (over?.id as string));

    onChange?.({
      columns: arrayMove(columnsCp, activeIndex, overIndex),
      dataSource
    });
  };

  // 根据columns重新生成dataSource
  const calcDataSourceWithColumns = (cols: Column[]) => {
    const dataSourceCp = cloneDeep(dataSource);
    const colsKeys = cols.map(c => c.dataIndex).filter(i => i);
    const recurseCalcDataSource = (dataSource: DataItem[]) => {
      dataSource.forEach(d => {
        const dataKeys = Object.keys(d).filter(i => !['children', 'key'].includes(i)) || [];
        const needDeleteKeys = dataKeys.filter(i => !colsKeys.includes(i));
        const needAddKeys = colsKeys.filter(i =>!dataKeys.includes(i));
        needDeleteKeys?.forEach(k => {
          delete d[k];
        });
        needAddKeys?.forEach(k => {
          d[k] = '默认字段值';
        });
        if (d?.children?.length) {
          recurseCalcDataSource(d.children);
        }
      });
    };
    recurseCalcDataSource(dataSourceCp);
    return dataSourceCp;
  };

  /**
   *  处理组件类型变更
   * @param renderType 组件类型
   * @param key 列key
   */
  const handleChangeRenderType = (columnKey: string, renderType: RenderType) => {
    const currentColumn = columns.find(i => i.key === columnKey);
    currentColumn.renderType = renderType;
    // 递归删除组件
    deleteColumnRenderComponents(columnKey);

    const recurseModifyRender = (dataSource: DataItem[], render: Column['render']) => {
      if (!renderType) {
        return [];
      }
      if (dataSource?.length) {
        dataSource.forEach((i, idx) => {
          render[idx] = generateComponent(renderType, i?.[currentColumn.dataIndex]);
          if (i?.children?.length) {
            if (!render?.[idx]?.children?.length) {
              render[idx].children = [];
            }
            recurseModifyRender(i.children, render[idx].children);
          }
        });
      }
    };

    if (!renderType) {
      currentColumn.render = [];
    } else {
      recurseModifyRender(dataSource, currentColumn.render);
    }

    if (renderType === OPERATE_COMPONENT_CONFIG_NAME) {
      currentColumn.dataIndex = undefined;
    }
    if (renderType !== OPERATE_COMPONENT_CONFIG_NAME && !currentColumn.dataIndex) {
      currentColumn.dataIndex = currentColumn.key;
    }
    console.log('currentColumn', currentColumn);
    editColumns(columnKey, currentColumn);
  };

  /**
   * 处理操作按钮配置变更
   * @param columnKey
   * @param operators
   */
  const handleUpdateOperateButton = (
    columnKey: string,
    changedOperators: Partial<FieldValue['operators']> = [],
    operators: FieldValue['operators'] = []
  ) => {
    const column = columns.find(i => i.key === columnKey);
    const count = operators.length;
    const isAddOrRemove = isEqual(changedOperators, operators);
    const recurseUpdateOperateButton = (render: Column['render']) => {
      if (render?.length) {
        render.forEach((r) => {
          const { current } = r;
          const btns = dslStore.fetchComponentInDSL(current).children;
          if (isAddOrRemove) {
            // 新增或删除
            const btnCount = btns.length;
            const difference = Math.abs(count - btnCount);
            if (count > btnCount) {
              // 新增
              const componentConfig = new Array(difference).fill({
                name: 'Button',
                dependency
              });
              dslStore.insertComponentsInBatch(current, componentConfig);
              btns.forEach((btn, bx) => {
                dslStore.updateComponentProps(operators[bx], { id: btn.current });
              });
            } else if (count < btnCount) {
              // 删除
              dslStore.deleteComponentsInBatch(current, -1, difference);
            }
          } else {
            // 2. 按钮属性变化
            btns.forEach((btn, bx) => {
              dslStore.updateComponentProps(operators[bx], { id: btn.current });
            });
          }
          if (r.children?.length) {
            recurseUpdateOperateButton(r.children);
          }
        });
      }
    };
    recurseUpdateOperateButton(column.render);
    // column.render.forEach(({ current }) => {
    //   const btns = dslStore.fetchComponentInDSL(current).children;
    //   if (isAddOrRemove) {
    //     // 新增或删除
    //     const btnCount = btns.length;
    //     const difference = Math.abs(count - btnCount);
    //     if (count > btnCount) {
    //       // 新增
    //       const componentConfig = new Array(difference).fill({
    //         name: 'Button',
    //         dependency
    //       });
    //       dslStore.insertComponentsInBatch(current, componentConfig);
    //       btns.forEach((btn, bx) => {
    //         dslStore.updateComponentProps(operators[bx], { id: btn.current });
    //       });
    //     } else if (count < btnCount) {
    //       // 删除
    //       dslStore.deleteComponentsInBatch(current, -1, difference);
    //     }
    //   } else {
    //     // 2. 按钮属性变化
    //     btns.forEach((btn, bx) => {
    //       dslStore.updateComponentProps(operators[bx], { id: btn.current });
    //     });
    //   }
    // });
  };

  const onColumnDataChange: ColumnFormProps['onChange'] = (changedValue, value) => {
    const key = currentColumn.key;

    if ('operators' in changedValue) {
      handleUpdateOperateButton(key, changedValue.operators, value.operators);
      return;
    }
    if ('renderType' in changedValue) {
      handleChangeRenderType(key, changedValue.renderType);
      return;
    }
    editColumns(currentColumn.key, value);
  };

  // const removeRow = (index: number) => {
  //   const dataSourceCopy = toJS(dataSource);
  //   dataSourceCopy.splice(index, 1);

  //   const columnsCopy = toJS(columns).map(i => {
  //     return {
  //       ...i,
  //       render: i.render.filter((r, rx) => {
  //         if (rx === index) {
  //           dslStore.dangerousDeleteComponent(r.current);
  //           return false;
  //         }
  //         return true;
  //       })
  //     };
  //   });

  //   onChange?.({
  //     dataSource: dataSourceCopy,
  //     columns: columnsCopy
  //   });
  // };

  const editRow = (key: string) => {
    setCurrentData(findNodeByKey(dataSource, key));
    setDataFormOpen(true);
  };

  const onRowChange: DataFormProps['onChange'] = val => {
    // TODO，编辑行
    const row = {
      ...val,
      key: currentData.key
    };
    const rowIndex = dataSource.findIndex(i => i.key === row.key);
    const indices = findKeyIndices(dataSource, row.key);
    columns.forEach(c => {
      if (
        c.dataIndex &&
        [RenderTypeEnum.Text, RenderTypeEnum.Amount, RenderTypeEnum.Tag].includes(c.renderType as RenderTypeEnum)
      ) {
        dslStore.updateComponentProps(
          {
            children: row[c.dataIndex]
          },
          {
            id: findNodeByIndices(c.render, indices).current
          }
        );
      }
    });

    const dataSourceCopy = updateNodeByIndices(dataSource || [], indices, row);
    // const index = dataSourceCopy.findIndex(i => i.key === row.key);
    // dataSourceCopy.splice(index, 1, row);
    onChange?.({
      columns,
      dataSource: dataSourceCopy
    });
  };

  const onRowSort = (e: DragEndEvent) => {
    const { over, active } = e;
    if (over.id === active.id) {
      return;
    }
    const dataSourceCp = toJS(dataSource);
    const columnsCp = toJS(columns);

    const activeIndex = dataSourceCp.findIndex(item => item.key === (active.id as string));
    const overIndex = dataSourceCp.findIndex(item => item.key === (over?.id as string));

    const afterSwap = arrayMove(dataSourceCp, activeIndex, overIndex);

    columnsCp.forEach(col => {
      if (col.render.length) {
        col.render = arrayMove(col.render, activeIndex, overIndex);
      }
    });

    onChange?.({
      columns: columnsCp,
      dataSource: afterSwap
    });
  };

  const onTreeDataChange: DraggableTreeProps['onChange'] = data => {
    data.forEach((d, dx) => {
      console.log(
        d.key,
        dataSource.find(i => i.key === d.key)
      );
    });
  };

  const onTreeSelect: DraggableTreeProps['onSelect'] = (selectedKeys, info) => {
    console.log('selectedKeys, info', selectedKeys, info);
  };

  const addRow = (indices?: number[]) => {
    let newDataSource = toJS(dataSource) || [];
    const newRow = {
      key: nanoid()
    };

    const columnsCopy = columns.map(col => {
      const column = toJS(col);
      let render = column.render || [];
      if (column.renderType !== RenderTypeEnum.Default) {
        const addedComponent = generateComponent(column.renderType, '默认字段值');
        render = addNodeByIndices(render, indices, addedComponent);
      }
      if (column.renderType !== RenderTypeEnum.Operate && column.dataIndex) {
        newRow[column.dataIndex] = '默认字段值';
      }
      return {
        ...column,
        render
      };
    });

    newDataSource = addNodeByIndices(newDataSource, indices, newRow);
    onChange?.({
      columns: columnsCopy,
      dataSource: newDataSource
    });
  };

  const removeRow = (nodeData: DataItem, indices: number[]) => {
    const newColumns = columns.map(c => {
      if (c.render.length > 0) {
        const node = findNodeByIndices(c.render, indices);
        if (node.current) {
          dslStore.dangerousDeleteComponent(node.current);
        }
        const render = removeNodeByIndices(c.render, indices);
        return {
          ...c,
          render
        };
      }
      return c;
    });
    const newDataSource = deleteNode(dataSource, nodeData.key);
    onChange?.({
      dataSource: newDataSource,
      columns: newColumns
    });
  };

  const renderColumns = () => {
    return (
      <SortableContext items={(columns as Column[]).map(i => i.key)}>
        {columns.map(item => {
          const { key } = item;
          return (
            <SortableItem
              dragAlign="right"
              styles={{
                header: {
                  justifyContent: 'space-between'
                },
                dragItem: {
                  alignItems: 'center'
                }
              }}
              style={{
                marginBottom: 4
              }}
              key={key}
              id={key}
              footer={null}
            >
              <Row gutter={4} style={{ flex: 1 }} align="middle">
                <Col span={12}>
                  <Space>
                    <Button
                      type="text"
                      icon={<EditPencil />}
                      size="small"
                      onClick={() => {
                        showEditColumn(key);
                      }}
                    ></Button>
                    <FormInput
                      size="small"
                      value={item.title}
                      onChange={e => editColumns(key, { title: e }, false)}
                    ></FormInput>
                  </Space>
                </Col>
                <Col span={9}>
                  <FormSelect<RenderType>
                    value={item.renderType || ''}
                    size="small"
                    style={{ width: '100%' }}
                    options={renderOptions}
                    onChange={e => handleChangeRenderType(key, e)}
                  ></FormSelect>
                </Col>
                <Col>
                  <Button icon={<Trash></Trash>} type="text" size="small" onClick={() => removeColumn(key)}></Button>
                </Col>
              </Row>
            </SortableItem>
          );
        })}
      </SortableContext>
    );
  };

  const renderRows = () => {
    if (!dataSource) return null;
    return (
      <DraggableTree
        draggable={false}
        showAddBtn={false}
        value={dataSource}
        onChange={onTreeDataChange}
        onSelect={onTreeSelect}
        renderTitle={(nodeData, indices = []) => {
          return (
            <Flex justify="space-between" align="center">
              <Flex align="center" wrap={false}>
                <Button
                  type="text"
                  icon={<EditPencil />}
                  size="small"
                  onClick={() => {
                    editRow(nodeData.key);
                  }}
                ></Button>
                第{(indices?.[indices?.length - 1] || 0) + 1}行
              </Flex>
              <Flex>
                <Tooltip title="创建子节点">
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => {
                      addRow(indices);
                    }}
                  ></Button>
                </Tooltip>
                <Tooltip title="删除当前节点">
                  <Button
                    type="text"
                    icon={<MinusOutlined />}
                    size="small"
                    onClick={() => {
                      removeRow(nodeData, [...indices]);
                    }}
                  ></Button>
                </Tooltip>
              </Flex>
            </Flex>
          );
        }}
      />
    );
  };

  useEffect(() => {
    const configNames: string[] = [];
    columns.forEach((item, index) => {
      keyRefs.current.push(item.key);
      const configName = item.render?.[0]?.configName;
      configNames.push(configName || DEFAULT_COMPONENT_CONFIG_NAME);
    });
  }, []);

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

  return (
    <div>
      <>
        {!!columns?.length && (
          <Row
            gutter={4}
            style={{
              padding: '0 8px',
              marginRight: 16,
              marginLeft: 28
            }}
          >
            <Col span={10}>标题</Col>
            <Col span={10}>数据类型</Col>
          </Row>
        )}
        <DndContext onDragEnd={sortColumns}>{renderColumns()}</DndContext>
        <div className={styles['operate-container']}>
          <Button type="text" onClick={() => addColumn()}>
            新增一列 <Plus />
          </Button>
          <Button className={styles.ml5} type="default" onClick={openColumnAdder}>
            批量添加
          </Button>
          <Button className={styles.ml5} type="default" onClick={() => setFieldModalOpen(true)}>
            字段维护
          </Button>
        </div>
      </>

      {!!columns.length && (
        <>
          <Divider></Divider>
          {renderRows()}
          {/* <DndContext onDragEnd={onRowSort}>{renderRows()}</DndContext> */}
          <div className={styles['operate-container']}>
            <Button type="text" onClick={() => addRow()}>
              新增一行 <Plus />
            </Button>
          </div>
        </>
      )}
      <ColumnFormModal
        open={columnFormOpen}
        onClose={onColumnFormClose}
        value={currentColumn}
        onChange={onColumnDataChange}
      />
      <DataForm
        title={`数据配置 (第${currentDataIndices.map(i => i + 1).join('-')}行)`}
        minWidth={600}
        onClose={onDataFormClose}
        open={dataFormOpen}
        value={currentData}
        columns={columns}
        onChange={onRowChange}
      ></DataForm>
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
};

export default observer(RowAndColumnSetting);
