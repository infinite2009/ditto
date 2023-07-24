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
  Skeleton,
  Slider,
  Space,
  Spin,
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
import IComponentConfig from '@/types/component-config';
import { CodeSandboxOutlined } from '@ant-design/icons';
import { FC } from 'react';

const antdComponentConfig: { [key: string]: IComponentConfig } = {
  Button: {
    component: Button,
    category: 'basic',
    title: '按钮',
    icon: CodeSandboxOutlined,
    propsConfig: {
      type: {
        name: 'type',
        category: 'basic',
        initialValue: 'primary'
      }
    }
  },
  Divider: {
    component: Divider,
    category: 'basic',
    title: '分割线',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Space: {
    component: Space,
    category: 'basic',
    title: '间距',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Anchor: {
    component: Anchor,
    category: 'basic',
    title: '锚点',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Breadcrumb: {
    component: Breadcrumb,
    category: 'basic',
    title: '面包屑',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Dropdown: {
    component: Dropdown,
    category: 'basic',
    title: '下拉菜单',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Menu: {
    component: Menu,
    category: 'basic',
    title: '菜单导航',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Pagination: {
    component: Pagination,
    category: 'basic',
    title: '分页',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Steps: {
    component: Steps,
    category: 'basic',
    title: '步骤条',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Cascader: {
    component: Cascader,
    category: 'basic',
    title: '级联选择',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Checkbox: {
    component: Checkbox,
    category: 'basic',
    title: '多选框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  ColorPicker: {
    component: ColorPicker,
    category: 'basic',
    title: '颜色选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  DatePicker: {
    component: DatePicker as unknown as FC,
    category: 'basic',
    title: '日期选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Form: {
    component: Form,
    category: 'basic',
    title: '表单',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  'Input.Search': {
    component: Input.Search,
    category: 'basic',
    title: '搜索框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  'Input.TextArea': {
    component: Input.TextArea,
    category: 'basic',
    title: '多行文本',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  InputNumber: {
    component: InputNumber,
    category: 'basic',
    title: '数字输入框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Mentions: {
    component: Mentions,
    category: 'basic',
    title: '提及',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Radio: {
    component: Radio,
    category: 'basic',
    title: '单选框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Rate: {
    component: Rate,
    category: 'basic',
    title: '评分',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Select: {
    component: Select,
    category: 'basic',
    title: '选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Slider: {
    component: Slider,
    category: 'basic',
    title: '滑动输入条',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Switch: {
    component: Switch,
    category: 'basic',
    title: '开关',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  TimePicker: {
    component: TimePicker,
    category: 'basic',
    title: '时间选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Transfer: {
    component: Transfer,
    category: 'basic',
    title: '穿梭框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  TreeSelect: {
    component: TreeSelect,
    category: 'basic',
    title: '树选择',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Upload: {
    component: Upload,
    category: 'basic',
    title: '上传',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Avatar: {
    component: Avatar,
    category: 'basic',
    title: '头像',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  // TODO:
  Badge: {
    component: Badge,
    category: 'basic',
    title: '徽标数',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Calendar: {
    component: Calendar,
    category: 'basic',
    title: '日历',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Card: {
    component: Card,
    category: 'basic',
    title: '卡片',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Carousel: {
    component: Carousel,
    category: 'basic',
    title: '走马灯',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Collapse: {
    component: Collapse,
    category: 'basic',
    title: '折叠面板',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Descriptions: {
    component: Descriptions,
    category: 'basic',
    title: '描述列表',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Empty: {
    component: Empty,
    category: 'basic',
    title: '空状态',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Image: {
    component: Image as unknown as FC,
    category: 'basic',
    title: '图片',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  List: {
    component: List,
    category: 'basic',
    title: '列表',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Popover: {
    component: Popover,
    category: 'basic',
    title: '气泡卡片',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Statistic: {
    component: Statistic,
    category: 'basic',
    title: '统计数值',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Table: {
    component: Table,
    category: 'basic',
    title: '表格',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tabs: {
    component: Tabs,
    category: 'basic',
    title: '标签页',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tag: {
    component: Tag,
    category: 'basic',
    title: '标签',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tooltip: {
    component: Tooltip,
    category: 'basic',
    title: '文字提示',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tree: {
    component: Tree,
    category: 'basic',
    title: '树形控件',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Alert: {
    component: Alert,
    category: 'basic',
    title: '警告提示',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Drawer: {
    component: Drawer,
    category: 'basic',
    title: '抽屉',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Modal: {
    component: Modal,
    category: 'basic',
    title: '模态框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Notification: {
    component: Notification as unknown as FC,
    category: 'basic',
    title: '通知提醒框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Popconfirm: {
    component: Popconfirm as unknown as FC,
    category: 'basic',
    title: '气泡确认框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Result: {
    component: Result,
    category: 'basic',
    title: '结果',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Affix: {
    component: Affix as unknown as FC,
    category: 'basic',
    title: '固定',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  FloatButton: {
    component: FloatButton as unknown as FC,
    category: 'basic',
    title: '浮动按钮',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  }
};

export default {
  antd: antdComponentConfig
} as { [key: string]: { [key: string]: IComponentConfig } };
