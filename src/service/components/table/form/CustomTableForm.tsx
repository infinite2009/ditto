import { Divider, Form, FormProps, Select, Switch } from 'antd';
import { observer } from 'mobx-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { DSLStoreContext } from '@/hooks/context';
import IPropsSchema from '@/types/props.schema';
import { TableProps } from 'antd/lib';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnType } from 'antd/lib/table';
import PaginationSetting from '../components/PaginationSetting';
import RowSelectionSetting from '../components/RowSelectionSetting';
import { RenderType } from '../types';
import RowAndColumnSetting from '../components/RowAndColumnSetting';
import { cloneDeep, omit } from 'lodash';
import ComponentSchemaRef from '@/types/component-schema-ref';
import getPropsValue from '@/util';
import { FieldDataNode } from '@/pages/components/draggable-tree/utils';
import { IGNORE_GENERATE_CODE_PREFIX } from '@/service/code-generator/typescript';
import { TablePaginationConfig } from 'antd/lib/table/interface';

export type Column = Omit<ColumnType<AnyObject>, 'render' | 'dataIndex' | 'key' | 'title'> & {
  render: FieldDataNode<ComponentSchemaRef>[];
  dataIndex: string;
  key: string;
  title: string;
  renderType: RenderType;
};

export type DataItem = FieldDataNode<{ key: string } & Partial<Record<string, any>>>;
export type Pagination = TableProps['pagination'];
export type RowSelection = TableProps['rowSelection'];
export type TableNextProps = {
  paginationConfig: boolean;
  columns: Column[];
  dataSource: DataItem[];
  pagination: Pagination;
  rowSelection: RowSelection;
};
export type FieldValue = Omit<TableNextProps, 'columns' | 'dataSource'> & {
  rowAndCol: {
    columns: Column[];
    dataSource: DataItem[];
  };
};

export type GenDSLProps<FieldValue extends Record<string, any>> = {
  [key in keyof FieldValue]: IPropsSchema<FieldValue[key]>;
};

type PaginationPosition = Array<'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'none'>;

const RenderTypeKey = `${IGNORE_GENERATE_CODE_PREFIX}_renderType`;

export default observer(function CustomTableForm() {
  const [form] = Form.useForm<FieldValue>();
  const dslStore = useContext(DSLStoreContext);
  const component = dslStore.selectedComponent;
  const props = dslStore.dsl.props[component?.id] as GenDSLProps<TableNextProps>;

  const formValue = getPropsValue(props) as TableNextProps;
  const { columns, dataSource } = formValue;
  const dependency = useMemo(() => {
    return dslStore.selectedComponent.dependency;
  }, [dslStore.selectedComponent.dependency]);

  const [position, setPosition] = useState<'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight'>('bottomRight');
  const [showQuickJumper, setShowQuickJumper] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(10);

  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 24 }
  };

  const initialValues: FieldValue = {
    paginationConfig: true,
    rowAndCol: {
      columns: columns.map(i => {
        const renderType = i[RenderTypeKey];
        return {
          renderType,
          ...omit(i, RenderTypeKey)
        };
      }),
      dataSource: dataSource
    },
    pagination: {
      showQuickJumper: false,
      pageSize: 10,
      position: ['bottomRight']
    },
    rowSelection: undefined
  };

  const onValuesChange: FormProps<FieldValue>['onValuesChange'] = (changedValues, values) => {
    const rowAndCol = cloneDeep(values.rowAndCol);
    if (rowAndCol.columns) {
      rowAndCol.columns.forEach(column => {
        column[RenderTypeKey] = column.renderType;
        delete column.renderType;
      });
    }
    const propsValue = omit(cloneDeep({ ...values, ...rowAndCol }), 'rowAndCol');
    if (!values.paginationConfig) {
      propsValue.pagination = false;
    } else {
      (propsValue.pagination as TablePaginationConfig).position = [(values.pagination as any).position];
      (propsValue.pagination as TablePaginationConfig).pageSize = (values.pagination as any).pageSize;
      (propsValue.pagination as TablePaginationConfig).showQuickJumper = (values.pagination as any).showQuickJumper;
      setPosition((values.pagination as any).position);
      setPageSize((propsValue.pagination as TablePaginationConfig).pageSize);
      setShowQuickJumper((propsValue.pagination as TablePaginationConfig).showQuickJumper as boolean);
      if ((propsValue.pagination as TablePaginationConfig).showQuickJumper as boolean) {
        (propsValue.pagination as TablePaginationConfig).total = 100;
      } else {
        (propsValue.pagination as TablePaginationConfig).total = undefined;
      }
    }
    delete propsValue.paginationConfig;
    dslStore.updateComponentProps(propsValue);
  };

  useEffect(() => {
    form.setFieldsValue({
      ...formValue,
      pagination: {
        ...formValue.pagination,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        position: formValue?.pagination?.position?.[0] || position,
      },
      rowAndCol: {
        columns: columns.map(i => {
          const renderType = i[RenderTypeKey];
          return {
            renderType,
            ...omit(i, RenderTypeKey)
          };
        }),
        dataSource
      }
    });
  }, [formValue]);

  function renderPaginationConfig() {
    const showPaginationConfig = form.getFieldValue('paginationConfig');
    if (showPaginationConfig) {
      form.setFieldsValue({
        pagination: {
          pageSize,
          position,
          showQuickJumper
        }
      });
      return (
        <>
          <Form.Item {...formLayout} label="每页大小" name={['pagination', 'pageSize']}>
            <Select
              options={[
                { value: 10, label: '10条' },
                { value: 20, label: '20条' },
                { value: 50, label: '50条' },
                { value: 100, label: '100条' }
              ]}
            />
          </Form.Item>
          <Form.Item {...formLayout} label="位置" name={['pagination', 'position']}>
            <Select
              allowClear
              options={[
                { value: 'topLeft', label: '左上方' },
                { value: 'topCenter', label: '上方' },
                {
                  value: 'topRight',
                  label: '右上方'
                },
                {
                  value: 'bottomLeft',
                  label: '左下方'
                },
                {
                  value: 'bottomCenter',
                  label: '下方'
                },
                {
                  value: 'bottomRight',
                  label: '右下方'
                }
              ]}
            />
          </Form.Item>
          <Form.Item {...formLayout} label="快速跳转" name={['pagination', 'showQuickJumper']} >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
        </>
      );
    }
    return null;
  }

  return (
    <div>
      <Form<FieldValue>
        form={form}
        labelAlign="right"
        {...formLayout}
        style={{
          padding: 12
        }}
        initialValues={initialValues}
        onValuesChange={onValuesChange}
      >
        <div>字段设置</div>
        <Form.Item<FieldValue> noStyle label={null} name="rowAndCol">
          <RowAndColumnSetting dependency={dependency}></RowAndColumnSetting>
        </Form.Item>
        <Divider />
        <Form.Item<FieldValue> label="分页配置" name="paginationConfig">
          <PaginationSetting />
        </Form.Item>
        <Form.Item noStyle name="pagination" shouldUpdate={(_, curValues: FieldValue) => {
          return curValues.paginationConfig;
        }}>
          {renderPaginationConfig()}
        </Form.Item>
        <Form.Item<FieldValue> label="行选择" name="rowSelection">
          <RowSelectionSetting />
        </Form.Item>
      </Form>
    </div>
  );
});
