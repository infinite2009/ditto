import { FC } from 'react';
import {
  Affix,
  Alert,
  Anchor,
  Avatar,
  Badge,
  Calendar,
  Card,
  Carousel,
  Cascader,
  Checkbox,
  Col,
  Collapse,
  ColorPicker,
  DatePicker,
  Descriptions,
  Divider,
  Dropdown,
  Empty,
  FloatButton,
  Input,
  InputNumber,
  List,
  Pagination,
  Popconfirm,
  Popover,
  Radio,
  Rate,
  Result,
  Row,
  Slider,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  TimePicker,
  Tooltip,
  Transfer,
  Tree,
  TreeSelect,
  Upload
} from 'antd';

import IComponentConfig, { IPropsConfigItem } from '@/types/component-config';
import {
  AnchorIcon,
  AvatarIcon,
  CarouselIcon,
  CheckboxIcon,
  CollapseIcon,
  ComponentDefaultIcon,
  DatePickerIcon,
  DrawerIcon,
  EmptyIcon,
  FormIcon,
  ImageIcon,
  InputIcon,
  ListIcon,
  ModalIcon,
  PaginationIcon,
  PopoverIcon,
  SearchIcon,
  SelectIcon,
  SliderIcon,
  StepsIcon,
  SwitchIcon,
  TableIcon,
  TabsIcon,
  TagIcon,
  TextIcon,
  TransferIcon,
  TreeSelectIcon,
  UploadIcon
} from '@/components/icon';
import { nanoid } from 'nanoid';
import EditComp from '@/components/EditComp';
import { ComponentConfig, NativeComponentsConfig } from '../components';
import ComponentFeature from '@/types/component-feature';
import { generateDefaultStyleConfig } from './utils';
import AdaptedForm from '@/pages/designer/components/adapted-components/form';

export type Mode = 'preview' | 'edit';

const typographyTransformerStr = `return ((values) => {
        if (!values) {
            return {};
        }
        const result = {};
        const {
            strong,
            italic,
            underline
        } = values;
        const arr = [];
        if (values.delete) {
            arr.push('line-through');
        }
        if (underline) {
            arr.push('underline');
        }
        if (arr.length) {
            result.textDecoration = arr.join(' ');
        }
        if (italic) {
            result.fontStyle = 'italic';
        }
        if (strong) {
            result.fontWeight = 600;
        }
        return result;
    })(values);`;

export const nativeComponentConfig: Record<string, IComponentConfig> = {
  ...NativeComponentsConfig
};

