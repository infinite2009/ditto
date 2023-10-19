import { FC } from 'react';
import {
  Affix,
  Alert,
  Anchor,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Carousel,
  Cascader,
  Checkbox,
  Collapse,
  ColorPicker,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  FloatButton,
  Form,
  Input,
  InputNumber,
  List,
  Mentions,
  Menu,
  Modal,
  Pagination,
  Popconfirm,
  Popover,
  Radio,
  Rate,
  Result,
  Select,
  Slider,
  Space,
  Statistic,
  Steps,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Tooltip,
  Transfer,
  Tree,
  TreeSelect,
  Typography,
  Upload
} from 'antd';
import { CodeSandboxOutlined } from '@ant-design/icons';
import IComponentConfig from '@/types/component-config';
import { createCamelotComponent } from '@/components/camelot';

const Search = Input.Search;

const antdComponentConfig: { [key: string]: IComponentConfig } = {
  pageRoot: {
    configName: 'pageRoot',
    callingName: 'Flex',
    category: 'hidden',
    dependency: 'antd',
    component: Flex,
    title: '页面',
    icon: CodeSandboxOutlined,
    propsConfig: {
      vertical: {
        id: 'vertical',
        schemaType: 'props',
        name: '垂直布局',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      gap: {
        id: 'gap',
        schemaType: 'props',
        name: '间距',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      }
    }
  },
  Flex: {
    configName: 'Flex',
    dependency: 'antd',
    isContainer: true,
    category: '常用',
    title: '弹性布局',
    icon: CodeSandboxOutlined,
    component: Flex,
    propsConfig: {
      type: {
        id: 'type',
        schemaType: 'props',
        name: 'type',
        category: 'basic',
        value: 'primary',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  Button: {
    configName: 'Button',
    dependency: 'antd',
    component: Button,
    category: '常用',
    title: '按钮',
    icon: CodeSandboxOutlined,
    propsConfig: {
      type: {
        id: 'type',
        schemaType: 'props',
        name: 'type',
        category: 'basic',
        value: 'primary',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      danger: {
        id: 'danger',
        schemaType: 'props',
        name: 'danger',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: 'disabled',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      href: {
        id: 'href',
        schemaType: 'props',
        name: 'href',
        category: 'basic',
        value: '',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      target: {
        id: 'target',
        schemaType: 'props',
        name: 'target',
        category: 'basic',
        value: '_blank',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      loading: {
        id: 'loading',
        schemaType: 'props',
        name: 'loading',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      shape: {
        id: 'shape',
        schemaType: 'props',
        name: 'shape',
        category: 'basic',
        value: 'default',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      size: {
        id: 'size',
        schemaType: 'props',
        name: 'size',
        category: 'basic',
        value: 'middle',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      style: {
        id: 'style',
        schemaType: 'props',
        name: 'style',
        category: 'style',
        value: {},
        valueType: 'object',
        valueSource: 'editorInput'
      },
      onClick: {
        id: 'onClick',
        schemaType: 'props',
        name: 'onClick',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      }
    },
    children: {
      name: 'children',
      value: '按钮',
      category: 'children'
    }
  },
  Text: {
    configName: 'Text',
    callingName: 'Typography.Text',
    dependency: 'antd',
    component: Typography.Text,
    category: '常用',
    title: '文字',
    icon: CodeSandboxOutlined,
    propsConfig: {
      copyable: {
        id: 'copyable',
        schemaType: 'props',
        name: '可复制',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      delete: {
        id: 'delete',
        schemaType: 'props',
        name: '删除线',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: '禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      editable: {
        id: 'editable',
        name: '可编辑',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      ellipsis: {
        id: 'ellipsis',
        name: '自动省略',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      mark: {
        id: 'mark',
        name: '是否添加标记',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      strong: {
        id: 'strong',
        name: '是否加粗',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      italic: {
        id: 'italic',
        name: '斜体',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      underline: {
        id: 'underline',
        name: '下划线',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      children: {
        id: 'children',
        name: 'children',
        schemaType: 'props',
        category: 'children',
        value: '默认文字',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  Paragraph: {
    configName: 'Paragraph',
    callingName: 'Typography.Paragraph',
    dependency: 'antd',
    component: Typography.Paragraph,
    category: '常用',
    title: '文字',
    icon: CodeSandboxOutlined,
    propsConfig: {
      copyable: {
        id: 'copyable',
        schemaType: 'props',
        name: '可复制',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      delete: {
        id: 'delete',
        schemaType: 'props',
        name: '删除线',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: '禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      editable: {
        id: 'editable',
        name: '可编辑',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      ellipsis: {
        id: 'ellipsis',
        name: '自动省略',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      mark: {
        id: 'mark',
        name: '是否添加标记',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      strong: {
        id: 'strong',
        name: '是否加粗',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      italic: {
        id: 'italic',
        name: '斜体',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      underline: {
        id: 'underline',
        name: '下划线',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      children: {
        id: 'children',
        name: 'children',
        schemaType: 'props',
        category: 'children',
        value: '默认文字',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  Title: {
    configName: 'Title',
    callingName: 'Typography.Title',
    dependency: 'antd',
    component: Typography.Title,
    category: '常用',
    title: '文字',
    icon: CodeSandboxOutlined,
    propsConfig: {
      copyable: {
        id: 'copyable',
        schemaType: 'props',
        name: '可复制',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      delete: {
        id: 'delete',
        schemaType: 'props',
        name: '删除线',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      disabled: {
        id: 'disabled',
        schemaType: 'props',
        name: '禁用',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      editable: {
        id: 'editable',
        name: '可编辑',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      ellipsis: {
        id: 'ellipsis',
        name: '自动省略',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      mark: {
        id: 'mark',
        name: '是否添加标记',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      strong: {
        id: 'strong',
        name: '是否加粗',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      italic: {
        id: 'italic',
        name: '斜体',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      underline: {
        id: 'underline',
        name: '下划线',
        schemaType: 'props',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      children: {
        id: 'children',
        name: 'children',
        schemaType: 'props',
        category: 'children',
        value: '默认文字',
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  Divider: {
    configName: 'Divider',
    dependency: 'antd',
    component: Divider,
    category: 'basic',
    title: '分割线',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Space: {
    configName: 'Space',
    dependency: 'antd',
    component: Space,
    category: 'basic',
    title: '间距',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Anchor: {
    configName: 'Anchor',
    dependency: 'antd',
    component: Anchor,
    category: 'basic',
    title: '锚点',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Breadcrumb: {
    configName: 'Breadcrumb',
    dependency: 'antd',
    component: Breadcrumb,
    category: 'basic',
    title: '面包屑',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Dropdown: {
    configName: 'Dropdown',
    dependency: 'antd',
    component: Dropdown,
    category: 'basic',
    title: '下拉菜单',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Menu: {
    configName: 'Menu',
    dependency: 'antd',
    component: Menu,
    category: 'basic',
    title: '菜单导航',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Pagination: {
    configName: 'Pagination',
    dependency: 'antd',
    component: Pagination,
    category: 'basic',
    title: '分页',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Steps: {
    configName: 'Steps',
    dependency: 'antd',
    component: Steps,
    category: 'basic',
    title: '步骤条',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Cascader: {
    configName: 'Cascader',
    dependency: 'antd',
    component: Cascader,
    category: 'basic',
    title: '级联选择',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Checkbox: {
    configName: 'Checkbox',
    dependency: 'antd',
    component: Checkbox,
    category: 'basic',
    title: '多选框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  ColorPicker: {
    configName: 'ColorPicker',
    dependency: 'antd',
    component: ColorPicker,
    category: 'basic',
    title: '颜色选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  DatePicker: {
    configName: 'DatePicker',
    dependency: 'antd',
    component: DatePicker as unknown as FC,
    category: 'basic',
    title: '日期选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Form: {
    configName: 'Form',
    component: Form,
    category: 'basic',
    title: '表单',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  'Input.Search': {
    configName: 'Input',
    callingName: 'Input.Search',
    dependency: 'antd',
    component: Search,
    category: 'basic',
    title: '搜索框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  'Input.TextArea': {
    configName: 'Input.TextArea',
    dependency: 'antd',
    component: Input.TextArea,
    category: 'basic',
    title: '多行文本',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  InputNumber: {
    configName: 'InputNumber',
    dependency: 'antd',
    component: InputNumber,
    category: 'basic',
    title: '数字输入框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Mentions: {
    configName: 'Mentions',
    dependency: 'antd',
    component: Mentions,
    category: 'basic',
    title: '提及',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Radio: {
    configName: 'Radio',
    dependency: 'antd',
    component: Radio,
    category: 'basic',
    title: '单选框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Rate: {
    configName: 'Rate',
    component: Rate,
    category: 'basic',
    title: '评分',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Select: {
    configName: 'Select',
    dependency: 'antd',
    component: Select,
    category: 'basic',
    title: '选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Slider: {
    configName: 'Slider',
    dependency: 'antd',
    component: Slider,
    category: 'basic',
    title: '滑动输入条',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Switch: {
    configName: 'Switch',
    dependency: 'antd',
    component: Switch,
    category: 'basic',
    title: '开关',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  TimePicker: {
    configName: 'TimePicker',
    dependency: 'antd',
    component: TimePicker,
    category: 'basic',
    title: '时间选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Transfer: {
    configName: 'Transfer',
    dependency: 'antd',
    component: Transfer,
    category: 'basic',
    title: '穿梭框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  TreeSelect: {
    configName: 'TreeSelect',
    dependency: 'antd',
    component: TreeSelect,
    category: 'basic',
    title: '树选择',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Upload: {
    configName: 'Upload',
    dependency: 'antd',
    component: Upload,
    category: 'basic',
    title: '上传',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Avatar: {
    configName: 'Avatar',
    dependency: 'antd',
    component: Avatar,
    category: 'basic',
    title: '头像',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  // TODO:
  Badge: {
    configName: 'Badge',
    dependency: 'antd',
    component: Badge,
    category: 'basic',
    title: '徽标数',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Calendar: {
    configName: 'Calendar',
    dependency: 'antd',
    component: Calendar,
    category: 'basic',
    title: '日历',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Card: {
    configName: 'Card',
    component: Card,
    category: 'basic',
    title: '卡片',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Carousel: {
    configName: 'Carousel',
    dependency: 'antd',
    component: Carousel,
    category: 'basic',
    title: '走马灯',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Collapse: {
    configName: 'Collapse',
    dependency: 'antd',
    component: Collapse,
    category: 'basic',
    title: '折叠面板',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Descriptions: {
    configName: 'Descriptions',
    dependency: 'antd',
    component: Descriptions,
    category: 'basic',
    title: '描述列表',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Empty: {
    configName: 'Empty',
    dependency: 'antd',
    component: Empty,
    category: 'basic',
    title: '空状态',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Image: {
    configName: 'Image',
    dependency: 'antd',
    component: Image as unknown as FC,
    category: 'basic',
    title: '图片',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  List: {
    configName: 'List',
    component: List,
    category: 'basic',
    title: '列表',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Popover: {
    configName: 'Popover',
    dependency: 'antd',
    component: Popover,
    category: 'basic',
    title: '气泡卡片',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Statistic: {
    configName: 'Statistic',
    dependency: 'antd',
    component: Statistic,
    category: 'basic',
    title: '统计数值',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Table: {
    configName: 'Table',
    dependency: 'antd',
    component: Table,
    category: 'basic',
    title: '表格',
    icon: CodeSandboxOutlined,
    propsConfig: {
      columns: {
        id: 'columns',
        schemaType: 'props',
        name: 'columns',
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
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: {}
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age'
          },
          {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: {}
          }
        ]
      },
      dataSource: {
        id: 'dataSource',
        schemaType: 'props',
        name: 'dataSource',
        category: 'basic',
        valueType: 'array',
        valueSource: 'editorInput',
        value: [
          {
            key: '1',
            firstName: 'John',
            lastName: 'Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            tags: ['nice', 'developer']
          },
          {
            key: '2',
            name: 'Jim',
            lastName: 'Green',
            age: 42,
            address: 'London No. 1 Lake Park',
            tags: ['loser']
          },
          {
            key: '3',
            name: 'Joe',
            lastName: 'Black',
            age: 32,
            address: 'Sydney No. 1 Lake Park',
            tags: ['cool', 'teacher']
          }
        ]
      }
    }
  },
  Tabs: {
    configName: 'Tabs',
    dependency: 'antd',
    component: Tabs,
    category: 'basic',
    title: '标签页',
    icon: CodeSandboxOutlined,
    propsConfig: {
      items: {
        id: 'items',
        schemaType: 'props',
        name: 'items',
        valueSource: 'editorInput',
        valueType: 'object',
        templateKeyPathsReg: [
          {
            type: 'object',
            path: '\\[\\d+\\]\\.children'
          },
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
      tabBarExtraContent: {
        id: 'tabBarExtraContent',
        schemaType: 'props',
        name: 'tabBarExtraContent',
        valueSource: 'editorInput',
        valueType: 'object',
        templateKeyPathsReg: [
          {
            type: 'object',
            path: ''
          }
        ],
        value: {},
        category: 'basic'
      }
    }
  },
  Tag: {
    configName: 'Tag',
    component: Tag,
    category: 'basic',
    title: '标签',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tooltip: {
    configName: 'Tooltip',
    dependency: 'antd',
    component: Tooltip,
    category: 'basic',
    title: '文字提示',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tree: {
    configName: 'Tree',
    dependency: 'antd',
    component: Tree,
    category: 'basic',
    title: '树形控件',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Alert: {
    configName: 'Alert',
    dependency: 'antd',
    component: Alert,
    category: 'basic',
    title: '警告提示',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Drawer: {
    configName: 'Drawer',
    dependency: 'antd',
    component: Drawer,
    category: 'layer',
    title: '抽屉',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Modal: {
    configName: 'Modal',
    dependency: 'antd',
    component: Modal,
    category: 'layer',
    title: '模态框',
    isLayer: true,
    icon: CodeSandboxOutlined,
    propsConfig: {
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        value: '新建弹窗',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic'
      },
      open: {
        id: 'open',
        schemaType: 'props',
        name: 'open',
        value: true,
        valueType: 'boolean',
        valueSource: 'userInput',
        category: 'basic'
      }
    },
    children: {
      value: [],
      name: 'children',
      category: 'children'
    }
  },
  Notification: {
    configName: 'Notification',
    dependency: 'antd',
    component: Notification as unknown as FC,
    category: 'layer',
    title: '通知提醒框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Popconfirm: {
    configName: 'Popconfirm',
    dependency: 'antd',
    component: Popconfirm as unknown as FC,
    category: 'basic',
    title: '气泡确认框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Result: {
    configName: 'Result',
    dependency: 'antd',
    component: Result,
    category: 'basic',
    title: '结果',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Affix: {
    configName: 'Affix',
    dependency: 'antd',
    component: Affix as unknown as FC,
    category: 'basic',
    title: '固定',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  FloatButton: {
    configName: 'FloatButton',
    dependency: 'antd',
    component: FloatButton as unknown as FC,
    category: 'basic',
    title: '浮动按钮',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  }
};

const htmlComponentConfig: { [key: string]: IComponentConfig } = {};

const camelotComponentConfig: { [key: string]: IComponentConfig } = {
  'b-oa-user-select': {
    configName: 'b-oa-user-select',
    dependency: 'camelot',
    component: createCamelotComponent(
      'b-oa-user-select',
      'https://s1.hdslb.com/bfs/live/oa-user-select/last/oa-user-select.mjs'
    ),
    category: 'custom',
    title: '用户查询',
    icon: CodeSandboxOutlined,
    propsConfig: {
      selected: {
        id: 'selected',
        schemaType: 'props',
        name: 'selected',
        valueSource: 'editorInput',
        valueType: 'string',
        category: 'basic',
        value: 'guwenjia'
      }
    }
  },
  'b-oa-department-select': {
    configName: 'b-oa-department-select',
    dependency: 'camelot',
    component: createCamelotComponent(
      'b-oa-department-select',
      'https://s1.hdslb.com/bfs/live/oa-department-select/last/oa-department-select.mjs?t=1697615352271'
    ),
    category: 'custom',
    title: '部门查询',
    icon: CodeSandboxOutlined,
    propsConfig: {
      dids: {
        id: 'dids',
        schemaType: 'props',
        name: 'dids',
        valueSource: 'editorInput',
        valueType: 'string',
        category: 'basic',
        value: '-10613,-10675'
      },
      selected: {
        id: 'selected',
        schemaType: 'props',
        name: 'selected',
        valueSource: 'editorInput',
        valueType: 'number',
        category: 'basic',
        value: -10712
      }
    }
  },
  'b-tree-select': {
    configName: 'b-tree-select',
    dependency: 'camelot',
    component: createCamelotComponent(
      'b-tree-select',
      'https://s1.hdslb.com/bfs/live/tree-select/last/tree-select.mjs?t=1697615352272'
    ),
    category: 'custom',
    title: '服务树',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  'b-audit-log': {
    configName: 'b-audit-log',
    dependency: 'camelot',
    component: createCamelotComponent('b-audit-log', 'https://s1.hdslb.com/bfs/live/audit-log/last/audit-log.mjs'),
    category: 'custom',
    title: '日志组件',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  'b-tapd-select': {
    configName: 'b-tapd-select',
    dependency: 'camelot',
    component: createCamelotComponent(
      'b-tapd-select',
      'https://s1.hdslb.com/bfs/live/tapd-select/last/tapd-select.mjs?t=1697615352271'
    ),
    category: 'custom',
    title: 'TAPD组件',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  }
};
export default { antd: antdComponentConfig, html: htmlComponentConfig, camelot: camelotComponentConfig } as {
  [key: string]: { [key: string]: IComponentConfig };
};
