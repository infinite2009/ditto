import { FC } from 'react';
import {
  Affix, Alert, Anchor, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Cascader, Checkbox, Col, Collapse,
  ColorPicker, DatePicker, Descriptions, Divider, Drawer, Dropdown, Empty, FloatButton, Form, Input, InputNumber, List,
  Mentions, Menu, Modal, Pagination, Popconfirm, Popover, Radio, Rate, Result, Row, Select, Slider, Space, Statistic,
  Steps, Switch, Table, Tabs, Tag, TimePicker, Tooltip, Transfer, Tree, TreeSelect, Upload
} from 'antd';
import { CodeSandboxOutlined } from '@ant-design/icons';
import IComponentConfig from '@/types/component-config';

const antdComponentConfig: { [key: string]: IComponentConfig } = {
  Row: {
    name: 'Row',
    dependency: 'antd',
    isContainer: true,
    category: 'basic',
    title: '行容器',
    icon: CodeSandboxOutlined,
    component: Row,
    propsConfig: {}
  },
  Col: {
    name: 'Col',
    dependency: 'antd',
    isContainer: true,
    category: 'basic',
    title: '列容器',
    component: Col,
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Button: {
    name: 'Button',
    dependency: 'antd',
    component: Button,
    category: 'basic',
    title: '按钮',
    icon: CodeSandboxOutlined,
    propsConfig: { type: { name: 'type', category: 'basic', initialValue: 'primary' } }
  },
  Divider: {
    name: 'Divider',
    dependency: 'antd',
    component: Divider,
    category: 'basic',
    title: '分割线',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Space: {
    name: 'Space',
    dependency: 'antd',
    component: Space,
    category: 'basic',
    title: '间距',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Anchor: {
    name: 'Anchor',
    dependency: 'antd',
    component: Anchor,
    category: 'basic',
    title: '锚点',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Breadcrumb: {
    name: 'Breadcrumb',
    dependency: 'antd',
    component: Breadcrumb,
    category: 'basic',
    title: '面包屑',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Dropdown: {
    name: 'Dropdown',
    dependency: 'antd',
    component: Dropdown,
    category: 'basic',
    title: '下拉菜单',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Menu: {
    name: 'Menu',
    dependency: 'antd',
    component: Menu,
    category: 'basic',
    title: '菜单导航',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Pagination: {
    name: 'Pagination',
    dependency: 'antd',
    component: Pagination,
    category: 'basic',
    title: '分页',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Steps: {
    name: 'Steps',
    dependency: 'antd',
    component: Steps,
    category: 'basic',
    title: '步骤条',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Cascader: {
    name: 'Cascader',
    dependency: 'antd',
    component: Cascader,
    category: 'basic',
    title: '级联选择',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Checkbox: {
    name: 'Checkbox',
    dependency: 'antd',
    component: Checkbox,
    category: 'basic',
    title: '多选框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  ColorPicker: {
    name: 'ColorPicker',
    dependency: 'antd',
    component: ColorPicker,
    category: 'basic',
    title: '颜色选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  DatePicker: {
    name: 'DatePicker',
    dependency: 'antd',
    component: DatePicker as unknown as FC,
    category: 'basic',
    title: '日期选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Form: {
    name: 'Form',
    component: Form,
    category: 'basic',
    title: '表单',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  'Input.Search': {
    name: 'Input.Search',
    dependency: 'antd',
    component: Input.Search,
    category: 'basic',
    title: '搜索框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  'Input.TextArea': {
    name: 'Input.TextArea',
    dependency: 'antd',
    component: Input.TextArea,
    category: 'basic',
    title: '多行文本',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  InputNumber: {
    name: 'InputNumber',
    dependency: 'antd',
    component: InputNumber,
    category: 'basic',
    title: '数字输入框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Mentions: {
    name: 'Mentions',
    dependency: 'antd',
    component: Mentions,
    category: 'basic',
    title: '提及',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Radio: {
    name: 'Radio',
    dependency: 'antd',
    component: Radio,
    category: 'basic',
    title: '单选框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Rate: {
    name: 'Rate',
    component: Rate,
    category: 'basic',
    title: '评分',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Select: {
    name: 'Select',
    dependency: 'antd',
    component: Select,
    category: 'basic',
    title: '选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Slider: {
    name: 'Slider',
    dependency: 'antd',
    component: Slider,
    category: 'basic',
    title: '滑动输入条',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Switch: {
    name: 'Switch',
    dependency: 'antd',
    component: Switch,
    category: 'basic',
    title: '开关',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  TimePicker: {
    name: 'TimePicker',
    dependency: 'antd',
    component: TimePicker,
    category: 'basic',
    title: '时间选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Transfer: {
    name: 'Transfer',
    dependency: 'antd',
    component: Transfer,
    category: 'basic',
    title: '穿梭框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  TreeSelect: {
    name: 'TreeSelect',
    dependency: 'antd',
    component: TreeSelect,
    category: 'basic',
    title: '树选择',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Upload: {
    name: 'Upload',
    dependency: 'antd',
    component: Upload,
    category: 'basic',
    title: '上传',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Avatar: {
    name: 'Avatar',
    dependency: 'antd',
    component: Avatar,
    category: 'basic',
    title: '头像',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  // TODO:
  Badge: {
    name: 'Badge',
    dependency: 'antd',
    component: Badge,
    category: 'basic',
    title: '徽标数',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Calendar: {
    name: 'Calendar',
    dependency: 'antd',
    component: Calendar,
    category: 'basic',
    title: '日历',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Card: {
    name: 'Card',
    component: Card,
    category: 'basic',
    title: '卡片',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Carousel: {
    name: 'Carousel',
    dependency: 'antd',
    component: Carousel,
    category: 'basic',
    title: '走马灯',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Collapse: {
    name: 'Collapse',
    dependency: 'antd',
    component: Collapse,
    category: 'basic',
    title: '折叠面板',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Descriptions: {
    name: 'Descriptions',
    dependency: 'antd',
    component: Descriptions,
    category: 'basic',
    title: '描述列表',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Empty: {
    name: 'Empty',
    dependency: 'antd',
    component: Empty,
    category: 'basic',
    title: '空状态',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Image: {
    name: 'Image',
    dependency: 'antd',
    component: Image as unknown as FC,
    category: 'basic',
    title: '图片',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  List: {
    name: 'List',
    component: List,
    category: 'basic',
    title: '列表',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Popover: {
    name: 'Popover',
    dependency: 'antd',
    component: Popover,
    category: 'basic',
    title: '气泡卡片',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Statistic: {
    name: 'Statistic',
    dependency: 'antd',
    component: Statistic,
    category: 'basic',
    title: '统计数值',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Table: {
    name: 'Table',
    dependency: 'antd',
    component: Table,
    category: 'basic',
    title: '表格',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tabs: {
    name: 'Tabs',
    dependency: 'antd',
    component: Tabs,
    category: 'basic',
    title: '标签页',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tag: {
    name: 'Tag',
    component: Tag,
    category: 'basic',
    title: '标签',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tooltip: {
    name: 'Tooltip',
    dependency: 'antd',
    component: Tooltip,
    category: 'basic',
    title: '文字提示',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Tree: {
    name: 'Tree',
    dependency: 'antd',
    component: Tree,
    category: 'basic',
    title: '树形控件',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Alert: {
    name: 'Alert',
    dependency: 'antd',
    component: Alert,
    category: 'basic',
    title: '警告提示',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Drawer: {
    name: 'Drawer',
    dependency: 'antd',
    component: Drawer,
    category: 'layer',
    title: '抽屉',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Modal: {
    name: 'Modal',
    dependency: 'antd',
    component: Modal,
    category: 'layer',
    title: '模态框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Notification: {
    name: 'Notification',
    dependency: 'antd',
    component: Notification as unknown as FC,
    category: 'layer',
    title: '通知提醒框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Popconfirm: {
    name: 'Popconfirm',
    dependency: 'antd',
    component: Popconfirm as unknown as FC,
    category: 'basic',
    title: '气泡确认框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Result: {
    name: 'Result',
    dependency: 'antd',
    component: Result,
    category: 'basic',
    title: '结果',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Affix: {
    name: 'Affix',
    dependency: 'antd',
    component: Affix as unknown as FC,
    category: 'basic',
    title: '固定',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  FloatButton: {
    name: 'FloatButton',
    dependency: 'antd',
    component: FloatButton as unknown as FC,
    category: 'basic',
    title: '浮动按钮',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  }
};
export default { antd: antdComponentConfig } as { [key: string]: { [key: string]: IComponentConfig } };