export const antdComponentConfig: Record<string, IComponentConfig> = {
  ...NativeComponentsConfig,
  ...ComponentConfig,
  Amount: {
    configName: 'Amount',
    name: 'Amount',
    importName: 'Typography',
    callingName: 'Typography.Text',
    dependency: 'antd',
    component: EditComp.Text,
    categories: ['常用'],
    title: '金额',
    isHidden: false,
    icon: TextIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ padding: 8 }),
      copyable: {
        id: 'copyable',
        schemaType: 'props',
        name: 'copyable',
        title: '可复制',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      delete: {
        id: 'delete',
        schemaType: 'props',
        name: 'delete',
        title: '删除线',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: 'disabled',
        title: '禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      editable: {
        id: 'editable',
        name: 'editable',
        title: '可编辑',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      ellipsis: {
        id: 'ellipsis',
        name: 'ellipsis',
        title: '自动省略',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      mark: {
        id: 'mark',
        name: 'mark',
        title: '添加标记',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      strong: {
        id: 'strong',
        name: 'strong',
        title: '加粗',
        schemaType: 'props',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      italic: {
        id: 'italic',
        name: 'italic',
        title: '斜体',
        schemaType: 'props',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      underline: {
        id: 'underline',
        title: '下划线',
        name: 'underline',
        schemaType: 'props',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      }
    },
    transformerStr: typographyTransformerStr,
    children: {
      name: 'children',
      value: '100.00',
      type: 'text',
      category: 'children'
    }
  },
  Paragraph: {
    configName: 'Paragraph',
    name: 'Paragraph',
    importName: 'Typography',
    callingName: 'Typography.Paragraph',
    dependency: 'antd',
    component: EditComp.Paragraph,
    isHidden: false,
    categories: ['常用'],
    title: '段落',
    icon: TextIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ padding: 0 }),
      copyable: {
        id: 'copyable',
        schemaType: 'props',
        name: 'copyable',
        title: '可复制',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      delete: {
        id: 'delete',
        schemaType: 'props',
        name: 'delete',
        title: '删除线',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: 'disabled',
        title: '禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      editable: {
        id: 'editable',
        name: 'editable',
        title: '可编辑',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      ellipsis: {
        id: 'ellipsis',
        name: 'ellipsis',
        title: '自动省略',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      mark: {
        id: 'mark',
        name: 'mark',
        title: '添加标记',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      strong: {
        id: 'strong',
        name: 'strong',
        title: '加粗',
        schemaType: 'props',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      italic: {
        id: 'italic',
        name: 'italic',
        title: '斜体',
        schemaType: 'props',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      underline: {
        id: 'underline',
        title: '下划线',
        name: 'underline',
        schemaType: 'props',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      }
    },
    transformerStr: typographyTransformerStr,
    children: {
      name: 'children',
      value: '默认段落',
      type: 'text',
      category: 'children'
    }
  },
  Title: {
    configName: 'Title',
    name: 'Title',
    importName: 'Typography',
    callingName: 'Typography.Title',
    dependency: 'antd',
    component: EditComp.Title,
    isHidden: false,
    categories: ['常用'],
    title: '标题',
    icon: TextIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ padding: 0 }),
      copyable: {
        id: 'copyable',
        schemaType: 'props',
        name: 'copyable',
        title: '可复制',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      delete: {
        id: 'delete',
        schemaType: 'props',
        name: 'delete',
        title: '删除线',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: 'disabled',
        title: '禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      editable: {
        id: 'editable',
        name: 'editable',
        title: '可编辑',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      ellipsis: {
        id: 'ellipsis',
        name: 'ellipsis',
        title: '自动省略',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      mark: {
        id: 'mark',
        name: 'mark',
        title: '添加标记',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      strong: {
        id: 'strong',
        name: 'strong',
        title: '加粗',
        schemaType: 'props',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      italic: {
        id: 'italic',
        name: 'italic',
        title: '斜体',
        schemaType: 'props',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      underline: {
        id: 'underline',
        title: '下划线',
        name: 'underline',
        schemaType: 'props',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      }
    },
    transformerStr: typographyTransformerStr,
    children: {
      name: 'children',
      value: '默认标题',
      type: 'text',
      category: 'children'
    }
  },
  Divider: {
    configName: 'Divider',
    name: 'Divider',
    dependency: 'antd',
    component: Divider,
    categories: ['常用'],
    title: '分割线',
    icon: ComponentDefaultIcon,
    propsConfig: {
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        valueType: 'object',
        valueSource: 'editorInput',
        value: {}
      },
      type: {
        id: 'type',
        schemaType: 'props',
        name: 'type',
        title: '样式',
        category: 'basic',
        valueType: 'object',
        valueSource: 'editorInput',
        value: 'vertical'
      },
      dashed: {
        id: 'dashed',
        schemaType: 'props',
        name: 'dashed',
        title: '是否虚线',
        category: 'basic',
        value: true,
        defaultValue: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      }
    }
    // children: {
    //   name: 'children',
    //   type: 'text',
    //   value: undefined,
    //   category: 'children'
    // }
  },
  Anchor: {
    configName: 'Anchor',
    name: 'Anchor',
    dependency: 'antd',
    component: Anchor,
    categories: ['导航'],
    title: '锚点',
    icon: AnchorIcon,
    propsConfig: {
      style: generateDefaultStyleConfig(),
      affix: {
        id: 'affix',
        schemaType: 'props',
        name: 'affix',
        title: '开启固定模式',
        valueSource: 'editorInput',
        category: 'basic',
        value: true,
        valueType: 'boolean'
      },
      items: {
        id: 'items',
        schemaType: 'props',
        name: 'items',
        title: '数据项',
        valueSource: 'editorInput',
        valueType: 'object',
        templateKeyPathsReg: [
          {
            type: 'object',
            path: '\\[\\d+\\]\\.children'
          }
        ],
        value: [
          {
            key: nanoid(),
            href: undefined,
            title: '新建锚点1'
          },
          {
            key: nanoid(),
            href: undefined,
            title: '新建锚点2'
          },
          {
            key: nanoid(),
            href: undefined,
            title: '新建锚点3'
          }
        ],
        category: 'basic'
      },
      direction: {
        id: 'direction',
        schemaType: 'props',
        name: 'direction',
        title: '数据项',
        valueSource: 'editorInput',
        valueType: 'object',
        value: 'horizontal',
        defaultValue: 'horizontal',
        category: 'basic'
      },
      offsetTop: {
        id: 'offsetTop',
        schemaType: 'props',
        name: 'offsetTop',
        title: '偏移量',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      }
    }
  },
  // Breadcrumb: {
  //   configName: 'Breadcrumb',name: 'Breadcrumb',
  //   dependency: 'antd',
  //   component: Breadcrumb,
  //   categories: ['导航'],
  //   title: '面包屑',
  //   icon: BreadCrumbIcon,
  //   propsConfig: {}
  // },
  Dropdown: {
    configName: 'Dropdown',
    name: 'Dropdown',
    dependency: 'antd',
    component: Dropdown,
    categories: ['导航'],
    isHidden: false,
    title: '下拉菜单',
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  Pagination: {
    configName: 'Pagination',
    name: 'Pagination',
    dependency: 'antd',
    component: Pagination,
    categories: ['导航'],
    isHidden: false,
    title: '分页',
    icon: PaginationIcon,
    propsConfig: {}
  },
  Steps: {
    configName: 'Steps',
    name: 'Steps',
    dependency: 'antd',
    component: Steps,
    categories: ['导航'],
    title: '步骤条',
    icon: StepsIcon,
    propsConfig: {
      items: {
        schemaType: 'props',
        title: '数据源',
        id: 'items',
        name: 'items',
        category: 'basic',
        value: [
          {
            key: nanoid(),
            title: 'Finished',
            subTitle: 'sub title',
            description: 'description',
            status: 'finish',
            icon: {}
          },
          {
            key: nanoid(),
            title: 'In Progress',
            subTitle: 'sub title',
            description: 'description',
            status: 'process'
          },
          {
            key: nanoid(),
            title: 'Waiting',
            subTitle: 'sub title',
            description: 'description',
            status: 'wait'
          }
        ],
        templateKeyPathsReg: [
          {
            type: 'object',
            path: '\\[\\d+\\]\\.icon'
          }
        ],
        valueSource: 'editorInput',
        valueType: 'object'
      },
      style: generateDefaultStyleConfig(),
      current: {
        id: 'current',
        schemaType: 'props',
        name: 'current',
        title: '当前步骤',
        category: 'basic',
        value: 0,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      type: {
        id: 'type',
        schemaType: 'props',
        name: 'type',
        title: '步骤条类型',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic',
        value: 'default'
      },
      direction: {
        id: 'direction',
        schemaType: 'props',
        name: 'direction',
        title: '步骤条方向',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic',
        value: 'horizontal'
      },
      labelPlacement: {
        id: 'labelPlacement',
        schemaType: 'props',
        name: 'labelPlacement',
        title: '标签位置',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic',
        value: 'horizontal'
      },
      size: {
        id: 'size',
        schemaType: 'props',
        name: 'size',
        title: '尺寸',
        category: 'basic',
        valueType: 'string',
        valueSource: 'editorInput',
        value: 'default'
      },
      progressDot: {
        id: 'progressDot',
        schemaType: 'props',
        name: 'progressDot',
        title: '点状步骤条',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'editorInput',
        value: false
      }
    }
  },
  Input: {
    configName: 'Input',
    name: 'Input',
    callingName: 'Input',
    dependency: 'antd',
    component: Input,
    categories: ['常用', '信息录入'],
    title: '输入框',
    icon: InputIcon,
    propsConfig: {
      allowClear: {
        id: 'allowClear',
        schemaType: 'props',
        name: 'allowClear',
        title: '是否展示清除按钮',
        category: 'basic',
        value: true,
        defaultValue: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      bordered: {
        id: 'bordered',
        schemaType: 'props',
        name: 'bordered',
        title: '是否展示边框',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      maxLength: {
        id: 'maxLength',
        schemaType: 'props',
        name: 'maxLength',
        title: '内容最大长度',
        category: 'basic',
        value: 1000,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      showCount: {
        id: 'showCount',
        schemaType: 'props',
        name: 'showCount',
        title: '是否展示字数',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      // value: {
      //   id: 'value',
      //   name: 'value',
      //   title: '值',
      //   schemaType: 'props',
      //   isValue: true,
      //   value: '',
      //   defaultValue: '',
      //   category: 'hidden',
      //   valueType: 'string',
      //   valueSource: 'userInput'
      // },
      onChange: {
        id: 'onChange',
        schemaType: 'props',
        isValue: false,
        name: 'onChange',
        title: '值变化',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      },
      onBlur: {
        id: 'onBlur',
        schemaType: 'props',
        name: 'onBlur',
        title: '失焦',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      },
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        valueType: 'object',
        valueSource: 'editorInput'
      },
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: '提示词',
        category: 'basic',
        value: '请输入',
        defaultValue: '请输入',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      defaultValue: {
        id: 'defaultValue',
        schemaType: 'props',
        name: 'defaultValue',
        title: '默认值',
        category: 'basic',
        value: '',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  'Input.Search': {
    name: 'Input.Search',
    configName: 'Input.Search',
    callingName: 'Input.Search',
    dependency: 'antd',
    component: Input.Search,
    importName: 'Input',
    categories: ['常用', '信息录入'],
    title: '搜索框',
    icon: SearchIcon,
    propsConfig: {
      allowClear: {
        id: 'allowClear',
        schemaType: 'props',
        name: 'allowClear',
        title: '是否展示清除按钮',
        category: 'basic',
        value: true,
        defaultValue: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      bordered: {
        id: 'bordered',
        schemaType: 'props',
        name: 'bordered',
        title: '是否展示边框',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      maxLength: {
        id: 'maxLength',
        schemaType: 'props',
        name: 'maxLength',
        title: '内容最大长度',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      showCount: {
        id: 'showCount',
        schemaType: 'props',
        name: 'showCount',
        title: '是否展示字数',
        category: 'basic',
        value: false,
        defaultValue: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      onInput: {
        id: 'onInput',
        schemaType: 'props',
        name: 'onInput',
        title: '用户输入',
        category: 'event',
        value: [],
        valueSource: 'handler',
        valueType: 'function'
      },
      onChange: {
        id: 'onChange',
        schemaType: 'props',
        name: 'onChange',
        title: '发生变更',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      },
      onBlur: {
        id: 'onBlur',
        schemaType: 'props',
        name: 'onBlur',
        title: '失焦',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      },
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: '提示词',
        category: 'basic',
        value: '请输入',
        defaultValue: '请输入',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  // WARNING: 这里的key需要与 configName、src/service/form/index.ts 中的 key、configName 保持一致
  'Input.TextArea': {
    name: 'Input.TextArea',
    configName: 'Input.TextArea',
    callingName: 'Input.TextArea',
    importName: 'Input',
    dependency: 'antd',
    component: Input.TextArea,
    categories: ['常用', '信息录入'],
    title: '多行文本',
    icon: InputIcon,
    propsConfig: {
      allowClear: {
        id: 'allowClear',
        schemaType: 'props',
        name: 'allowClear',
        title: '是否展示清除按钮',
        category: 'basic',
        value: true,
        defaultValue: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      bordered: {
        id: 'bordered',
        schemaType: 'props',
        name: 'bordered',
        title: '是否展示边框',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      maxLength: {
        id: 'maxLength',
        schemaType: 'props',
        name: 'maxLength',
        title: '内容最大长度',
        category: 'basic',
        value: 1000,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      showCount: {
        id: 'showCount',
        schemaType: 'props',
        name: 'showCount',
        title: '是否展示字数',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      defaultValue: {
        id: 'defaultValue',
        schemaType: 'props',
        name: 'defaultValue',
        title: '默认值',
        category: 'basic',
        value: undefined,
        valueType: 'string',
        valueSource: 'editorInput'
      },
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: '提示词',
        category: 'basic',
        value: '请输入',
        defaultValue: '请输入',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      onChange: {
        id: 'onChange',
        schemaType: 'props',
        name: 'onChange',
        title: '值变化',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      },
      onBlur: {
        id: 'onBlur',
        schemaType: 'props',
        name: 'onBlur',
        title: '失焦',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      }
    }
  },
  'Input.Password': {
    name: 'Input.Password',
    configName: 'Input.Password',
    callingName: 'Input.Password',
    dependency: 'antd',
    component: Input.Password,
    importName: 'Input',
    categories: ['常用', '信息录入'],
    title: '密码框',
    icon: InputIcon,
    propsConfig: {
      allowClear: {
        id: 'allowClear',
        schemaType: 'props',
        name: 'allowClear',
        title: '是否展示清除按钮',
        category: 'basic',
        value: true,
        defaultValue: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      bordered: {
        id: 'bordered',
        schemaType: 'props',
        name: 'bordered',
        title: '是否展示边框',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      maxLength: {
        id: 'maxLength',
        schemaType: 'props',
        name: 'maxLength',
        title: '内容最大长度',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      showCount: {
        id: 'showCount',
        schemaType: 'props',
        name: 'showCount',
        title: '是否展示字数',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      onChange: {
        id: 'onChange',
        schemaType: 'props',
        name: 'onChange',
        title: '左键点击',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      },
      onBlur: {
        id: 'onBlur',
        schemaType: 'props',
        name: 'onBlur',
        title: '失焦',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      },
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: '提示词',
        category: 'basic',
        value: '请输入',
        defaultValue: '请输入',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  InputNumber: {
    configName: 'InputNumber',
    name: 'InputNumber',
    dependency: 'antd',
    component: InputNumber,
    categories: ['常用', '信息录入'],
    title: '数字输入框',
    icon: InputIcon,
    propsConfig: {
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: '提示词',
        category: 'basic',
        value: '请输入',
        defaultValue: '请输入',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      defaultValue: {
        id: 'defaultValue',
        schemaType: 'props',
        name: 'defaultValue',
        title: '默认值',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      controls: {
        id: 'controls',
        schemaType: 'props',
        name: 'controls',
        title: '是否显示增减按钮',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },

      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: 'disabled',
        title: '是否禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      max: {
        id: 'max',
        schemaType: 'props',
        name: 'max',
        title: '最大值',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      min: {
        id: 'min',
        schemaType: 'props',
        name: 'min',
        title: '最小值',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      precision: {
        id: 'precision',
        schemaType: 'props',
        name: 'precision',
        title: '数值精度',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      }
    }
  },
  Cascader: {
    configName: 'Cascader',
    name: 'Cascader',
    dependency: 'antd',
    component: Cascader,
    categories: ['常用', '信息录入'],
    title: '级联选择',
    icon: ComponentDefaultIcon,
    propsConfig: {
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      defaultValue: {
        id: 'defaultValue',
        name: 'defaultValue',
        schemaType: 'props',
        title: '默认值',
        category: 'basic',
        value: ['0-0', 'A', 'a2'],
        valueType: 'array',
        valueSource: 'editorInput'
      },
      options: {
        id: 'options',
        schemaType: 'props',
        name: 'options',
        title: '选项',
        category: 'basic',
        value: [
          {
            label: 'root',
            value: '0-0',
            children: [
              {
                label: 'A',
                value: 'A',
                children: [
                  {
                    label: 'a1',
                    value: 'a1'
                  },
                  {
                    label: 'a2',
                    value: 'a2'
                  },
                  {
                    label: 'a3',
                    value: 'a3'
                  }
                ]
              },
              {
                label: 'B',
                value: 'B'
              },
              {
                label: 'C',
                value: 'C'
              }
            ]
          }
        ],
        valueType: 'array',
        valueSource: 'userInput'
      },
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: '提示词',
        category: 'basic',
        value: '请选择',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      size: {
        schemaType: 'props',
        title: '输入框大小',
        id: 'size',
        name: 'size',
        category: 'basic',
        value: undefined,
        valueSource: 'editorInput',
        valueType: 'string'
      },
      allowClear: {
        id: 'allowClear',
        schemaType: 'props',
        name: 'allowClear',
        title: '是否支持清除',
        category: 'basic',
        value: true,
        defaultValue: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      multiple: {
        id: 'multiple',
        schemaType: 'props',
        name: 'multiple',
        title: '是否支持多选节点',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      showSearch: {
        id: 'showSearch',
        schemaType: 'props',
        name: 'showSearch',
        title: '是否允许搜索',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        title: 'title',
        category: 'basic',
        value: '',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  Checkbox: {
    configName: 'Checkbox',
    name: 'Checkbox',
    dependency: 'antd',
    component: Checkbox,
    categories: ['信息录入'],
    title: '多选框',
    icon: CheckboxIcon,
    propsConfig: {}
  },
  ColorPicker: {
    configName: 'ColorPicker',
    name: 'ColorPicker',
    dependency: 'antd',
    component: ColorPicker,
    categories: ['数据录入'],
    title: '颜色选择器',
    isHidden: false,
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  RangePicker: {
    configName: 'RangePicker',
    callingName: 'DatePicker.RangePicker',
    importName: 'DatePicker',
    name: 'RangePicker',
    dependency: 'antd',
    component: DatePicker.RangePicker as unknown as FC,
    categories: ['常用', '信息录入', '数据展示'],
    title: '时间范围选择器',
    icon: DatePickerIcon,
    propsConfig: {
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: '提示词',
        category: 'basic',
        value: ['请选择', '请选择'],
        valueType: 'array',
        valueSource: 'editorInput'
      },
      allowClear: {
        id: 'allowClear',
        schemaType: 'props',
        name: 'allowClear',
        title: '是否允许清除',
        category: 'basic',
        value: true,
        defaultValue: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      allowEmpty: {
        id: 'allowEmpty',
        schemaType: 'props',
        name: 'allowEmpty',
        title: '是否允许起始项部分为空',
        category: 'basic',
        value: [true, false],
        valueType: 'array',
        valueSource: 'editorInput'
      },
      // disabled: {
      //   id: 'disabled',
      //   schemaType: 'props',
      //   name: 'disabled',
      //   title: '是否禁用起始项',
      //   category: 'basic',
      //   value: [false, false],
      //   valueType: 'array',
      //   valueSource: 'editorInput'
      // },
      defaultValue: {
        id: 'defaultValue',
        schemaType: 'props',
        name: 'defaultValue',
        title: '默认值',
        category: 'basic',
        value: [],
        valueType: 'array',
        valueSource: 'editorInput'
      },
      showTime: {
        id: 'showTime',
        schemaType: 'props',
        name: 'showTime',
        title: '是否显示时分秒',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        title: 'title',
        category: 'basic',
        value: '',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  Row: {
    configName: 'Row',
    name: 'Row',
    dependency: 'antd',
    component: Row,
    categories: [],
    isHidden: false,
    title: '行',
    icon: ComponentDefaultIcon,
    propsConfig: {
      gutter: {
        id: 'gutter',
        schemaType: 'props',
        name: 'gutter',
        title: '栅格数',
        category: 'basic',
        value: 0,
        valueType: 'number',
        valueSource: 'editorInput'
      }
    }
  },
  Col: {
    configName: 'Col',
    name: 'Col',
    dependency: 'antd',
    component: Col,
    categories: [],
    isHidden: false,
    title: '列',
    icon: ComponentDefaultIcon,
    propsConfig: {
      span: {
        id: 'span',
        schemaType: 'props',
        name: 'span',
        title: '格数',
        category: 'basic',
        value: 0,
        valueType: 'number',
        valueSource: 'editorInput'
      }
    }
  },
  Form: {
    configName: 'Form',
    name: 'Form',
    component: AdaptedForm,
    categories: ['常用', '信息录入'],
    title: '表单',
    dependency: 'antd',
    icon: FormIcon,
    feature: ComponentFeature.blackBox,
    propsConfig: {
      style: generateDefaultStyleConfig(),
      layout: {
        id: 'layout',
        schemaType: 'props',
        name: 'layout',
        title: '布局',
        category: 'basic',
        value: 'horizontal',
        defaultValue: 'horizontal',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      onFinish: {
        id: 'onFinish',
        schemaType: 'props',
        name: 'onFinish',
        title: '提交',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      }
    },
    children: {
      value: [],
      type: 'template',
      name: 'children',
      category: 'children',
      notDraggable: true
    }
  },
  FormItem: {
    configName: 'FormItem',
    name: 'FormItem',
    callingName: 'Form.Item',
    component: EditComp.FormItem,
    categories: ['信息录入'],
    title: '表单项',
    dependency: 'antd',
    icon: ComponentDefaultIcon,
    isHidden: true,
    propsConfig: {
      name: {
        id: 'name',
        schemaType: 'props',
        name: 'name',
        title: '字段名',
        category: 'basic',
        value: '默认name',
        defaultValue: '默认name',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      label: {
        id: 'label',
        schemaType: 'props',
        name: 'label',
        title: '字段标题',
        category: 'basic',
        value: '默认字段',
        defaultValue: '默认字段',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      noStyle: {
        id: 'noStyle',
        schemaType: 'props',
        name: 'noStyle',
        title: '无样式',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      rules: {
        id: 'rules',
        schemaType: 'props',
        name: 'rules',
        title: '校验规则',
        category: 'basic',
        value: undefined,
        valueType: 'array',
        valueSource: 'editorInput',
        defaultValue: undefined
      }
    },
    children: {
      value: [],
      type: 'template',
      name: 'children',
      category: 'children'
    }
  },
  Radio: {
    configName: 'Radio',
    name: 'Radio',
    dependency: 'antd',
    component: Radio,
    categories: ['信息录入'],
    title: '单选框',
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  RadioGroup: {
    configName: 'RadioGroup',
    name: 'RadioGroup',
    importName: 'Radio',
    callingName: 'Radio.Group',
    dependency: 'antd',
    component: Radio.Group,
    categories: ['信息录入'],
    title: '单选框组',
    icon: ComponentDefaultIcon,
    propsConfig: {
      style: generateDefaultStyleConfig(),
      defaultValue: {
        schemaType: 'props',
        title: '值',
        id: 'defaultValue',
        name: 'defaultValue',
        category: 'basic',
        isValue: true,
        valueSource: 'userInput',
        valueType: 'string',
        value: undefined
      },
      options: {
        schemaType: 'props',
        title: '选项',
        id: 'options',
        name: 'options',
        category: 'basic',
        isValue: true,
        valueSource: 'editorInput',
        valueType: 'array',
        value: [
          {
            value: '0',
            label: '选项1'
          },
          {
            value: '1',
            label: '选项2'
          },
          {
            value: '2',
            label: '选项3'
          }
        ]
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: 'disabled',
        title: '禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      size: {
        id: 'size',
        schemaType: 'props',
        name: 'size',
        title: '尺寸',
        category: 'basic',
        value: 'default',
        defaultValue: 'default',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      buttonStyle: {
        id: 'buttonStyle',
        schemaType: 'props',
        name: 'buttonStyle',
        title: '风格样式',
        category: 'basic',
        value: 'outline',
        defaultValue: 'outline',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      optionType: {
        id: 'optionType',
        schemaType: 'props',
        name: 'optionType',
        title: 'options 类型',
        category: 'basic',
        value: 'default',
        defaultValue: 'default',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  Rate: {
    configName: 'Rate',
    name: 'Rate',
    component: Rate,
    categories: ['信息录入'],
    title: '评分',
    dependency: 'antd',
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  Select: {
    configName: 'Select',
    name: 'Select',
    dependency: 'antd',
    component: EditComp.Select,
    categories: ['常用', '信息录入'],
    title: '选择器',
    icon: SelectIcon,
    propsConfig: {
      style: generateDefaultStyleConfig(),
      defaultValue: {
        schemaType: 'props',
        title: '值',
        id: 'defaultValue',
        name: 'defaultValue',
        category: 'basic',
        isValue: true,
        valueSource: 'userInput',
        valueType: 'string',
        value: undefined
      },
      options: {
        schemaType: 'props',
        title: '选项',
        id: 'options',
        name: 'options',
        category: 'basic',
        isValue: true,
        valueSource: 'editorInput',
        valueType: 'array',
        value: [
          {
            value: '0',
            label: '选项1'
          },
          {
            value: '1',
            label: '选项2'
          },
          {
            value: '2',
            label: '选项3'
          }
        ]
      },
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: 'placeholder',
        category: 'basic',
        value: '请选择',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      onChange: {
        id: 'onChange',
        schemaType: 'props',
        name: 'onChange',
        title: '左键点击',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      },
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        title: 'title',
        category: 'basic',
        value: undefined,
        defaultValue: undefined,
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  Slider: {
    configName: 'Slider',
    name: 'Slider',
    dependency: 'antd',
    component: Slider,
    categories: ['信息录入'],
    title: '滑动输入条',
    icon: SliderIcon,
    propsConfig: {
      defaultValue: {
        id: 'defaultValue',
        schemaType: 'props',
        name: 'defaultValue',
        title: '默认值',
        category: 'basic',
        valueType: 'array',
        valueSource: 'userInput'
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: 'disabled',
        title: '禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      range: {
        id: 'range',
        schemaType: 'props',
        name: 'range',
        title: '双滑块模式',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      min: {
        id: 'min',
        schemaType: 'props',
        name: 'min',
        title: '最大值',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      max: {
        id: 'max',
        schemaType: 'props',
        name: 'max',
        title: '最大值',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      step: {
        id: 'step',
        schemaType: 'props',
        name: 'step',
        title: '步长',
        category: 'basic',
        value: undefined,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      reverse: {
        id: 'reverse',
        schemaType: 'props',
        name: 'reverse',
        title: '反向坐标轴',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      style: generateDefaultStyleConfig()
    }
  },
  Switch: {
    configName: 'Switch',
    name: 'Switch',
    dependency: 'antd',
    component: Switch,
    categories: ['信息录入'],
    title: '开关',
    icon: SwitchIcon,
    propsConfig: {
      defaultChecked: {
        id: 'defaultChecked',
        schemaType: 'props',
        name: 'defaultChecked',
        title: '默认选中',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: 'disabled',
        title: '禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      loading: {
        id: 'loading',
        schemaType: 'props',
        name: 'loading',
        title: '加载中',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      size: {
        id: 'size',
        schemaType: 'props',
        name: 'size',
        title: '尺寸',
        category: 'basic',
        value: 'default',
        defaultValue: 'default',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      checkedChildren: {
        id: 'checkedChildren',
        schemaType: 'props',
        name: 'checkedChildren',
        title: '选中时的内容',
        category: 'basic',
        value: undefined,
        valueType: 'string',
        valueSource: 'editorInput'
      },
      unCheckedChildren: {
        id: 'unCheckedChildren',
        schemaType: 'props',
        name: 'unCheckedChildren',
        title: '选中时的内容',
        category: 'basic',
        value: undefined,
        valueType: 'string',
        valueSource: 'editorInput'
      },
      style: generateDefaultStyleConfig()
    }
  },
  TimePicker: {
    configName: 'TimePicker',
    name: 'TimePicker',
    dependency: 'antd',
    component: TimePicker,
    categories: ['常用', '信息录入', '数据展示'],
    title: '时间选择器',
    icon: DatePickerIcon,
    propsConfig: {}
  },
  Transfer: {
    configName: 'Transfer',
    name: 'Transfer',
    component: Transfer,
    categories: ['信息录入'],
    title: '穿梭框',
    dependency: 'antd',
    icon: TransferIcon,
    propsConfig: {
      dataSource: {
        schemaType: 'props',
        title: '数据源',
        id: 'dataSource',
        name: 'dataSource',
        category: 'basic',
        value: [
          {
            key: nanoid(),
            title: 'content1',
            description: 'content1描述',
            disabled: false
          },
          {
            key: nanoid(),
            title: 'content2',
            description: 'content2描述',
            disabled: false
          },
          {
            key: nanoid(),
            title: 'content3',
            description: 'content3描述',
            disabled: false
          },
          {
            key: nanoid(),
            title: 'content4',
            description: 'content4描述',
            disabled: false
          },
          {
            key: nanoid(),
            title: 'content5',
            description: 'content5描述',
            disabled: false
          }
        ],
        isValue: true,
        valueSource: 'editorInput',
        valueType: 'array'
      },
      operations: {
        schemaType: 'props',
        title: '操作文案',
        id: 'operations',
        name: 'operations',
        category: 'basic',
        value: [],
        valueSource: 'editorInput',
        valueType: 'array'
      },
      titles: {
        schemaType: 'props',
        title: '标题集合',
        id: 'titles',
        name: 'titles',
        category: 'basic',
        value: [],
        valueSource: 'editorInput',
        valueType: 'array'
      },
      render: {
        id: 'render',
        schemaType: 'props',
        name: 'render',
        title: '数据渲染函数',
        category: 'basic',
        value: undefined,
        valueType: 'function',
        valueSource: 'editorInput',
        templateKeyPathsReg: [
          {
            path: '',
            type: 'function',
            repeatType: 'transfer',
            // 自定义代码生成片段
            customGenerateCode: [
              'item => {',
              'if (item.description) {',
              'return `${item.title}-${item.description}`;',
              '}',
              'return item.title;',
              '}'
            ]
          }
        ]
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: 'disabled',
        title: '是否禁用',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'editorInput',
        value: false
      },
      oneWay: {
        id: 'oneWay',
        schemaType: 'props',
        name: 'oneWay',
        title: '展示为单向样式',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'editorInput',
        value: false
      },
      showSearch: {
        id: 'showSearch',
        schemaType: 'props',
        name: 'showSearch',
        title: '是否显示搜索框',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'editorInput',
        value: false
      },
      pagination: {
        id: 'pagination',
        schemaType: 'props',
        name: 'pagination',
        title: '分页模式',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'editorInput',
        value: false
      },
      // 支持受控组件方式去更新targetKeys
      onChange: {
        id: 'onChange',
        schemaType: 'props',
        name: 'onChange',
        title: '左键点击',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      },
      style: generateDefaultStyleConfig(),
      targetKeys: {
        id: 'targetKeys',
        schemaType: 'props',
        name: 'targetKeys',
        title: '目标键',
        category: 'event',
        value: undefined,
        valueType: 'array',
        valueSource: 'editorInput'
      }
    }
  },
  TreeSelect: {
    configName: 'TreeSelect',
    name: 'TreeSelect',
    dependency: 'antd',
    component: TreeSelect,
    categories: ['信息录入', '数据展示'],
    title: '树选择',
    icon: TreeSelectIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ padding: 8, alignSelf: 'stretch' }),
      treeData: {
        id: 'treeData',
        schemaType: 'props',
        name: 'treeData',
        title: '数据',
        category: 'basic',
        valueType: 'string',
        valueSource: 'userInput',
        value: [
          {
            title: 'treeNode',
            value: '0-0',
            children: []
          }
        ]
      },
      multiple: {
        id: 'multiple',
        schemaType: 'props',
        name: 'multiple',
        title: '是否多选',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'userInput',
        value: false
      },
      treeDefaultExpandAll: {
        id: 'treeDefaultExpandAll',
        schemaType: 'props',
        name: 'treeDefaultExpandAll',
        title: '自动展开全部',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'editorInput',
        value: false
      },
      treeCheckable: {
        id: 'treeCheckable',
        schemaType: 'props',
        name: 'treeCheckable',
        title: '是否增加复选框',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'editorInput',
        value: false
      },
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: '提示词',
        category: 'basic',
        value: '请选择',
        defaultValue: '请选择',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        title: 'title',
        category: 'basic',
        value: '',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  Upload: {
    configName: 'Upload',
    name: 'Upload',
    dependency: 'antd',
    component: Upload,
    categories: ['信息录入'],
    title: '上传',
    icon: UploadIcon,
    propsConfig: {}
  },
  Avatar: {
    configName: 'Avatar',
    name: 'Avatar',
    dependency: 'antd',
    component: Avatar,
    categories: ['数据展示'],
    title: '头像',
    icon: AvatarIcon,
    propsConfig: {
      src: {
        schemaType: 'props',
        title: '图片地址',
        id: 'src',
        name: 'src',
        category: 'basic',
        isValue: false,
        valueSource: 'editorInput',
        valueType: 'string',
        value: ''
      },
      shape: {
        schemaType: 'props',
        title: '形状',
        id: 'shape',
        name: 'shape',
        category: 'basic',
        isValue: false,
        valueSource: 'editorInput',
        valueType: 'string',
        value: 'circle'
      },
      size: {
        schemaType: 'props',
        title: '大小',
        id: 'size',
        name: 'size',
        category: 'basic',
        isValue: false,
        valueSource: 'editorInput',
        valueType: 'string',
        value: 'default'
      }
    }
  },
  // TODO:
  Badge: {
    configName: 'Badge',
    name: 'Badge',
    dependency: 'antd',
    component: Badge,
    categories: ['数据展示'],
    title: '徽标数',
    isHidden: false,
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  Calendar: {
    configName: 'Calendar',
    name: 'Calendar',
    dependency: 'antd',
    component: Calendar,
    categories: ['数据展示'],
    title: '日历',
    icon: ComponentDefaultIcon,
    propsConfig: {
      fullscreen: {
        id: 'fullscreen',
        schemaType: 'props',
        name: 'fullscreen',
        title: '是否全屏显示',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      }
      // mode: {
      //   id: 'mode',
      //   schemaType: 'props',
      //   name: 'mode',
      //   title: '初始模式',
      //   category: 'basic',
      //   value: 'month',
      //   valueType: 'string',
      //   valueSource: 'editorInput'
      // }
    }
  },
  Card: {
    configName: 'Card',
    name: 'Card',
    component: Card,
    categories: ['数据展示'],
    title: '卡片',
    dependency: 'antd',
    isHidden: false,
    icon: ComponentDefaultIcon,
    feature: ComponentFeature.container,
    propsConfig: {}
    // danger: 容器组件不要配置children
  },
  Carousel: {
    configName: 'Carousel',
    name: 'Carousel',
    dependency: 'antd',
    component: Carousel,
    categories: ['数据展示'],
    title: '走马灯',
    icon: CarouselIcon,
    propsConfig: {}
  },
  Collapse: {
    configName: 'Collapse',
    name: 'Collapse',
    dependency: 'antd',
    component: Collapse,
    categories: ['数据展示'],
    title: '折叠面板',
    icon: CollapseIcon,
    propsConfig: {
      items: {
        id: 'items',
        schemaType: 'props',
        name: 'items',
        title: '数据项',
        valueSource: 'editorInput',
        valueType: 'object',
        templateKeyPathsReg: [
          {
            type: 'object',
            path: '\\[\\d+\\]\\.children'
          }
        ],
        value: [
          {
            key: '1',
            label: '新建面板页',
            children: {}
          }
        ],
        category: 'basic'
      },
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: { alignSelf: 'stretch' },
        valueType: 'object',
        valueSource: 'editorInput'
      }
    }
  },
  Descriptions: {
    configName: 'Descriptions',
    name: 'Descriptions',
    dependency: 'antd',
    component: Descriptions,
    categories: ['数据展示'],
    title: '描述列表',
    icon: ComponentDefaultIcon,
    propsConfig: {
      items: {
        schemaType: 'props',
        title: '数据源',
        id: 'items',
        name: 'items',
        category: 'basic',
        value: [
          {
            key: nanoid(),
            label: '内容描述',
            children: {}
          }
        ],
        valueSource: 'editorInput',
        valueType: 'object',
        templateKeyPathsReg: [
          {
            type: 'object',
            path: '\\[\\d+\\]\\.children'
          }
        ]
      },
      style: generateDefaultStyleConfig(),
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        title: '标题',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic',
        value: '描述列表标题'
      },
      bordered: {
        id: 'bordered',
        schemaType: 'props',
        name: 'bordered',
        title: '显示边框',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      column: {
        id: 'column',
        schemaType: 'props',
        name: 'column',
        title: '列数',
        category: 'basic',
        value: 3,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      size: {
        id: 'size',
        schemaType: 'props',
        name: 'size',
        title: '尺寸',
        category: 'basic',
        value: 'default',
        defaultValue: 'default',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      layout: {
        id: 'layout',
        schemaType: 'props',
        name: 'layout',
        title: '布局方向',
        category: 'basic',
        value: 'horizontal',
        defaultValue: 'horizontal',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      colon: {
        id: 'colon',
        schemaType: 'props',
        name: 'colon',
        title: '展示冒号',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      }
    }
  },
  Empty: {
    configName: 'Empty',
    name: 'Empty',
    dependency: 'antd',
    component: Empty,
    categories: ['数据展示'],
    title: '空态',
    icon: EmptyIcon,
    propsConfig: {
      image: {
        schemaType: 'props',
        title: '图片地址',
        id: 'image',
        name: 'image',
        category: 'basic',
        isValue: false,
        valueSource: 'editorInput',
        valueType: 'string',
        value: ''
      },
      description: {
        schemaType: 'props',
        title: '描述',
        id: 'description',
        name: 'description',
        category: 'basic',
        isValue: false,
        valueSource: 'editorInput',
        valueType: 'string',
        value: '暂无数据'
      }
    }
  },
  Image: {
    configName: 'Image',
    name: 'Image',
    dependency: 'antd',
    component: Image as unknown as FC,
    categories: ['数据展示'],
    title: '图片',
    icon: ImageIcon,
    propsConfig: {
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      preview: {
        id: 'preview',
        schemaType: 'props',
        name: 'preview',
        title: '预览',
        category: 'hidden',
        value: false,
        valueSource: 'editorInput',
        valueType: 'boolean'
      },
      src: {
        schemaType: 'props',
        title: '数据源',
        id: 'src',
        name: 'src',
        category: 'basic',
        value: undefined,
        isValue: true,
        valueSource: 'editorInput',
        valueType: 'array'
      }
    }
  },
  Placeholder: {
    configName: 'Placeholder',
    name: 'Placeholder',
    dependency: 'antd',
    callingName: 'Image',
    component: Image as unknown as FC,
    categories: ['常用', '数据展示'],
    title: '占位符（请勿滥用）',
    icon: ImageIcon,
    propsConfig: {
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      preview: {
        id: 'preview',
        schemaType: 'props',
        name: 'preview',
        title: '预览',
        category: 'hidden',
        value: false,
        valueSource: 'editorInput',
        valueType: 'boolean'
      },
      src: {
        schemaType: 'props',
        title: '数据源',
        id: 'src',
        name: 'src',
        category: 'basic',
        value: undefined,
        isValue: true,
        valueSource: 'editorInput',
        valueType: 'array'
      },
      alt: {
        schemaType: 'props',
        title: '替代文本',
        id: 'alt',
        name: 'alt',
        category: 'basic',
        value: '这是一个占位符，请前往「基础」配置URL',
        valueSource: 'editorInput',
        valueType: 'string'
      }
    }
  },
  List: {
    configName: 'List',
    name: 'List',
    component: List,
    categories: ['常用'],
    title: '列表',
    dependency: 'antd',
    icon: ListIcon,
    feature: ComponentFeature.WITH_SLOTS,
    propsConfig: {
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      dataSource: {
        schemaType: 'props',
        title: '数据源',
        id: 'dataSource',
        name: 'dataSource',
        category: 'basic',
        value: [],
        isValue: true,
        valueSource: 'editorInput',
        valueType: 'array'
      },
      renderItem: {
        schemaType: 'props',
        title: '渲染项',
        id: 'renderItem',
        name: 'renderItem',
        category: 'basic',
        templateKeyPathsReg: [
          {
            path: '',
            type: 'function',
            repeatType: 'list',
            indexKey: 'index',
            repeatPropRef: 'dataSource'
          }
        ],
        valueSource: 'editorInput',
        valueType: 'function',
        value: {}
      }
    },
    children: {
      name: 'children',
      value: [],
      type: 'slot',
      category: 'children',
      noRendering: true
    }
  },
  Popover: {
    configName: 'Popover',
    name: 'Popover',
    callingName: 'Popover',
    dependency: 'antd',
    component: Popover,
    categories: ['数据展示'],
    title: '气泡卡片',
    icon: PopoverIcon,
    propsConfig: {
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        title: '标题',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic',
        value: 'popover默认标题'
      },
      content: {
        id: 'content',
        schemaType: 'props',
        name: 'content',
        title: '内容',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic',
        value: 'popover默认内容'
      },
      color: {
        id: 'color',
        schemaType: 'props',
        name: 'color',
        title: '背景颜色',
        valueSource: 'editorInput',
        valueType: 'string',
        value: '#fff',
        defaultValue: '#fff',
        category: 'basic'
      },
      placement: {
        id: 'placement',
        schemaType: 'props',
        name: 'placement',
        title: '气泡位置',
        valueSource: 'editorInput',
        valueType: 'string',
        value: 'top',
        defaultValue: 'top',
        category: 'basic'
      },
      trigger: {
        id: 'trigger',
        schemaType: 'props',
        name: 'trigger',
        title: '触发行为',
        valueSource: 'editorInput',
        valueType: 'string',
        value: 'hover',
        defaultValue: 'hover',
        category: 'basic'
      },
      mouseEnterDelay: {
        id: 'mouseEnterDelay',
        schemaType: 'props',
        name: 'mouseEnterDelay',
        title: '展示延时',
        valueSource: 'editorInput',
        valueType: 'string',
        value: '0.1',
        defaultValue: '0.1',
        category: 'basic'
      },
      mouseLeaveDelay: {
        id: 'mouseLeaveDelay',
        schemaType: 'props',
        name: 'mouseLeaveDelay',
        title: '隐藏延时',
        valueSource: 'editorInput',
        valueType: 'string',
        value: '0.1',
        defaultValue: '0.1',
        category: 'basic'
      }
    },
    children: {
      value: [],
      name: 'children',
      type: 'slot',
      category: 'children'
    }
  },
  Statistic: {
    configName: 'Statistic',
    name: 'Statistic',
    dependency: 'antd',
    component: Statistic,
    categories: ['数据展示'],
    title: '统计数值',
    isHidden: false,
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  Table: {
    configName: 'Table',
    name: 'Table',
    callingName: 'Table',
    dependency: 'antd',
    component: Table,
    categories: ['常用', '数据展示'],
    title: '表格',
    feature: ComponentFeature.blackBox,
    icon: TableIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ padding: 8, alignSelf: 'stretch' }),
      pagination: {
        id: 'pagination',
        schemaType: 'props',
        name: 'pagination',
        title: '分页',
        category: 'basic',
        valueType: ['object', 'boolean'],
        valueSource: 'editorInput',
        value: {}
      },
      columns: {
        id: 'columns',
        schemaType: 'props',
        name: 'columns',
        title: '列',
        category: 'basic',
        valueType: 'array',
        valueSource: 'editorInput',
        templateKeyPathsReg: [
          {
            path: '\\[\\d+\\]\\.render',
            type: 'function',
            repeatType: 'table',
            columnKey: 'dataIndex',
            repeatPropRef: 'dataSource',
            indexKey: 'key',
            itemIndexInArgs: 1
          }
        ],
        value: [
          // {
          //   title: 'Name',
          //   dataIndex: 'name',
          //   key: 'name',
          //   render: {}
          // },
          // {
          //   title: 'Age',
          //   dataIndex: 'age',
          //   key: 'age'
          // },
          // {
          //   title: 'Action',
          //   dataIndex: 'action',
          //   key: 'action',
          //   render: {}
          // }
        ]
      },
      dataSource: {
        id: 'dataSource',
        schemaType: 'props',
        name: 'dataSource',
        title: '数据源',
        category: 'basic',
        valueType: 'array',
        valueSource: 'editorInput',
        value: [
          // {
          //   key: '1',
          //   firstName: 'John',
          //   lastName: 'Brown',
          //   age: 32,
          //   address: 'New York No. 1 Lake Park',
          //   tags: ['nice', 'developer']
          // },
          // {
          //   key: '2',
          //   name: 'Jim',
          //   lastName: 'Green',
          //   age: 42,
          //   address: 'London No. 1 Lake Park',
          //   tags: ['loser']
          // },
          // {
          //   key: '3',
          //   name: 'Joe',
          //   lastName: 'Black',
          //   age: 32,
          //   address: 'Sydney No. 1 Lake Park',
          //   tags: ['cool', 'teacher']
          // }
        ]
      }
    },
    children: {
      value: [],
      type: 'template',
      name: 'children',
      category: 'children',
      notDraggable: true,
      noRendering: true
    }
  },
  Tabs: {
    configName: 'Tabs',
    name: 'Tabs',
    dependency: 'antd',
    component: Tabs,
    categories: ['常用', '数据展示'],
    feature: ComponentFeature.WITH_SLOTS,
    title: '标签页',
    icon: TabsIcon,
    propsConfig: {
      items: {
        id: 'items',
        schemaType: 'props',
        name: 'items',
        title: '数据项',
        valueSource: 'editorInput',
        valueType: 'array',
        templateKeyPathsReg: [
          {
            type: 'object',
            path: '\\[\\d+\\]\\.children'
          }
        ],
        value: [
          {
            key: '1',
            label: '新建标签页',
            children: {}
          }
        ],
        category: 'basic'
      },
      // tabBarExtraContent: {
      //   id: 'tabBarExtraContent',
      //   schemaType: 'props',
      //   name: 'tabBarExtraContent',
      //   title: 'tabBarExtraContent',
      //   valueSource: 'editorInput',
      //   valueType: 'object',
      //   templateKeyPathsReg: [
      //     {
      //       type: 'object',
      //       path: ''
      //     }
      //   ],
      //   value: null,
      //   category: 'basic'
      // },
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        title: '样式',
        category: 'style',
        value: { alignSelf: 'stretch' },
        valueType: 'object',
        valueSource: 'editorInput'
      }
    }
  },
  Tag: {
    configName: 'Tag',
    name: 'Tag',
    component: EditComp.Tag,
    categories: ['数据展示'],
    title: '标签',
    dependency: 'antd',
    icon: TagIcon,
    propsConfig: {
      color: {
        id: 'color',
        schemaType: 'props',
        name: 'color',
        title: '颜色',
        valueSource: 'editorInput',
        valueType: 'string',
        value: '#2AC864',
        defaultValue: '#2AC864',
        category: 'basic'
      }
    },
    children: {
      name: 'children',
      type: 'text',
      value: '成功',
      category: 'children'
    }
  },
  Tooltip: {
    configName: 'Tooltip',
    name: 'Tooltip',
    dependency: 'antd',
    component: Tooltip,
    categories: ['数据展示'],
    title: '文字提示',
    icon: PopoverIcon,
    isHidden: false,
    propsConfig: {}
  },
  Tree: {
    configName: 'Tree',
    name: 'Tree',
    dependency: 'antd',
    component: Tree,
    categories: ['数据展示'],
    title: '树形控件',
    icon: TreeSelectIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ padding: 8, alignSelf: 'stretch' }),
      treeData: {
        id: 'treeData',
        schemaType: 'props',
        name: 'treeData',
        title: '数据',
        category: 'basic',
        valueType: 'string',
        valueSource: 'userInput',
        value: [
          {
            title: '节点0',
            key: '0-0',
            children: []
          }
        ]
      },
      multiple: {
        id: 'multiple',
        schemaType: 'props',
        name: 'multiple',
        title: '是否多选',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'userInput',
        value: false
      },
      defaultExpandAll: {
        id: 'defaultExpandAll',
        schemaType: 'props',
        name: 'defaultExpandAll',
        title: '自动展开全部',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'editorInput',
        value: false
      },
      // draggable: {
      //   id: 'draggable',
      //   schemaType: 'props',
      //   name: 'draggable',
      //   title: '是否可拖拽',
      //   category: 'basic',
      //   valueType: 'boolean',
      //   valueSource: 'userInput',
      //   value: false
      // },
      checkable: {
        id: 'checkable',
        schemaType: 'props',
        name: 'checkable',
        title: '是否增加 复选框',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'userInput',
        value: true
      },
      selectable: {
        id: 'selectable',
        schemaType: 'props',
        name: 'selectable',
        title: '是否可选中',
        category: 'basic',
        valueType: 'boolean',
        valueSource: 'userInput',
        value: true
      }
    }
  },
  Alert: {
    configName: 'Alert',
    name: 'Alert',
    dependency: 'antd',
    component: Alert,
    categories: ['反馈'],
    title: '警告提示',
    isHidden: false,
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  Drawer: {
    configName: 'Drawer',
    name: 'Drawer',
    dependency: 'antd',
    component: EditComp.Drawer,
    isLayer: true,
    categories: ['反馈'],
    title: '抽屉',
    icon: DrawerIcon,
    feature: ComponentFeature.WITH_SLOTS,
    propsConfig: {
      open: {
        id: 'open',
        schemaType: 'props',
        name: 'open',
        title: '显示',
        valueType: 'boolean',
        valueSource: 'state',
        category: 'basic',
        value: undefined
      },
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        title: '标题',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic',
        value: '新建抽屉'
      },
      onClose: {
        id: 'onClose',
        schemaType: 'props',
        name: 'onClose',
        title: '取消',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler',
        defaultValue: {
          name: 'open',
          value: false,
          useFunction: false
        }
      }
    },
    children: {
      value: [],
      name: 'children',
      type: 'slot',
      category: 'children'
    }
  },
  Modal: {
    configName: 'Modal',
    name: 'Modal',
    dependency: 'antd',
    component: EditComp.Modal,
    categories: ['反馈'],
    title: '弹窗',
    isLayer: true,
    icon: ModalIcon,
    feature: ComponentFeature.WITH_SLOTS,
    propsConfig: {
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        title: '标题',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic',
        value: '默认弹窗'
      },
      open: {
        id: 'open',
        schemaType: 'props',
        name: 'open',
        title: '显示',
        valueType: 'boolean',
        valueSource: 'state',
        category: 'basic',
        value: undefined
      },
      onCancel: {
        id: 'onCancel',
        schemaType: 'props',
        name: 'onCancel',
        title: '取消',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler',
        defaultValue: {
          name: 'open',
          value: false,
          useFunction: false
        }
      },
      onOk: {
        id: 'onOk',
        schemaType: 'props',
        name: 'onOk',
        title: '确定',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler',
        defaultValue: {
          name: 'open',
          value: false,
          useFunction: false
        }
      }
    },
    children: {
      value: [],
      name: 'children',
      type: 'slot',
      category: 'children'
    }
  },
  Popconfirm: {
    configName: 'Popconfirm',
    name: 'Popconfirm',
    dependency: 'antd',
    component: Popconfirm as unknown as FC,
    categories: ['反馈'],
    title: '气泡确认框',
    isHidden: false,
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  Result: {
    configName: 'Result',
    name: 'Result',
    dependency: 'antd',
    component: Result,
    categories: ['反馈'],
    title: '结果',
    isHidden: false,
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  Affix: {
    configName: 'Affix',
    name: 'Affix',
    dependency: 'antd',
    component: Affix as unknown as FC,
    categories: ['其他'],
    isHidden: false,
    title: '固定',
    icon: ComponentDefaultIcon,
    propsConfig: {}
  },
  FloatButton: {
    configName: 'FloatButton',
    name: 'FloatButton',
    dependency: 'antd',
    isHidden: false,
    component: FloatButton as unknown as FC,
    categories: ['通用'],
    title: '浮动按钮',
    icon: ComponentDefaultIcon,
    propsConfig: {}
  }
};

export const fillModeList = [
  'Input',
  // 'InputNumber',
  'TreeSelect',
  'Cascader',
  'Select',
  'Input.Search',
  'DatePicker'
];

export const fillModeConfig: IPropsConfigItem = {
  id: 'isFillMode',
  schemaType: 'props',
  name: 'isFillMode',
  title: '是否fillMode模式',
  category: 'basic',
  value: false,
  defaultValue: false,
  valueType: 'boolean',
  valueSource: 'editorInput'
};

export class ComponentManager {
  private static componentConfig: Record<string, Record<string, IComponentConfig>> = null;

  // private static defaultComponentValueConfig: Record<string, Record<string, any>> = null;

  private static mode: Mode;

  static get componentConfigDict() {
    return ComponentManager.componentConfig;
  }

  static fetchComponentConfig(configName: string, dependency: string) {
    if (!ComponentManager.componentConfig) {
      return null;
    }
    return ComponentManager.componentConfig[dependency]?.[configName] || null;
  }

  static fetchDefaultValueOf(configName: string, dependency: string) {
    const config = this.fetchComponentConfig(configName, dependency);

    if (!config) {
      return null;
    }
    const result = {};
    Object.entries(config.propsConfig).forEach(([key, props]) => {
      result[key] = props.value;
    });
    return result;
    // if (!ComponentManager.defaultComponentValueConfig) {
    //   return null;
    // }
    // return ComponentManager.defaultComponentValueConfig[dependency]?.[configName] || null;
  }

  static async init(mode: Mode = 'edit') {
    // ComponentManager.initDefaultComponentValueConfig();
    await ComponentManager.loadComponentConfigList(mode);
  }

  static async refreshComponentConfig() {
    ComponentManager.componentConfig = null;
    return await ComponentManager.loadComponentConfigList();
  }

  /**
   * 初始化组件的默认值配置
   */
  // private static initDefaultComponentValueConfig() {
  //   this.defaultComponentValueConfig = defaultComponentValueConfig;
  // }

  private static async loadComponentConfigList(mode: Mode = 'preview') {
    if (!ComponentManager.componentConfig || mode !== this.mode) {
      ComponentManager.componentConfig = {
        html: nativeComponentConfig,
        antd: antdComponentConfig,
      };
      this.mode = mode;
      return ComponentManager.componentConfig;
    }
    return ComponentManager.componentConfig;
  }
}
