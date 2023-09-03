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
  Col,
  Collapse,
  ColorPicker,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
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
  Row,
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
  Upload
} from 'antd';
import { CodeSandboxOutlined } from '@ant-design/icons';
import IComponentConfig from '@/types/component-config';
import EditableText from '@/components/editable-text';
import Container from '@/components/container';

const antdComponentConfig: { [key: string]: IComponentConfig } = {
  Row: {
    configName: 'Row',
    dependency: 'antd',
    isContainer: true,
    category: 'basic',
    title: '行容器',
    icon: CodeSandboxOutlined,
    component: Row,
    propsConfig: {
      align: {
        id: 'align',
        schemaType: 'props',
        name: 'align',
        value: 'middle',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'style'
      }
    }
  },
  Col: {
    configName: 'Col',
    dependency: 'antd',
    isContainer: true,
    category: 'basic',
    title: '列容器',
    component: Col,
    icon: CodeSandboxOutlined,
    propsConfig: {
      paddingTop: {
        id: 'paddingTop',
        schemaType: 'props',
        name: 'paddingTop',
        value: 8,
        valueType: 'number',
        valueSource: 'editorInput',
        category: 'style'
      },
      paddingRight: {
        id: 'paddingRight',
        schemaType: 'props',
        name: 'paddingRight',
        value: 8,
        valueType: 'number',
        valueSource: 'editorInput',
        category: 'style'
      },
      paddingBottom: {
        id: 'paddingBottom',
        schemaType: 'props',
        name: 'paddingBottom',
        value: 8,
        valueType: 'number',
        valueSource: 'editorInput',
        category: 'style'
      },
      paddingLeft: {
        id: 'paddingLeft',
        schemaType: 'props',
        name: 'paddingLeft',
        value: 8,
        valueType: 'number',
        valueSource: 'editorInput',
        category: 'style'
      }
    }
  },
  Button: {
    configName: 'Button',
    dependency: 'antd',
    component: Button,
    category: 'basic',
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
      }
    },
    children: {
      name: 'children',
      value: '按钮',
      category: 'children'
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
    component: Input.Search,
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
    propsConfig: {}
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
    icon: CodeSandboxOutlined,
    propsConfig: {}
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

const htmlComponentConfig: { [key: string]: IComponentConfig } = {
  column: {
    configName: 'Column',
    dependency: 'html',
    isContainer: true,
    component: Container,
    category: 'basic',
    title: '智能容器',
    icon: CodeSandboxOutlined,
    propsConfig: {
      flexDirection: {
        id: 'flexDirection',
        schemaType: 'props',
        name: 'flexDirection',
        value: 'column',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'style'
      },
      flexBasis: {
        id: 'flexBasis',
        schemaType: 'props',
        name: 'flexBasis',
        value: 'auto',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'style'
      },
      height: {
        id: 'height',
        schemaType: 'props',
        name: 'height',
        value: 'auto',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'style'
      },
      width: {
        id: 'width',
        schemaType: 'props',
        name: 'width',
        value: 'auto',
        valueSource: 'editorInput',
        valueType: 'string',
        category: 'style'
      },
      flexGrow: {
        id: 'flexGrow',
        schemaType: 'props',
        name: 'flexGrow',
        valueType: 'number',
        value: 0,
        valueSource: 'editorInput',
        category: 'style'
      },
      flexShrink: {
        id: 'flexShrink',
        schemaType: 'props',
        name: 'flexShrink',
        valueType: 'number',
        value: 0,
        valueSource: 'editorInput',
        category: 'style'
      },
      alignItems: {
        id: 'alignItems',
        schemaType: 'props',
        name: 'alignItems',
        valueSource: 'editorInput',
        valueType: 'string',
        value: 'flex-start',
        category: 'style'
      },
      justifyContent: {
        id: 'justifyContent',
        schemaType: 'props',
        name: 'justifyContent',
        value: 'flex-start',
        valueSource: 'editorInput',
        valueType: 'string',
        category: 'style'
      },
      marginTop: {
        id: 'marginTop',
        schemaType: 'props',
        name: 'marginTop',
        valueType: 'number',
        value: 10,
        valueSource: 'editorInput',
        category: 'style'
      },
      marginRight: {
        id: 'marginRight',
        schemaType: 'props',
        name: 'marginRight',
        valueType: 'number',
        value: 10,
        valueSource: 'editorInput',
        category: 'style'
      },
      marginBottom: {
        id: 'marginBottom',
        schemaType: 'props',
        name: 'marginBottom',
        valueType: 'number',
        value: 10,
        valueSource: 'editorInput',
        category: 'style'
      },
      marginLeft: {
        id: 'marginLeft',
        schemaType: 'props',
        name: 'marginLeft',
        valueType: 'number',
        value: 10,
        valueSource: 'editorInput',
        category: 'style'
      },
      paddingTop: {
        id: 'paddingTop',
        schemaType: 'props',
        name: 'paddingTop',
        value: 8,
        valueSource: 'editorInput',
        valueType: 'number',
        category: 'style'
      },
      paddingRight: {
        id: 'paddingRight',
        schemaType: 'props',
        name: 'paddingRight',
        value: 8,
        valueType: 'number',
        valueSource: 'editorInput',
        category: 'style'
      },
      paddingBottom: {
        id: 'paddingBottom',
        schemaType: 'props',
        name: 'paddingBottom',
        value: 8,
        valueType: 'number',
        valueSource: 'editorInput',
        category: 'style'
      },
      paddingLeft: {
        id: 'paddingLeft',
        schemaType: 'props',
        name: 'paddingLeft',
        value: 8,
        valueType: 'number',
        valueSource: 'editorInput',
        category: 'style'
      },
      backgroundColor: {
        id: 'backgroundColor',
        schemaType: 'props',
        name: 'backgroundColor',
        value: 'transparent',
        valueSource: 'editorInput',
        valueType: 'string',
        category: 'style'
      }
    },
    children: {
      name: 'children',
      value: [],
      category: 'children'
    }
  },
  p: {
    name: 'p',
    dependency: 'html',
    component: EditableText,
    category: 'basic',
    title: '文字',
    icon: CodeSandboxOutlined,
    propsConfig: {
      fontSize: {
        id: 'fontSize',
        schemaType: 'props',
        name: 'fontSize',
        value: 14,
        valueType: 'number',

        valueSource: 'editorInput',
        category: 'style'
      },
      fontWeight: {
        id: 'fontWeight',
        schemaType: 'props',
        name: 'fontWeight',
        value: 500,
        valueSource: 'editorInput',
        valueType: 'number',

        category: 'style'
      },
      lineHeight: {
        id: 'lineHeight',
        schemaType: 'props',
        name: 'lineHeight',
        value: 30,
        valueSource: 'editorInput',
        valueType: 'number',
        category: 'style'
      },
      color: {
        id: 'color',
        schemaType: 'props',
        name: 'color',
        value: '#000',
        valueSource: 'editorInput',
        valueType: 'string',
        category: 'style'
      },
      children: {
        id: 'children',
        schemaType: 'props',
        name: 'children',
        value: '默认文字',
        valueSource: 'editorInput',
        valueType: 'string',
        category: 'basic'
      }
    }
  }
};

export default { antd: antdComponentConfig, html: htmlComponentConfig } as {
  [key: string]: { [key: string]: IComponentConfig };
};
