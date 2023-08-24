import { FC } from 'react';
import {
  Affix, Alert, Anchor, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Cascader, Checkbox, Collapse,
  ColorPicker, DatePicker, Descriptions, Divider, Drawer, Dropdown, Empty, FloatButton, Form, Input, InputNumber, List,
  Mentions, Menu, Modal, Pagination, Popconfirm, Popover, Radio, Rate, Result, Row, Select, Slider, Space, Statistic,
  Steps, Col,
  Switch, Table, Tabs, Tag, TimePicker, Tooltip, Transfer, Tree, TreeSelect, Upload
} from 'antd';
import { CodeSandboxOutlined } from '@ant-design/icons';
import IComponentConfig from '@/types/component-config';

const antdComponentConfig: { [key: string]: IComponentConfig } = {
  Row: {
    name: 'Row',
    isContainer: true,
    category: 'basic',
    title: '行容器',
    icon: CodeSandboxOutlined,
    component: Row,
    propsConfig: {},
  },
  Col: {
    name: 'Column',
    isContainer: true,
    category: 'basic',
    title: '列容器',
    component: Col,
    icon: CodeSandboxOutlined,
    propsConfig: {},
  },
  Button: {
    name: 'Button',
    component: Button,
    category: 'basic',
    title: '按钮',
    icon: CodeSandboxOutlined,
    propsConfig: { type: { name: 'type', category: 'basic', initialValue: 'primary' } }
  },
  Divider: {
    name: 'Divider',
    component: Divider,
    category: 'basic',
    title: '分割线',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Space: {
    name: 'Space',
    component: Space,
    category: 'basic',
    title: '间距',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Anchor: {
    name: 'Anchor',
    component: Anchor,
    category: 'basic',
    title: '锚点',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Breadcrumb: {
    name: 'Breadcrumb',
    component: Breadcrumb,
    category: 'basic',
    title: '面包屑',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Dropdown: {
    name: 'Dropdown',
    component: Dropdown,
    category: 'basic',
    title: '下拉菜单',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Menu: {
    name: 'Menu',
    component: Menu,
    category: 'basic',
    title: '菜单导航',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Pagination: {
    name: 'Pagination',
    component: Pagination,
    category: 'basic',
    title: '分页',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Steps: {
    name: 'Steps',
    component: Steps,
    category: 'basic',
    title: '步骤条',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Cascader: {
    name: 'Cascader',
    component: Cascader,
    category: 'basic',
    title: '级联选择',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Checkbox: {
    name: 'Checkbox',
    component: Checkbox,
    category: 'basic',
    title: '多选框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  ColorPicker: {
    name: 'ColorPicker',
    component: ColorPicker,
    category: 'basic',
    title: '颜色选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  DatePicker: {
    name: 'DatePicker',
    component: DatePicker as unknown as FC,
    category: 'basic',
    title: '日期选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Form: { name: 'Form', component: Form, category: 'basic', title: '表单', icon: CodeSandboxOutlined, propsConfig: {} },
  'Input.Search': {
    name: 'Input.Search',
    component: Input.Search,
    category: 'basic',
    title: '搜索框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  'Input.TextArea': {
    name: 'Input.TextArea',
    component: Input.TextArea,
    category: 'basic',
    title: '多行文本',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  InputNumber: {
    name: 'InputNumber',
    component: InputNumber,
    category: 'basic',
    title: '数字输入框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Mentions: {
    name: 'Mentions',
    component: Mentions,
    category: 'basic',
    title: '提及',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Radio: {
    name: 'Radio',
    component: Radio,
    category: 'basic',
    title: '单选框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Rate: { name: 'Rate', component: Rate, category: 'basic', title: '评分', icon: CodeSandboxOutlined, propsConfig: {} },
  Select: {
    name: 'Select',
    component: Select,
    category: 'basic',
    title: '选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Slider: {
    name: 'Slider',
    component: Slider,
    category: 'basic',
    title: '滑动输入条',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Switch: {
    name: 'Switch',
    component: Switch,
    category: 'basic',
    title: '开关',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  TimePicker: {
    name: 'TimePicker',
    component: TimePicker,
    category: 'basic',
    title: '时间选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Transfer: {
    name: 'Transfer',
    component: Transfer,
    category: 'basic',
    title: '穿梭框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  TreeSelect: {
    name: 'TreeSelect',
    component: TreeSelect,
    category: 'basic',
    title: '树选择',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Upload: {
    name: 'Upload',
    component: Upload,
    category: 'basic',
    title: '上传',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Avatar: {
    name: 'Avatar',
    component: Avatar,
    category: 'basic',
    title: '头像',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  // TODO:
  Badge: {
    name: 'Badge',
    component: Badge,
    category: 'basic',
    title: '徽标数',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Calendar: {
    name: 'Calendar',
    component: Calendar,
    category: 'basic',
    title: '日历',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Card: { name: 'Card', component: Card, category: 'basic', title: '卡片', icon: CodeSandboxOutlined, propsConfig: {} },
  Carousel: {
    name: 'Carousel',
    component: Carousel,
    category: 'basic',
    title: '走马灯',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Collapse: {
    name: 'Collapse',
    component: Collapse,
    category: 'basic',
    title: '折叠面板',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Descriptions: {
    name: 'Descriptions',
    component: Descriptions,
    category: 'basic',
    title: '描述列表',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Empty: {
    name: 'Empty',
    component: Empty,
    category: 'basic',
    title: '空状态',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Image: {
    name: 'Image',
    component: Image as unknown as FC,
    category: 'basic',
    title: '图片',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  List: { name: 'List', component: List, category: 'basic', title: '列表', icon: CodeSandboxOutlined, propsConfig: {} },
  Popover: {
    name: 'Popover',
    component: Popover,
    category: 'basic',
    title: '气泡卡片',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Statistic: {
    name: 'Statistic',
    component: Statistic,
    category: 'basic',
    title: '统计数值',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Table: {
    name: 'Table',
    component: Table,
    category: 'basic',
    title: '表格',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tabs: {
    name: 'Tabs',
    component: Tabs,
    category: 'basic',
    title: '标签页',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tag: { name: 'Tag', component: Tag, category: 'basic', title: '标签', icon: CodeSandboxOutlined, propsConfig: {} },
  Tooltip: {
    name: 'Tooltip',
    component: Tooltip,
    category: 'basic',
    title: '文字提示',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tree: {
    name: 'Tree',
    component: Tree,
    category: 'basic',
    title: '树形控件',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Alert: {
    name: 'Alert',
    component: Alert,
    category: 'basic',
    title: '警告提示',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Drawer: {
    name: 'Drawer',
    component: Drawer,
    category: 'layer',
    title: '抽屉',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Modal: {
    name: 'Modal',
    component: Modal,
    category: 'layer',
    title: '模态框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Notification: {
    name: 'Notification',
    component: Notification as unknown as FC,
    category: 'layer',
    title: '通知提醒框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Popconfirm: {
    name: 'Popconfirm',
    component: Popconfirm as unknown as FC,
    category: 'basic',
    title: '气泡确认框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Result: {
    name: 'Result',
    component: Result,
    category: 'basic',
    title: '结果',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Affix: {
    name: 'Affix',
    component: Affix as unknown as FC,
    category: 'basic',
    title: '固定',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  FloatButton: {
    name: 'FloatButton',
    component: FloatButton as unknown as FC,
    category: 'basic',
    title: '浮动按钮',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  }
};
export default { antd: antdComponentConfig } as { [key: string]: { [key: string]: IComponentConfig } };