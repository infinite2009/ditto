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

export default {
  Button: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
      type: {
        name: 'type',
        initialValue: 'primary'
      }
    }
  },
  Divider: {
    component: Divider,
    title: '分割线',
    icon: null,
    propsConfig: {

    }
  },
  Space: {
    component: Space,
    title: '间距',
    icon: null,
    propsConfig: {
    }
  },
  Anchor: {
    component: Anchor,
    title: '锚点',
    icon: null,
    propsConfig: {
    }
  },
  Breadcrumb: {
    component: Breadcrumb,
    title: '面包屑',
    icon: null,
    propsConfig: {
    }
  },
  Dropdown: {
    component: Dropdown,
    title: '下拉菜单',
    icon: null,
    propsConfig: {
    }
  },
  Menu: {
    component: Menu,
    title: '菜单导航',
    icon: null,
    propsConfig: {
    }
  },
  Pagination: {
    component: Pagination,
    title: '分页',
    icon: null,
    propsConfig: {
    }
  },
  Steps: {
    component: Steps,
    title: '步骤条',
    icon: null,
    propsConfig: {

    }
  },
  Cascader: {
    component: Cascader,
    title: '级联选择',
    icon: null,
    propsConfig: {

    }
  },
  Checkbox: {
    component: Checkbox,
    title: '多选框',
    icon: null,
    propsConfig: {

    }
  },
  ColorPicker: {
    component: ColorPicker,
    title: '颜色选择器',
    icon: null,
    propsConfig: {

    }
  },
  DatePicker: {
    component: DatePicker,
    title: '日期选择器',
    icon: null,
    propsConfig: {

    }
  },
  Form: {
    component: Form,
    title: '表单',
    icon: null,
    propsConfig: {

    }
  },
  'Input.Search': {
    component: Input.Search,
    title: '搜索框',
    icon: null,
    propsConfig: {
    }
  },
  'Input.TextArea': {
    component: Input.TextArea,
    title: '多行文本',
    icon: null,
    propsConfig: {
    },
  },
  InputNumber: {
    component: InputNumber,
    title: '数字输入框',
    icon: null,
    propsConfig: {
    },
  },
  Mentions: {
    component: Mentions,
    title: '提及',
    icon: null,
    propsConfig: {

    },
  },
  Radio: {
    component: Radio,
    title: '单选框',
    icon: null,
    propsConfig: {

    },
  },
  Rate: {
    component: Rate,
    title: '评分',
    icon: null,
    propsConfig: {

    },
  },
  Select: {
    component: Select,
    title: '选择器',
    icon: null,
    propsConfig: {

    },
  },
  Slider: {
    component: Slider,
    title: '滑动输入条',
    icon: null,
    propsConfig: {

    },
  },
  Switch: {
    component: Switch,
    title: '开关',
    icon: null,
    propsConfig: {

    },
  },
  TimePicker: {
    component: TimePicker,
    title: '时间选择器',
    icon: null,
    propsConfig: {
    },
  },
  Transfer: {
    component: Transfer,
    title: '穿梭框',
    icon: null,
    propsConfig: {
    },
  },
  TreeSelect: {
    component: TreeSelect,
    title: '树选择',
    icon: null,
    propsConfig: {
    },
  },
  Upload: {
    component: Upload,
    title: '上传',
    icon: null,
    propsConfig: {
    },
  },
  Avatar: {
    component: Avatar,
    title: '头像',
    icon: null,
    propsConfig: {
    },
  },
  // TODO:
  Badge: {
    component: Badge,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Calendar: {
    component: Calendar,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Card: {
    component: Card,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Carousel: {
    component: Carousel,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Collapse: {
    component: Collapse,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Descriptions: {
    component: Descriptions,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Empty: {
    component: Empty,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Image: {
    component: Image,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  List: {
    component: List,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Popover: {
    component: Popover,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Statistic: {
    component: Statistic,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Table: {
    component: Table,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Tabs: {
    component: Tabs,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Tag: {
    component: Tag,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Tooltip: {
    component: Tooltip,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Tree: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Alert: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Drawer: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Modal: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Notification: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Popconfirm: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Result: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Skeleton: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Spin: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  Affix: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  },
  FloatButton: {
    component: Button,
    title: '按钮',
    icon: null,
    propsConfig: {
    },
  }
};
