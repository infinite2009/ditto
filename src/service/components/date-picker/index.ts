import { DatePicker } from '@bilibili/ui';
import { define, generateDefaultStyleConfig } from '../utils';
import { DatePickerIcon } from '@/components/icon';

export default define({
  configName: 'DatePicker',
  name: 'DatePicker',
  callingName: 'DatePicker',
  dependency: 'antd',
  component: DatePicker,
  categories: ['常用', '信息录入', '数据展示'],
  title: '日期选择器',
  icon: DatePickerIcon,
  propsConfig: {
    style: generateDefaultStyleConfig(
      {},
      {
        layout: {
          width: true,
          height: true
        }
      }
    ),
    placeholder: {
      schemaType: 'props',
      category: 'basic',
      value: '请选择',
      valueType: 'string',
      valueSource: 'editorInput',
      schema: {
        title: '提示词',
        component: 'Input',
        componentProps: {
          placeholder: '请输入提示词'
        }
      }
    },
    allowClear: {
      schemaType: 'props',
      category: 'basic',
      value: true,
      valueType: 'boolean',
      valueSource: 'editorInput',
      schema: {
        title: '是否允许清除',
        component: 'Switch',
        required: false
      }
    },
    picker: {
      schemaType: 'props',
      category: 'basic',
      value: 'date',
      valueType: 'string',
      valueSource: 'editorInput',
      schema: {
        title: '选择器类型',
        component: 'Select',
        required: true,
        componentProps: {
          options: [
            {
              value: 'date',
              label: '日期'
            },
            {
              value: 'week',
              label: '周'
            },
            {
              value: 'month',
              label: '月'
            },
            {
              value: 'quarter',
              label: '季度'
            },
            {
              value: 'year',
              label: '年'
            }
          ]
        }
      }
    },
    defaultValue: {
      schemaType: 'props',
      category: 'basic',
      value: undefined,
      valueType: 'dayjs',
      valueSource: 'editorInput',
      schema: {
        title: '默认值',
        component: 'DatePicker',
        componentProps: {
          placeholder: '请选择日期'
        },
        reRenderWhenChange: true
      }
    },
    minDate: {
      schemaType: 'props',
      category: 'basic',
      value: undefined,
      valueType: 'dayjs',
      valueSource: 'editorInput',
      schema: {
        title: '最小日期',
        component: 'DatePicker',
        componentProps: {
          placeholder: '请选择日期'
        }
      }
    },
    maxDate: {
      schemaType: 'props',
      category: 'basic',
      value: undefined,
      valueType: 'dayjs',
      valueSource: 'editorInput',
      schema: {
        title: '最大日期',
        component: 'DatePicker',
        componentProps: {
          placeholder: '请选择日期'
        }
      }
    },
    title: {
      schemaType: 'props',
      category: 'basic',
      value: undefined,
      defaultValue: undefined,
      valueType: 'string',
      valueSource: 'editorInput'
    }
  }
});