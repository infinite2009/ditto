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
import IComponentConfig, { IPropsConfigItem } from '@/types/component-config';
import PageRoot from '@/components/page-root';
import Container from '@/components/container';
import { fetchCamelotComponentConfig } from '@/service/load-config/camelot';
import {
  AnchorIcon,
  AvatarIcon,
  BreadCrumbIcon,
  ButtonIcon,
  CarouselIcon,
  CheckboxIcon,
  CollapseIcon,
  DatePickerIcon,
  DrawerIcon,
  EmptyIcon,
  ImageIcon,
  InputIcon,
  ListIcon,
  MenuNavigateIcon,
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
  TitleIcon,
  TransferIcon,
  TreeSelectIcon,
  UploadIcon
} from '@/components/icon';

const defaultStyleConfig: IPropsConfigItem = {
  id: 'style',
  schemaType: 'props',
  name: 'style',
  title: '样式',
  category: 'style',
  value: {
    padding: 8
  },
  valueType: 'object',
  valueSource: 'editorInput'
};

const flexTransformerStr =
  'return ((values) => {' +
  '  if (!values) {' +
  '    return {};' +
  '  }' +
  '  const { vertical, wrap, align, justify, gap } = values;' +
  '  const result = {' +
  "    flexDirection: vertical ? 'column' : 'row'," +
  "    flexWrap: wrap || 'nowrap'" +
  '  };' +
  '  if (align) {' +
  "    result.alignItems = align === 'normal' ? 'start' : align;" +
  '  }' +
  '  if (justify) {' +
  "    result.justifyContent = justify === 'normal' ? 'start' : justify;" +
  '  }' +
  '  if (gap) {' +
  "    if (typeof gap === 'number') {" +
  '      result.rowGap = gap;' +
  '      result.columnGap = gap;' +
  '    } else {' +
  '      const gapRegex = /\\s*(\\S+)\\s*(\\S+)?/;' +
  '      const match = gap.toString().match(gapRegex);' +
  '      if (match) {' +
  '        const [, rowGap, columnGap] = match;' +
  "        result.rowGap = +(rowGap.replace('px', ''));" +
  "        result.columnGap = columnGap ? +(columnGap.replace('px', '')) : result.rowGap;" +
  '      }' +
  '    }' +
  '  }' +
  '  return result;' +
  '})(values)';

const typographyTransformerStr =
  'return ((values) => {' +
  '  if (!values) {' +
  '    return {};' +
  '  }' +
  '  const result = {};' +
  '  const { strong, italic, underline  } = values;' +
  '  const arr = [];' +
  '  if (values.delete) {' +
  "    arr.push('line-through');" +
  '  }' +
  '  if (underline) {' +
  "    arr.push('underline');" +
  '  }' +
  '  if (arr.length) {' +
  "    result.textDecoration = arr.join(' ');" +
  '  }' +
  '  if (italic) {' +
  "    result.fontStyle = 'italic';" +
  '  }' +
  '  if (strong) {' +
  '    result.fontWeight = 600;' +
  '  }' +
  '  return result;' +
  '})(values)';

