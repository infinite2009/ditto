import { Table } from 'antd';
import { define, generateDefaultStyleConfig } from '../utils';
import { TableIcon } from '@/components/icon';
import CustomTableForm from './form/CustomTableForm';
import ComponentFeature from '@/types/component-feature';

export default define({
  configName: 'TableNext',
  name: 'Table',
  importName: 'Table',
  callingName: 'Table',
  dependency: 'antd',
  component: Table,
  categories: ['常用', '数据展示'],
  title: '表格(新)',
  icon: TableIcon,
  feature: ComponentFeature.blackBox,
  propsConfig: {
    style: generateDefaultStyleConfig(
      { padding: 8, alignSelf: 'stretch' },
      {
        layout: {
          width: true,
          height: true
        }
      }
    ),
    size: {
      schemaType: 'props',
      category: 'basic',
      value: 'large',
      defaultValue: 'large',
      valueType: 'string',
      valueSource: 'editorInput',
      schema: {
        title: '尺寸',
        component: 'Select',
        componentProps: {
          options: [
            {
              value: 'large',
              label: '大'
            },
            {
              value: 'middle',
              label: '中'
            },
            {
              value: 'small',
              label: '小'
            }
          ]
        }
      }
    },
    columns: {
      schemaType: 'props',
      title: '列',
      category: 'basic',
      valueType: 'array',
      valueSource: 'editorInput',
      templateKeyPathsReg: [
        {
          path: '\\[\\d+\\]\\.render$',
          type: 'function',
          repeatType: 'table',
          columnKey: 'dataIndex',
          repeatPropRef: 'dataSource',
          indexKey: 'key',
          itemIndexInArgs: 1
        }
      ],
      value: []
    },
    dataSource: {
      schemaType: 'props',
      title: '数据源',
      category: 'basic',
      valueType: 'array',
      valueSource: 'editorInput',
      value: []
    },
    pagination: {
      schemaType: 'props',
      title: '分页配置',
      category: 'basic',
      valueType: ['object', 'boolean'],
      valueSource: 'editorInput',
      value: {},
      defaultValue: undefined
    },
    rowSelection: {
      schemaType: 'props',
      title: '选择功能配置',
      category: 'basic',
      valueType: 'object',
      valueSource: 'editorInput',
      value: undefined
    }
  },
  children: {
    value: [],
    type: 'template',
    notDraggable: true,
    noRendering: true
  },
  formSchema: {
    formComponent: {
      basic: CustomTableForm
    },
    divider: {
      basic: true
    }
  }
});