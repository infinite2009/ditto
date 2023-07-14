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
import React, { FC } from 'react';

const componentConfig: { [key: string]: IComponentConfig} = {
  Button: {
    component: Button,
    category: 'basic',
    title: '按钮',
    icon: null,
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
    icon: null,
    propsConfig: {

    }
  },
  Space: {
    component: Space,
    category: 'basic',
    title: '间距',
    icon: null,
    propsConfig: {
    }
  },
  Anchor: {
    component: Anchor,
    category: 'basic',
    title: '锚点',
    icon: null,
    propsConfig: {
    }
  },
  Breadcrumb: {
    component: Breadcrumb,
    category: 'basic',
    title: '面包屑',
    icon: null,
    propsConfig: {
    }
  },
  Dropdown: {
    component: Dropdown,
    category: 'basic',
    title: '下拉菜单',
    icon: null,
    propsConfig: {
    }
  },
  Menu: {
    component: Menu,
    category: 'basic',
    title: '菜单导航',
    icon: null,
    propsConfig: {
    }
  },
  Pagination: {
    component: Pagination,
    category: 'basic',
    title: '分页',
    icon: null,
    propsConfig: {
    }
  },
  Steps: {
    component: Steps,
    category: 'basic',
    title: '步骤条',
    icon: null,
    propsConfig: {

    }
  },
  Cascader: {
    component: Cascader,
    category: 'basic',
    title: '级联选择',
    icon: null,
    propsConfig: {

    }
  },
  Checkbox: {
    component: Checkbox,
    category: 'basic',
    title: '多选框',
    icon: null,
    propsConfig: {

    }
  },
  ColorPicker: {
    component: ColorPicker,
    category: 'basic',
    title: '颜色选择器',
    icon: null,
    propsConfig: {

    }
  },
  DatePicker: {
    component: DatePicker as unknown as FC,
    category: 'basic',
    title: '日期选择器',
    icon: null,
    propsConfig: {

    }
  },
  Form: {
    component: Form,
    category: 'basic',
    title: '表单',
    icon: null,
    propsConfig: {

    }
  },
  'Input.Search': {
    component: Input.Search,
    category: 'basic',
    title: '搜索框',
    icon: null,
    propsConfig: {
    }
  },
  'Input.TextArea': {
    component: Input.TextArea,
    category: 'basic',
    title: '多行文本',
    icon: null,
    propsConfig: {
    },
  },
  InputNumber: {
    component: InputNumber,
    category: 'basic',
    title: '数字输入框',
    icon: null,
    propsConfig: {
    },
  },
  Mentions: {
    component: Mentions,
    category: 'basic',
    title: '提及',
    icon: null,
    propsConfig: {

    },
  },
  Radio: {
    component: Radio,
    category: 'basic',
    title: '单选框',
    icon: null,
    propsConfig: {

    },
  },
  Rate: {
    component: Rate,
    category: 'basic',
    title: '评分',
    icon: null,
    propsConfig: {

    },
  },
  Select: {
    component: Select,
    category: 'basic',
    title: '选择器',
    icon: null,
    propsConfig: {

    },
  },
  Slider: {
    component: Slider,
    category: 'basic',
    title: '滑动输入条',
    icon: null,
    propsConfig: {

    },
  },
  Switch: {
    component: Switch,
    category: 'basic',
    title: '开关',
    icon: null,
    propsConfig: {

    },
  },
  TimePicker: {
    component: TimePicker,
    category: 'basic',
    title: '时间选择器',
    icon: null,
    propsConfig: {
    },
  },
  Transfer: {
    component: Transfer,
    category: 'basic',
    title: '穿梭框',
    icon: null,
    propsConfig: {
    },
  },
  TreeSelect: {
    component: TreeSelect,
    category: 'basic',
    title: '树选择',
    icon: null,
    propsConfig: {
    },
  },
  Upload: {
    component: Upload,
    category: 'basic',
    title: '上传',
    icon: null,
    propsConfig: {
    },
  },
  Avatar: {
    component: Avatar,
    category: 'basic',
    title: '头像',
    icon: null,
    propsConfig: {
    },
  },
  // TODO:
  Badge: {
    component: Badge,
    category: 'basic',
    title: '徽标数',
    icon: null,
    propsConfig: {
    },
  },
  Calendar: {
    component: Calendar,
    category: 'basic',
    title: '日历',
    icon: null,
    propsConfig: {
    },
  },
  Card: {
    component: Card,
    category: 'basic',
    title: '卡片',
    icon: null,
    propsConfig: {
    },
  },
  Carousel: {
    component: Carousel,
    category: 'basic',
    title: '走马灯',
    icon: null,
    propsConfig: {
    },
  },
  Collapse: {
    component: Collapse,
    category: 'basic',
    title: '折叠面板',
    icon: null,
    propsConfig: {
    },
  },
  Descriptions: {
    component: Descriptions,
    category: 'basic',
    title: '描述列表',
    icon: null,
    propsConfig: {
    },
  },
  Empty: {
    component: Empty,
    category: 'basic',
    title: '空状态',
    icon: null,
    propsConfig: {
    },
  },
  Image: {
    component: Image as unknown as FC,
    category: 'basic',
    title: '图片',
    icon: null,
    propsConfig: {
    },
  },
  List: {
    component: List,
    category: 'basic',
    title: '列表',
    icon: null,
    propsConfig: {
    },
  },
  Popover: {
    component: Popover,
    category: 'basic',
    title: '气泡卡片',
    icon: null,
    propsConfig: {
    },
  },
  Statistic: {
    component: Statistic,
    category: 'basic',
    title: '统计数值',
    icon: null,
    propsConfig: {
    },
  },
  Table: {
    component: Table,
    category: 'basic',
    title: '表格',
    icon: null,
    propsConfig: {
    },
  },
  Tabs: {
    component: Tabs,
    category: 'basic',
    title: '标签页',
    icon: null,
    propsConfig: {
    },
  },
  Tag: {
    component: Tag,
    category: 'basic',
    title: '标签',
    icon: null,
    propsConfig: {
    },
  },
  Tooltip: {
    component: Tooltip,
    category: 'basic',
    title: '文字提示',
    icon: null,
    propsConfig: {
    },
  },
  Tree: {
    component: Tree,
    category: 'basic',
    title: '树形控件',
    icon: null,
    propsConfig: {
    },
  },
  Alert: {
    component: Alert,
    category: 'basic',
    title: '警告提示',
    icon: null,
    propsConfig: {
    },
  },
  Drawer: {
    component: Drawer,
    category: 'basic',
    title: '抽屉',
    icon: null,
    propsConfig: {
    },
  },
  Modal: {
    component: Modal,
    category: 'basic',
    title: '模态框',
    icon: null,
    propsConfig: {
    },
  },
  Notification: {
    component: Notification as unknown as FC,
    category: 'basic',
    title: '通知提醒框',
    icon: null,
    propsConfig: {
    },
  },
  Popconfirm: {
    component: Popconfirm as unknown as FC,
    category: 'basic',
    title: '气泡确认框',
    icon: null,
    propsConfig: {
    },
  },
  Result: {
    component:  Result,
    category: 'basic',
    title: '结果',
    icon: null,
    propsConfig: {
    },
  },
  Affix: {
    component: Affix as unknown as FC,
    category: 'basic',
    title: '固定',
    icon: null,
    propsConfig: {
    },
  },
  FloatButton: {
    component: FloatButton as unknown as FC,
    category: 'basic',
    title: '浮动按钮',
    icon: null,
    propsConfig: {
    },
  }
};
