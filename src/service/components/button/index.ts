import EditComp from '@/components/EditComp';
import { define, generateDefaultStyleConfig } from '../utils';
import { ButtonIcon } from '@/components/icon';
import ComponentFeature from '@/types/component-feature';

export const buttonTypeOptions = [
  {
    value: 'primary',
    label: '主要'
  },
  {
    value: 'dashed',
    label: '虚线边框'
  },
  {
    value: 'link',
    label: '链接'
  },
  {
    value: 'text',
    label: '文本'
  },
  {
    value: 'default',
    label: '默认'
  }
];
export default define({
  configName: 'Button',
  name: 'Button',
  callingName: 'Button',
  dependency: 'antd',
  component: EditComp.Button,
  categories: ['常用'],
  feature: ComponentFeature.solid,
  title: '按钮',
  icon: ButtonIcon,
  propsConfig: {
    type: {
      schemaType: 'props',
      category: 'basic',
      value: 'primary',
      defaultValue: 'primary',
      valueType: 'string',
      valueSource: 'editorInput',
      schema: {
        title: '类型',
        component: 'Select',
        componentProps: {
          options: buttonTypeOptions
        }
      }
    },
    danger: {
      schemaType: 'props',
      category: 'basic',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput',
      schema: {
        title: '设置为危险按钮',
        component: 'Switch',
        required: false,
      }
    },
    disabled: {
      schemaType: 'props',
      category: 'basic',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput',
      schema: {
        title: '设置为禁用状态',
        component: 'Switch',
        required: false,
      }
    },
    href: {
      schemaType: 'props',
      category: 'basic',
      value: undefined,
      valueType: 'string',
      valueSource: 'editorInput',
      schema: {
        title: '链接',
        component: 'Input',
        required: false,
      }
    },
    target: {
      schemaType: 'props',
      category: 'basic',
      value: '_blank',
      defaultValue: '_blank',
      valueType: 'string',
      valueSource: 'editorInput',
      schema: {
        title: '跳转到新标签',
        component: 'Select',
        componentProps: {
          allowClear: true,
          required: false,
          options: [
            {
              value: '_blank',
              label: '新标签页'
            },
            {
              value: '_self',
              label: '当前标签页'
            }
          ]
        }
      }
    },
    loading: {
      schemaType: 'props',
      category: 'basic',
      value: false,
      defaultValue: false,
      valueType: 'boolean',
      valueSource: 'editorInput',
      schema: {
        title: '加载状态',
        component: 'Switch',
        required: false,
      }
    },
    shape: {
      schemaType: 'props',
      category: 'basic',
      value: 'default',
      defaultValue: 'default',
      valueType: 'string',
      valueSource: 'editorInput',
      schema: {
        title: '按钮形状',
        component: 'Select',
        componentProps: {
          allowClear: true,
          required: false,
          options: [
            {
              value: 'default',
              label: '默认'
            },
            {
              value: 'circle',
              label: '圆形'
            },
            {
              value: 'round',
              label: '圆角'
            }
          ]
        }
      }
    },
    size: {
      schemaType: 'props',
      category: 'basic',
      value: 'middle',
      defaultValue: 'middle',
      valueType: 'string',
      valueSource: 'editorInput',
      schema: {
        title: '按钮尺寸',
        component: 'Select',
        componentProps: {
          allowClear: true,
          required: false,
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
    style: generateDefaultStyleConfig({ padding: 8 }),
    onClick: {
      schemaType: 'props',
      title: '左键点击',
      category: 'event',
      value: undefined,
      valueType: 'function',
      valueSource: 'handler',
    },
  },
  children: {
    type: 'text',
    value: '按钮',
    schema: {
      title: '标题',
      component: 'Input',
      type: 'string',
    }
  },
});

// children: {
//   name: 'children',
//   type: 'string',
//   title: '标题',
//   component: 'Input',
//   initialValue: '按钮'
// }