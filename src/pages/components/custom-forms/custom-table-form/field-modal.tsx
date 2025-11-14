import { toJS } from 'mobx';
import { useContext, useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Input, message, Modal, Popconfirm, Table } from 'antd';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DSLStoreContext } from '@/hooks/context';
import { nanoid } from 'nanoid';
import { IGNORE_GENERATE_CODE_PREFIX } from '@/service/code-generator/typescript';
import { analysisReactNodeText, handleFieldTableToClipboard } from '@/util/copy-to-clipoard';
import styles from './index.module.less';

export interface IFieldModalProps {
  onClose?: () => void;
  open: boolean;
}

// 自定义字段前缀
const CUSTOM_FIELD_PREFIX = 'field_';

// 维护字段信息字段，挂载在props上，但又不想被代码生成使用，所以使用IGNORE_GENERATE_CODE_PREFIX前缀忽略；
const ignoreCodeFieldInfoList = `${IGNORE_GENERATE_CODE_PREFIX}_fieldInfoList`;

export default observer((props: IFieldModalProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { open, onClose } = props;

  const dslStore = useContext(DSLStoreContext);

  const inputRef = useRef<InputRef>(null);

  const fieldColumnsRef = useRef([]); // 由于column是动态生成的，且title需要用到并修改column，所以存储到ref中
  const [fieldColumns, setFieldColumns] = useState([]);
  const [fieldDataSource, setFieldDataSource] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editingHeader, setEditingHeader] = useState(null);
  const [value, setValue] = useState('');

  /**
   * 列配置修改：由于column是动态生成的，且title需要用到并修改column，所以存储到ref中
   */
  function handleSetFieldColumns(value) {
    setFieldColumns(value);
    fieldColumnsRef.current = value;
  }

  /**
   * 重置状态
   */
  function resetState() {
    handleSetFieldColumns([]);
    setFieldDataSource([]);
  }

  /**
   * 编辑字段值浮层-保存处理
   */
  const handleSave = () => {
    if (!value) {
      messageApi.warning('值不能为空');
      return;
    }
    // 修改表头单元格
    if (editingHeader) {
      const { key } = editingHeader || {};
      const curField = fieldColumns?.find(v => v.key === key);

      // 字段名称不支持删除，其余自定义的字段信息支持删除
      curField.title = getTableHeaderTitle(key, value, !['title'].includes(key));
      handleSetFieldColumns(fieldColumns);
      setEditingHeader(null);
    }

    // 修改行内单元格
    else if (editing) {
      const { key, rowIndex } = editing || {};
      if (fieldDataSource[rowIndex]) {
        fieldDataSource[rowIndex][key] = value;
      }
      setFieldDataSource(fieldDataSource);
      setEditing(null);
    }
  };

  /**
   * 表头Title渲染
   */
  function getTableHeaderTitle(key, title, modify) {
    return (
      <div className={styles.titleContainer}>
        <span
          className={classNames({
            [styles.ell]: true,
            [styles.titleContent]: true
          })}
        >
          {title}
        </span>
        {modify && (
          <>
            <EditOutlined className={styles.icon} onClick={() => handleEditHeader(key, title)} />
            <Popconfirm title="删除字段" description="请确认是否删除该字段？" onConfirm={() => handleDeleteField(key)}>
              <DeleteOutlined className={styles.icon} />
            </Popconfirm>
          </>
        )}
      </div>
    );
  }

  /**
   * 单元格编辑
   */
  function handleEditCell(key, record, rowIndex) {
    setEditing({ key, record, rowIndex });
    setValue(record[key]);
  }

  /**
   * 表头编辑
   */
  function handleEditHeader(key, title) {
    const titleText = analysisReactNodeText(title);
    setEditingHeader({ key, title });
    setValue(titleText);
  }

  /**
   * 构造字段信息表格列配置
   */
  function getNewColumnConfig({
    key,
    value,
    modify,
    _order
  }: {
    key: string; // 列ID
    value: string; // 列名称
    modify?: boolean; // 是否允许编辑
    _order?: number; // 排序使用
  }) {
    return {
      _order,
      className: styles['table-cell-hover'],
      title: getTableHeaderTitle(key, value, modify),
      dataIndex: key,
      key: key,
      width: 200,
      fixed: key === 'title' ? 'left' : false,
      onCell: (record, rowIndex) => {
        return {
          onClick: () => handleEditCell(key, record, rowIndex)
        };
      }
    };
  }

  /**
   * 初始化表格列信息（构造column, 构造dataSource）
   */
  function initFieldTable() {
    if (!dslStore?.selectedComponent) {
      return;
    }
    const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const tempColumns = toJS(columns);

    let tempFieldColumns = [];
    const tempFieldDataSource = (columns?.value as any)?.map(v => {
      return {
        key: v.key,
        title: v.title // 塞入默认的字段信息的内容
      };
    });

    // 查找columns.value[x]._ignoreCode_fieldInfoList最大的一项构造完整的列信息
    let totalFieldInfoList = [];
    (tempColumns.value as any)?.forEach(column => {
      const curFieldInfoList = column?.[ignoreCodeFieldInfoList];
      if (curFieldInfoList?.length > totalFieldInfoList?.length) {
        totalFieldInfoList = curFieldInfoList;
      }
    });

    // 构造默认的字段的列信息，不可删除
    tempFieldColumns.push(getNewColumnConfig({ key: 'title', value: '字段名称', _order: 0 }));
    // 构造自定义的字段的列信息
    totalFieldInfoList?.forEach(field => {
      const { key, header, order } = field || {};
      const isCurFieldExistTempFieldColumns = tempFieldColumns?.find(v => v.key === field.key);
      if (!isCurFieldExistTempFieldColumns) {
        tempFieldColumns.push(
          getNewColumnConfig({
            key,
            value: header,
            modify: true,
            _order: order
          })
        );
      }
    });
    // 根据_order排序列配置
    tempFieldColumns = tempFieldColumns.sort((a, b) => a._order - b._order);

    // 构造字段信息表格DataSource
    (tempColumns.value as any)?.forEach((column, colIndex) => {
      // 使用完整的列信息去遍历，防止后续新增的表格列字段没有fieldInfoList字段
      totalFieldInfoList?.forEach(totalField => {
        const totalKey = totalField?.key; // 完整列的key
        const curColumnFieldItem = column?.[ignoreCodeFieldInfoList]?.find(field => field?.key === totalKey);
        // 构造字段信息表格内容（就算该column不存在FieldInfoList，也会用「完整列的key」以及「空字符串」做键值对塞入DataSource）
        tempFieldDataSource[colIndex][totalKey] = curColumnFieldItem?.content || '';
      });
    });

    // console.log(tempFieldColumns, tempFieldDataSource);

    handleSetFieldColumns(tempFieldColumns);
    setFieldDataSource(tempFieldDataSource);
  }

  /**
   * 删除字段信息（删除表格列）
   */
  function handleDeleteField(key) {
    const tempFieldColumns = fieldColumnsRef.current?.filter(item => item.key !== key);
    handleSetFieldColumns(tempFieldColumns);
  }

  /**
   * 新增字段信息（新增表格列）
   */
  function handleAddField() {
    const key = `${CUSTOM_FIELD_PREFIX}${nanoid()}`;

    // 新增列配置项
    const newColumn = getNewColumnConfig({ key, value: '字段描述', modify: true });

    // 为新增列的每个行单元格赋空值
    fieldDataSource?.forEach(v => {
      v[newColumn.key] = '';
    });

    handleSetFieldColumns([...fieldColumns, newColumn]);
    setFieldDataSource(fieldDataSource);
  }

  /**
   * 解析新增的字段列信息
   */
  function analysisFieldColumn() {
    const { columns } = dslStore.dsl.props[dslStore.selectedComponent.id];
    const columnsCp = toJS(columns.value);
    if (Array.isArray(columnsCp)) {
      columnsCp?.forEach(column => {
        column[ignoreCodeFieldInfoList] = []; // 先做清空处理
        const curDataSource = fieldDataSource?.find(v => v.key === column.key);
        column.title = curDataSource.title || column.title;
        Object.entries(curDataSource)?.forEach(v => {
          const key = v[0];
          const value = v[1];
          const curFieldColumnIndex = fieldColumns?.findIndex(v => v.key === key);
          const curFieldColumn = fieldColumns?.[curFieldColumnIndex];
          if (curFieldColumn && key?.startsWith(CUSTOM_FIELD_PREFIX)) {
            column[ignoreCodeFieldInfoList].push({
              key,
              content: value,
              order: curFieldColumnIndex, // 索引（构建时需要根据该字段做排序）
              header: analysisReactNodeText(curFieldColumn.title)
            });
          }
        });
      });
    }
    dslStore.updateComponentProps({ columns: columnsCp }, dslStore.selectedComponent);
  }

  /**
   * 维护字段信息浮层确认
   */
  async function handleOk() {
    analysisFieldColumn();
    onClose();
  }

  /**
   * 打开「维护字段信息」浮层
   */
  useEffect(() => {
    if (open) {
      resetState();
      initFieldTable();
    }
  }, [open]);

  /**
   * 打开「编辑字段值」浮层
   */
  useEffect(() => {
    if (editing || editingHeader) {
      // 聚焦
      inputRef?.current?.focus({
        cursor: 'end'
      });
    }
  }, [editing, editingHeader]);

  return (
    <Modal
      open={open}
      title="字段维护"
      onCancel={onClose}
      onOk={handleOk}
      maskClosable={false}
      width={800}
    >
      {contextHolder}
      <div className={styles.btnContainer}>
        <div className={styles.btnContainerLeft}>
          <Button type="default" onClick={handleAddField}>
            新增描述维度
          </Button>
        </div>
        <div className={styles.btnContainerRight}>
          <Button type="default" onClick={() => handleFieldTableToClipboard(fieldColumns, fieldDataSource)}>
            导出字段信息
          </Button>
        </div>
      </div>
      <Table
        bordered
        dataSource={fieldDataSource}
        columns={fieldColumns}
        scroll={{ x: 'max-content', y: '40vh' }}
        pagination={false}
      />
      {(editingHeader || editing) && (
        <Modal
          open={true}
          title="编辑字段值"
          onOk={handleSave}
          onCancel={() => {
            setEditing(null);
            setEditingHeader(null);
          }}
          className={styles.editingModal}
        >
          {editingHeader ? (
            <Input ref={inputRef} value={value} onChange={e => {
              setValue(e.target.value);
            }} />
          ) : (
            <Input.TextArea ref={inputRef} value={value} onChange={e => {
              setValue(e.target.value);
            }} />
          )}
        </Modal>
      )}
    </Modal>
  );
});