const antdComponentConfig: Record<string, IComponentConfig> = {
  PageRoot: {
    configName: 'PageRoot',
    callingName: 'Flex',
    category: '通用',
    isHidden: true,
    isContainer: true,
    dependency: 'antd',
    component: PageRoot,
    title: '页面',
    icon: CodeSandboxOutlined,
    propsConfig: {
      style: {
        ...defaultStyleConfig,
        value: {}
      },
      vertical: {
        id: 'vertical',
        schemaType: 'props',
        name: 'vertical',
        title: '布局方向',
        category: 'hidden',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      wrap: {
        id: 'wrap',
        schemaType: 'props',
        name: 'wrap',
        title: '自动换行',
        category: 'hidden',
        value: 'nowrap',
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      justify: {
        id: 'justify',
        name: 'justify',
        title: '主轴对齐',
        schemaType: 'props',
        category: 'hidden',
        value: 'start',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      align: {
        id: 'align',
        schemaType: 'props',
        name: 'align',
        title: '副轴对齐',
        category: 'hidden',
        value: 'start',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      gap: {
        id: 'gap',
        schemaType: 'props',
        name: 'gap',
        title: '间距',
        category: 'hidden',
        value: 0,
        valueType: 'number',
        valueSource: 'editorInput'
      }
    },
    transformerStr: flexTransformerStr
  },
  HorizontalFlex: {
    configName: 'HorizontalFlex',
    callingName: 'Flex',
    dependency: 'antd',
    isContainer: true,
    category: '布局',
    title: '水平弹性布局',
    icon: CodeSandboxOutlined,
    component: Container,
    propsConfig: {
      style: {
        ...defaultStyleConfig,
        value: {}
      },
      vertical: {
        id: 'vertical',
        schemaType: 'props',
        name: 'vertical',
        title: '布局方向',
        category: 'hidden',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      wrap: {
        id: 'wrap',
        schemaType: 'props',
        title: '自动换行',
        name: 'wrap',
        category: 'hidden',
        value: 'nowrap',
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      justify: {
        id: 'justify',
        title: '主轴对齐',
        name: 'justify',
        schemaType: 'props',
        category: 'hidden',
        value: 'start',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      align: {
        id: 'align',
        schemaType: 'props',
        title: '副轴对齐',
        name: 'align',
        category: 'hidden',
        value: 'start',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      gap: {
        id: 'gap',
        schemaType: 'props',
        name: 'gap',
        title: '间距',
        category: 'hidden',
        value: 0,
        valueType: 'number',
        valueSource: 'editorInput'
      }
    },
    // children: {
    //   value: [],
    //   type: 'template',
    //   category: 'hidden'
    // },
    transformerStr: flexTransformerStr
  },
  VerticalFlex: {
    configName: 'VerticalFlex',
    callingName: 'Flex',
    dependency: 'antd',
    isContainer: true,
    category: '布局',
    title: '垂直弹性布局',
    icon: CodeSandboxOutlined,
    component: Container,
    propsConfig: {
      style: {
        ...defaultStyleConfig,
        value: {}
      },
      vertical: {
        id: 'vertical',
        schemaType: 'props',
        name: 'vertical',
        title: '布局方向',
        category: 'hidden',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      wrap: {
        id: 'wrap',
        schemaType: 'props',
        title: '自动换行',
        name: 'wrap',
        category: 'hidden',
        value: 'nowrap',
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      justify: {
        id: 'justify',
        title: '主轴对齐',
        name: 'justify',
        schemaType: 'props',
        category: 'hidden',
        value: 'start',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      align: {
        id: 'align',
        schemaType: 'props',
        title: '副轴对齐',
        name: 'align',
        category: 'hidden',
        value: 'start',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      gap: {
        id: 'gap',
        name: 'gap',
        schemaType: 'props',
        title: '间距',
        category: 'hidden',
        value: 0,
        valueType: 'string',
        valueSource: 'editorInput'
      }
    },
    // children: {
    //   value: [],
    //   type: 'template',
    //   category: 'hidden'
    // },
    transformerStr: flexTransformerStr
  },
  Button: {
    configName: 'Button',
    dependency: 'antd',
    component: Button,
    category: '通用',
    title: '按钮',
    icon: ButtonIcon,
    propsConfig: {
      type: {
        id: 'type',
        schemaType: 'props',
        name: 'type',
        title: '类型',
        category: 'basic',
        value: 'primary',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      danger: {
        id: 'danger',
        schemaType: 'props',
        name: 'danger',
        title: '设置危险按钮',
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
      href: {
        id: 'href',
        schemaType: 'props',
        name: 'href',
        title: '链接',
        category: 'basic',
        value: undefined,
        valueType: 'string',
        valueSource: 'editorInput'
      },
      target: {
        id: 'target',
        schemaType: 'props',
        name: 'target',
        title: '目标页',
        category: 'basic',
        value: '_blank',
        valueType: 'string',
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
      shape: {
        id: 'shape',
        schemaType: 'props',
        name: 'shape',
        title: '形状',
        category: 'basic',
        value: 'default',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      size: {
        id: 'size',
        schemaType: 'props',
        name: 'size',
        title: '尺寸',
        category: 'basic',
        value: 'middle',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      style: {
        ...defaultStyleConfig
      },
      onClick: {
        id: 'onClick',
        schemaType: 'props',
        name: 'onClick',
        title: '点击',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      }
    },
    children: {
      name: 'children',
      type: 'text',
      value: '按钮',
      category: 'children'
    }
  },
  Text: {
    configName: 'Text',
    callingName: 'Typography.Text',
    dependency: 'antd',
    component: Typography.Text,
    category: '通用',
    title: '文字',
    icon: TextIcon,
    propsConfig: {
      style: {
        ...defaultStyleConfig
      },
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
      value: '默认文字',
      type: 'text',
      category: 'children'
    }
  },
  Amount: {
    configName: 'Amount',
    callingName: 'Typography.Text',
    dependency: 'antd',
    component: Typography.Text,
    category: '通用',
    title: '金额',
    isHidden: true,
    icon: TextIcon,
    propsConfig: {
      style: {
        ...defaultStyleConfig
      },
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
    callingName: 'Typography.Paragraph',
    dependency: 'antd',
    component: Typography.Paragraph,
    category: '通用',
    title: '段落',
    icon: TextIcon,
    propsConfig: {
      style: {
        ...defaultStyleConfig
      },
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
    callingName: 'Typography.Title',
    dependency: 'antd',
    component: Typography.Title,
    category: '通用',
    title: '标题',
    icon: TitleIcon,
    propsConfig: {
      style: {
        ...defaultStyleConfig
      },
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
    dependency: 'antd',
    component: Divider,
    category: '布局',
    title: '分割线',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Space: {
    configName: 'Space',
    dependency: 'antd',
    component: Space,
    category: '布局',
    title: '间距',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Anchor: {
    configName: 'Anchor',
    dependency: 'antd',
    component: Anchor,
    category: '导航',
    title: '锚点',
    isHidden: true,
    icon: AnchorIcon,
    propsConfig: {}
  },
  Breadcrumb: {
    configName: 'Breadcrumb',
    dependency: 'antd',
    component: Breadcrumb,
    category: '导航',
    isHidden: true,
    title: '面包屑',
    icon: BreadCrumbIcon,
    propsConfig: {}
  },
  Dropdown: {
    configName: 'Dropdown',
    dependency: 'antd',
    component: Dropdown,
    category: '导航',
    isHidden: true,
    title: '下拉菜单',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Menu: {
    configName: 'Menu',
    dependency: 'antd',
    component: Menu,
    category: '导航',
    isHidden: true,
    title: '菜单导航',
    icon: MenuNavigateIcon,
    propsConfig: {}
  },
  Pagination: {
    configName: 'Pagination',
    dependency: 'antd',
    component: Pagination,
    category: '导航',
    isHidden: true,
    title: '分页',
    icon: PaginationIcon,
    propsConfig: {}
  },
  Steps: {
    configName: 'Steps',
    dependency: 'antd',
    component: Steps,
    category: '导航',
    isHidden: true,
    title: '步骤条',
    icon: StepsIcon,
    propsConfig: {}
  },
  Input: {
    configName: 'Input',
    callingName: 'Input',
    dependency: 'antd',
    component: Input,
    category: '数据录入',
    title: '输入框',
    icon: InputIcon,
    propsConfig: {
      value: {
        id: 'value',
        schemaType: 'props',
        name: 'value',
        title: '值',
        category: 'basic',
        value: '',
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
        valueType: 'string',
        valueSource: 'editorInput'
      }
    }
  },
  'Input.Search': {
    configName: 'Input.Search',
    callingName: 'Input.Search',
    dependency: 'antd',
    component: Input.Search,
    importName: 'Input',
    category: '数据录入',
    title: '搜索框',
    icon: SearchIcon,
    propsConfig: {}
  },
  'Input.TextArea': {
    configName: 'Input.TextArea',
    callingName: 'Input.TextArea',
    importName: 'Input',
    dependency: 'antd',
    component: Input.TextArea,
    category: '数据录入',
    title: '多行文本',
    icon: InputIcon,
    propsConfig: {}
  },
  'Input.Password': {
    configName: 'Input.Password',
    callingName: 'Input.Password',
    dependency: 'antd',
    component: Input.Password,
    importName: 'Input',
    category: '数据录入',
    title: '密码框',
    icon: InputIcon,
    propsConfig: {}
  },
  InputNumber: {
    configName: 'InputNumber',
    dependency: 'antd',
    component: InputNumber,
    category: '数据录入',
    title: '数字输入框',
    icon: InputIcon,
    propsConfig: {}
  },
  Cascader: {
    configName: 'Cascader',
    dependency: 'antd',
    component: Cascader,
    category: '数据录入',
    title: '级联选择',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Checkbox: {
    configName: 'Checkbox',
    dependency: 'antd',
    component: Checkbox,
    category: '数据录入',
    title: '多选框',
    icon: CheckboxIcon,
    propsConfig: {}
  },
  ColorPicker: {
    configName: 'ColorPicker',
    dependency: 'antd',
    component: ColorPicker,
    category: '数据录入',
    title: '颜色选择器',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  DatePicker: {
    configName: 'DatePicker',
    dependency: 'antd',
    component: DatePicker as unknown as FC,
    category: '数据录入',
    title: '日期选择器',
    icon: DatePickerIcon,
    propsConfig: {}
  },
  RangePicker: {
    configName: 'RangePicker',
    dependency: 'antd',
    component: DatePicker as unknown as FC,
    category: '数据录入',
    title: '时间范围选择器',
    icon: DatePickerIcon,
    propsConfig: {}
  },
  Form: {
    configName: 'Form',
    component: Form,
    category: '数据录入',
    title: '表单',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {},
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
    component: Form.Item,
    category: '数据录入',
    title: '表单项',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    isHidden: true,
    propsConfig: {
      name: {
        id: 'name',
        schemaType: 'props',
        name: 'name',
        title: '字段名',
        category: 'basic',
        value: '默认name',
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
        valueType: 'string',
        valueSource: 'editorInput'
      }
    },
    children: {
      value: [],
      type: 'template',
      name: 'children',
      category: 'children'
    }
  },
  Mentions: {
    configName: 'Mentions',
    dependency: 'antd',
    component: Mentions,
    category: '数据录入',
    title: '提及',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Radio: {
    configName: 'Radio',
    dependency: 'antd',
    component: Radio,
    category: '数据录入',
    title: '单选框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Rate: {
    configName: 'Rate',
    component: Rate,
    category: '数据录入',
    title: '评分',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Select: {
    configName: 'Select',
    dependency: 'antd',
    component: Select,
    category: '数据录入',
    title: '选择器',
    icon: SelectIcon,
    propsConfig: {
      defaultValue: {
        schemaType: 'props',
        title: '值',
        id: 'defaultValue',
        name: 'defaultValue',
        category: 'basic',
        isValue: true,
        valueSource: 'userInput',
        valueType: 'string'
      },
      options: {
        schemaType: 'props',
        title: '选项',
        id: 'options',
        name: 'options',
        category: 'basic',
        isValue: true,
        valueSource: 'editorInput',
        valueType: 'string'
      }
    }
  },
  Slider: {
    configName: 'Slider',
    dependency: 'antd',
    component: Slider,
    category: '数据录入',
    title: '滑动输入条',
    icon: SliderIcon,
    propsConfig: {}
  },
  Switch: {
    configName: 'Switch',
    dependency: 'antd',
    component: Switch,
    category: '数据录入',
    title: '开关',
    icon: SwitchIcon,
    propsConfig: {}
  },
  TimePicker: {
    configName: 'TimePicker',
    dependency: 'antd',
    component: TimePicker,
    category: '数据录入',
    title: '时间选择器',
    icon: DatePickerIcon,
    propsConfig: {}
  },
  Transfer: {
    configName: 'Transfer',
    dependency: 'antd',
    component: Transfer,
    category: '数据录入',
    title: '穿梭框',
    icon: TransferIcon,
    propsConfig: {}
  },
  TreeSelect: {
    configName: 'TreeSelect',
    dependency: 'antd',
    component: TreeSelect,
    category: '数据录入',
    title: '树选择',
    icon: TreeSelectIcon,
    propsConfig: {}
  },
  Upload: {
    configName: 'Upload',
    dependency: 'antd',
    component: Upload,
    category: '数据录入',
    title: '上传',
    icon: UploadIcon,
    propsConfig: {}
  },
  Avatar: {
    configName: 'Avatar',
    dependency: 'antd',
    component: Avatar,
    category: '数据展示',
    title: '头像',
    icon: AvatarIcon,
    propsConfig: {}
  },
  // TODO:
  Badge: {
    configName: 'Badge',
    dependency: 'antd',
    component: Badge,
    category: '数据展示',
    title: '徽标数',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Calendar: {
    configName: 'Calendar',
    dependency: 'antd',
    component: Calendar,
    category: '数据展示',
    title: '日历',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Card: {
    configName: 'Card',
    component: Card,
    category: '数据展示',
    title: '卡片',
    dependency: 'antd',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Carousel: {
    configName: 'Carousel',
    dependency: 'antd',
    component: Carousel,
    category: '数据展示',
    title: '走马灯',
    icon: CarouselIcon,
    propsConfig: {}
  },
  Collapse: {
    configName: 'Collapse',
    dependency: 'antd',
    component: Collapse,
    category: '数据展示',
    title: '折叠面板',
    icon: CollapseIcon,
    propsConfig: {}
  },
  Descriptions: {
    configName: 'Descriptions',
    dependency: 'antd',
    component: Descriptions,
    category: '数据展示',
    title: '描述列表',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Empty: {
    configName: 'Empty',
    dependency: 'antd',
    component: Empty,
    category: '数据展示',
    title: '空状态',
    icon: EmptyIcon,
    propsConfig: {}
  },
  Image: {
    configName: 'Image',
    dependency: 'antd',
    component: Image as unknown as FC,
    category: '数据展示',
    title: '图片',
    icon: ImageIcon,
    propsConfig: {}
  },
  List: {
    configName: 'List',
    component: List,
    category: '数据展示',
    title: '列表',
    dependency: 'antd',
    icon: ListIcon,
    propsConfig: {}
  },
  Popover: {
    configName: 'Popover',
    dependency: 'antd',
    component: Popover,
    category: '数据展示',
    title: '气泡卡片',
    icon: PopoverIcon,
    propsConfig: {}
  },
  Statistic: {
    configName: 'Statistic',
    dependency: 'antd',
    component: Statistic,
    category: '数据展示',
    title: '统计数值',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Table: {
    configName: 'Table',
    callingName: 'Table',
    dependency: 'antd',
    component: Table,
    category: '数据展示',
    title: '表格',
    icon: TableIcon,
    propsConfig: {
      style: {
        ...defaultStyleConfig
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
      notDraggable: true
    }
  },
  Tabs: {
    configName: 'Tabs',
    dependency: 'antd',
    component: Tabs,
    category: '数据展示',
    title: '标签页',
    icon: TabsIcon,
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
        title: 'tabBarExtraContent',
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
      }
    }
  },
  Tag: {
    configName: 'Tag',
    component: Tag,
    category: '数据展示',
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
        value: 'success',
        category: 'basic'
      }
    },
    children: {
      name: 'children',
      type: 'text',
      value: 'success',
      category: 'children'
    }
  },
  Tooltip: {
    configName: 'Tooltip',
    dependency: 'antd',
    component: Tooltip,
    category: '数据展示',
    title: '文字提示',
    icon: PopoverIcon,
    propsConfig: {}
  },
  Tree: {
    configName: 'Tree',
    dependency: 'antd',
    component: Tree,
    category: '数据展示',
    title: '树形控件',
    icon: TreeSelectIcon,
    propsConfig: {}
  },
  Alert: {
    configName: 'Alert',
    dependency: 'antd',
    component: Alert,
    category: '反馈',
    title: '警告提示',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Drawer: {
    configName: 'Drawer',
    dependency: 'antd',
    component: Drawer,
    isLayer: true,
    category: '反馈',
    title: '抽屉',
    icon: DrawerIcon,
    propsConfig: {
      open: {
        id: 'open',
        schemaType: 'props',
        name: 'open',
        title: '显示',
        value: true,
        valueType: 'boolean',
        valueSource: 'userInput',
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
  Modal: {
    configName: 'Modal',
    dependency: 'antd',
    component: Modal,
    category: '反馈',
    title: '模态框',
    isLayer: true,
    icon: TitleIcon,
    propsConfig: {
      title: {
        id: 'title',
        schemaType: 'props',
        name: 'title',
        title: '标题',
        value: '新建弹窗',
        valueType: 'string',
        valueSource: 'editorInput',
        category: 'basic'
      },
      open: {
        id: 'open',
        schemaType: 'props',
        name: 'open',
        title: '打开窗口',
        value: true,
        valueType: 'boolean',
        valueSource: 'userInput',
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
  Popconfirm: {
    configName: 'Popconfirm',
    dependency: 'antd',
    component: Popconfirm as unknown as FC,
    category: '反馈',
    title: '气泡确认框',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Result: {
    configName: 'Result',
    dependency: 'antd',
    component: Result,
    category: '反馈',
    title: '结果',
    isHidden: true,
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  Affix: {
    configName: 'Affix',
    dependency: 'antd',
    component: Affix as unknown as FC,
    category: '其他',
    isHidden: true,
    title: '固定',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  },
  FloatButton: {
    configName: 'FloatButton',
    dependency: 'antd',
    isHidden: true,
    component: FloatButton as unknown as FC,
    category: '通用',
    title: '浮动按钮',
    icon: CodeSandboxOutlined,
    propsConfig: {}
  }
};

const defaultComponentValueConfig = {
  antd: {
    PageRoot: {
      style: {
        padding: 8
      },
      vertical: true,
      wrap: 'nowrap',
      justify: 'start',
      align: 'start',
      gap: 8
    },
    HorizontalFlex: {
      style: {
        padding: 8
      },
      vertical: false,
      wrap: 'nowrap',
      justify: 'start',
      align: 'center',
      gap: 8
    },
    VerticalFlex: {
      style: {
        padding: 8
      },
      vertical: true,
      wrap: 'nowrap',
      justify: 'start',
      align: 'start',
      gap: 8
    },
    Button: {
      type: 'primary',
      danger: false,
      disabled: false,
      target: '_blank',
      loading: false,
      shape: 'default',
      size: 'middle',
      onClick: undefined
    },
    Text: {
      copyable: false,
      delete: false,
      disabled: false,
      editable: false,
      ellipsis: false,
      mark: false,
      strong: false,
      italic: false,
      underline: false
    },
    Amount: {
      copyable: false,
      delete: false,
      disabled: false,
      editable: false,
      ellipsis: false,
      mark: false,
      strong: false,
      italic: false,
      underline: false
    },
    Paragraph: {
      copyable: false,
      delete: false,
      disabled: false,
      editable: false,
      ellipsis: false,
      mark: false,
      strong: false,
      italic: false,
      underline: false
    },
    Title: {
      copyable: false,
      delete: false,
      disabled: false,
      editable: false,
      ellipsis: false,
      mark: false,
      strong: false,
      italic: false,
      underline: false
    },
    Divider: {},
    Space: {},
    Anchor: {},
    Breadcrumb: {},
    Dropdown: {},
    Menu: {},
    Pagination: {},
    Steps: {},
    Input: {
      value: '',
      placeholder: '请输入'
    },
    'Input.Search': {},
    'Input.TextArea': {},
    'Input.Password': {},
    InputNumber: {},
    Cascader: {},
    Checkbox: {},
    ColorPicker: {},
    DatePicker: {},
    RangePicker: {},
    Form: {},
    FormItem: {
      name: '字段',
      label: '默认字段'
    },
    Mentions: {},
    Radio: {},
    Rate: {},
    Select: {
      defaultValue: '0',
      options: [
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
    Slider: {},
    Switch: {},
    TimePicker: {},
    Transfer: {},
    TreeSelect: {},
    Upload: {},
    Avatar: {},
    Badge: {},
    Calendar: {},
    Card: {},
    Carousel: {},
    Collapse: {},
    Descriptions: {},
    Empty: {},
    Image: {},
    List: {},
    Popover: {},
    Statistic: {},
    Table: {
      columns: [
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
    Tabs: {
      items: [
        {
          key: '1',
          label: '新建标签页',
          children: {}
        }
      ],
      tabBarExtraContent: {}
    },
    Tag: {
      color: 'success'
    },
    Tooltip: {},
    Tree: {},
    Alert: {},
    Drawer: {
      open: true
    },
    Modal: {
      title: '新建弹窗',
      open: true
    },
    Notification: {},
    Popconfirm: {},
    Result: {},
    Affix: {},
    FloatButton: {}
  }
};

export default class ComponentManager {
  private static componentConfig: Record<string, Record<string, IComponentConfig>> = null;
  private static defaultComponentValueConfig: Record<string, Record<string, any>> = null;

  static get componentConfigList() {
    return ComponentManager.componentConfig;
  }

  static async init() {
    ComponentManager.initDefaultComponentValueConfig();
    await ComponentManager.loadComponentConfigList();
  }

  static fetchComponentConfig(configName: string, dependency: string) {
    if (!ComponentManager.componentConfig) {
      return null;
    }
    return ComponentManager.componentConfig[dependency]?.[configName] || null;
  }

  static fetchDefaultValueOf(configName: string, dependency: string) {
    if (!ComponentManager.defaultComponentValueConfig) {
      return null;
    }
    return ComponentManager.defaultComponentValueConfig[dependency]?.[configName] || null;
  }

  static async refreshComponentConfig() {
    ComponentManager.componentConfig = null;
    return await ComponentManager.loadComponentConfigList();
  }

  /**
   * 初始化组件的默认值配置
   */
  private static initDefaultComponentValueConfig() {
    this.defaultComponentValueConfig = defaultComponentValueConfig;
  }

  private static async loadComponentConfigList() {
    if (!ComponentManager.componentConfig) {
      let camelotComponentConfig: Record<string, IComponentConfig> = {};
      try {
        camelotComponentConfig = await fetchCamelotComponentConfig();
      } catch (err) {
        console.error(err);
      }
      ComponentManager.componentConfig = { antd: antdComponentConfig, camelot: camelotComponentConfig };
      return ComponentManager.componentConfig;
    }
    return ComponentManager.componentConfig;
  }
}
