import IFormConfig from '@/types/form-config';
import CustomTabForm from '@/pages/components/custom-forms/custom-tab-form';
import { FC } from 'react';
import CustomTableForm from '@/pages/components/custom-forms/custom-table-form';
import CustomFormForm from '@/pages/components/custom-forms/custom-form-form';
import CustomSelectForm from '@/pages/components/custom-forms/custom-select-form';
import SelectOptions from '@/pages/editor/form-panel/basic-form/select-options';
import CustomListForm from '../../pages/components/custom-forms/custom-list-form';
import CustomTagForm from '@/pages/components/custom-forms/custom-tag-form';
import CustomCollapseForm from '@/pages/components/custom-forms/custom-collapse-form';
import CustomCascaderForm from '@/pages/components/custom-forms/custom-cascader-form';
import CustomAnchorForm from '@/pages/components/custom-forms/custom-anchor-form';
import CustomStepsForm from '@/pages/components/custom-forms/custom-steps-form';
import CustomTreeForm from '@/pages/components/custom-forms/custom-tree-form';
import customRangePickerForm from '@/pages/components/custom-forms/custom-range-picker-form';
import CustomPopoverForm from '@/pages/components/custom-forms/custom-popover-form';

import { eeFormCompConfig } from '../component-manager/eeCompConfig';
import CustomSliderForm from '@/pages/components/custom-forms/custom-slider-form';
import CustomTransferForm from '@/pages/components/custom-forms/custom-transfer-form';
import CustomDescriptionsForm from '@/pages/components/custom-forms/custom-descriptions-form';
import CustomUploadForm from '@/pages/components/custom-forms/custom-upload-form';
import CustomEEApprove from '@/pages/components/custom-forms/custom-ee-approve';
import CustomProMenuForm from '@/pages/components/custom-forms/custom-promenu-form';
import CustomProTitleForm from '@/pages/components/custom-forms/custom-protitle-form';
import { NativeSchemaConfig, SchemaConfig } from '../components';

const inputEventConfig = {
  onInput: {
    name: 'onInput',
    title: '输入时',
    component: 'Select'
  },
  onPressEnter: {
    name: 'onPressEnter',
    title: '回车时',
    component: 'Select'
  },
  onBlur: {
    name: 'onBlur',
    title: '失焦时',
    component: 'Select'
  }
};

const onChangeEventConfig = {
  name: 'onChange',
  title: '发生变更时',
  component: 'Select'
};

const typographyTransformerStr =
  'return (values => {' +
  '  if (!values) {' +
  '    return {};' +
  '  }' +
  '  const result = {};' +
  '  const { textDecoration, /*fontWeight, fontStyle*/ } = values;' +
  '  if (textDecoration) {' +
  "    const arr = textDecoration.split(' ');" +
  "    if (arr.includes('line-through')) {" +
  '      result.delete = true;' +
  '    }' +
  "    if (arr.includes('underline')) {" +
  '      result.underline = true;' +
  '    }' +
  '  }' +
  // '  if (fontWeight >= 600) {' +
  // '    result.strong = true;' +
  // '  }' +
  // "  if (fontStyle === 'italic') {" +
  // '    result.italic = true;' +
  // '  }' +
  '  return result;' +
  '})(values);';

const ANTD_FORM_CONFIG = {
  ...NativeSchemaConfig,
  ...SchemaConfig,
  Anchor: {
    configName: 'Anchor',
    formComponent: {
      basic: CustomAnchorForm
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true,
          wrap: true,
          direction: true,
          alignItems: true,
          justifyContent: true,
          padding: true,
          gap: true
        },
        backgroundColor: true,
        border: {
          borderWidth: true,
          borderColor: true,
          borderStyle: true
        }
      },
      basic: {
        direction: {
          name: 'direction',
          type: 'string',
          title: '导航方向',
          required: false,
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'horizontal',
                label: 'horizontal'
              },
              {
                value: 'vertical',
                label: 'vertical'
              }
            ]
          },
          initialValue: 'horizontal'
        },
        affix: {
          name: 'affix',
          type: 'boolean',
          title: '开启固定模式',
          required: true,
          component: 'Switch'
        },
        offsetTop: {
          name: 'offsetTop',
          type: 'number',
          title: '距顶部偏移量',
          component: 'InputNumber',
          initialValue: 0
        }
      }
    }
  },
  Divider: {
    configName: 'Divider',
    schema: {
      style: {
        layout: {
          width: true,
          height: true,
          margin: true
        }
      },
      basic: {
        type: {
          name: 'type',
          type: 'string',
          title: '方向',
          component: 'Select',
          componentProps: {
            options: [
              {
                value: 'horizontal',
                label: '横向'
              },
              {
                value: 'vertical',
                label: '纵向'
              }
            ]
          }
        },
        dashed: {
          name: 'dashed',
          type: 'boolean',
          title: '是否虚线',
          required: false,
          component: 'Switch'
        }
        // children: {
        //   name: 'children',
        //   type: 'string',
        //   title: '嵌套的标题',
        //   component: 'Input',
        //   initialValue: ''
        // }
      }
    }
  },
  Avatar: {
    configName: 'Avatar',
    schema: {
      basic: {
        src: {
          name: 'src',
          type: 'string',
          title: '图片地址',
          component: 'Input'
        },
        shape: {
          name: 'shape',
          type: 'string',
          title: '形状',
          component: 'Select',
          componentProps: {
            options: [
              {
                value: 'circle',
                label: '圆形'
              },
              {
                value: 'square',
                label: '方形'
              }
            ]
          }
        },
        size: {
          name: 'size',
          type: 'string',
          title: '大小',
          component: 'Select',
          componentProps: {
            options: [
              { value: 'default', label: '默认' },
              {
                value: 'large',
                label: '大'
              },
              { value: 'small', label: '小' },
              {
                value: 20,
                label: '20'
              },
              {
                value: 16,
                label: '16'
              }
            ]
          }
        }
      },
      event: {
        onClick: {
          name: 'onClick',
          title: '左键点击时',
          component: 'Select'
        }
      }
    }
    // events: true
  },
  Select: {
    configName: 'Select',
    formComponent: {
      basic: CustomSelectForm as FC<any>
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true,
          // wrap: true,
          // direction: true,
          // alignItems: true,
          // justifyContent: true,
          padding: true,
          gap: true
        },
        backgroundColor: true,
        text: {
          // 字号和行高
          size: true,
          color: true,
          decoration: true
        }
      },
      basic: {
        defaultValue: {
          name: 'defaultValue',
          type: 'string',
          title: '值',
          component: 'Input',
          initialValue: undefined,
          componentProps: {
            allowClear: true
          }
        },
        placeholder: {
          name: 'placeholder',
          type: 'string',
          title: '提示词',
          component: 'Input',
          initialValue: '请选择'
        },
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '禁用',
          component: 'Switch',
          initialValue: false
        }
      },
      event: {
        onChange: onChangeEventConfig
      }
    }
    // events: true
  },
  Modal: {
    configName: 'Modal',
    schema: {
      basic: {
        open: {
          name: 'open',
          type: 'boolean',
          title: '显示',
          component: 'Select',
        }
      },
      event: {
        onOk: {
          name: 'onOk',
          title: '确定时',
          component: 'Select'
        },
        onCancel: {
          name: 'onCancel',
          title: '取消时',
          component: 'Select'
        }
      }
    }
  },
  Drawer: {
    configName: 'Drawer',
    schema: {
      basic: {
        open: {
          name: 'open',
          type: 'boolean',
          title: '显示',
          component: 'Select',
        }
      },
      event: {
        onClose: {
          name: 'onClose',
          title: '关闭时',
          component: 'Select'
        }
      }
    }
  },
  Amount: {
    configName: 'Amount',
    transformerStr: typographyTransformerStr,
    schema: {
      style: {
        layout: {
          width: true,
          height: true,
          wrap: true,
          direction: true,
          alignItems: true,
          justifyContent: true,
          padding: true,
          gap: true
        },
        backgroundColor: true,
        text: {
          // 字号和行高
          size: true,
          color: true,
          decoration: true
        }
      },
      basic: {
        children: {
          name: 'children',
          type: 'string',
          title: '内容',
          component: 'Input',
          initialValue: '默认文字'
        }
      }
    }
  },
  Paragraph: {
    configName: 'Paragraph',
    transformerStr: typographyTransformerStr,
    schema: {
      style: {
        layout: {
          width: true,
          height: true,
          wrap: true,
          direction: true,
          alignItems: true,
          justifyContent: true,
          // padding: true,
          gap: true
        },
        backgroundColor: true,
        text: {
          // 字号和行高
          size: true,
          color: true,
          decoration: true
        }
      },
      basic: {
        children: {
          name: 'children',
          type: 'string',
          title: '内容',
          component: 'Input',
          initialValue: '默认段落'
        }
      }
    }
  },
  Title: {
    configName: 'Title',
    transformerStr: typographyTransformerStr,
    schema: {
      style: {
        layout: {
          width: true,
          height: true,
          wrap: true,
          direction: true,
          alignItems: true,
          justifyContent: true,
          // padding: true,
          gap: true
        },
        backgroundColor: true,
        text: {
          // 字号和行高
          size: true,
          color: true,
          decoration: true
        }
      },
      basic: {
        children: {
          name: 'children',
          type: 'string',
          title: '标题',
          component: 'Input',
          initialValue: '默认标题'
        }
      }
    }
  },
  Input: {
    configName: 'Input',
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        allowClear: {
          name: 'allowClear',
          type: 'boolean',
          title: '是否展示清除按钮',
          required: false,
          component: 'Switch'
        },
        bordered: {
          name: 'bordered',
          type: 'boolean',
          title: '是否展示边框',
          required: false,
          component: 'Switch'
        },
        maxLength: {
          name: 'maxLength',
          type: 'string',
          title: '内容最大长度',
          component: 'Input',
          initialValue: ''
        },
        showCount: {
          name: 'showCount',
          type: 'boolean',
          title: '是否展示字数',
          required: false,
          component: 'Switch'
        },
        defaultValue: {
          name: 'defaultValue',
          type: 'string',
          title: '默认值',
          component: 'Input',
          initialValue: ''
        },
        placeholder: {
          name: 'template',
          type: 'string',
          title: '提示词',
          component: 'Input',
          initialValue: '请输入'
        }
      },
      event: inputEventConfig
    }
    // events: true
  },
  'Input.Search': {
    configName: 'Input.Search',
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        allowClear: {
          name: 'allowClear',
          type: 'boolean',
          title: '是否展示清除按钮',
          required: false,
          component: 'Switch'
        },
        bordered: {
          name: 'bordered',
          type: 'boolean',
          title: '是否展示边框',
          required: false,
          component: 'Switch'
        },
        maxLength: {
          name: 'maxLength',
          type: 'string',
          title: '内容最大长度',
          component: 'Input',
          initialValue: ''
        },
        showCount: {
          name: 'showCount',
          type: 'boolean',
          title: '是否展示字数',
          required: false,
          component: 'Switch'
        },
        defaultValue: {
          name: 'defaultValue',
          type: 'string',
          title: '默认值',
          component: 'Input',
          initialValue: ''
        },
        placeholder: {
          name: 'template',
          type: 'string',
          title: '提示词',
          component: 'Input',
          initialValue: '请输入'
        },
        isFillMode: {
          name: 'isFillMode',
          type: 'boolean',
          title: 'FillMode模式',
          required: false,
          component: 'Switch'
        },
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '禁用',
          component: 'Switch',
          initialValue: false
        }
      },
      event: inputEventConfig
    }
    // events: true
  },
  'Input.TextArea': {
    configName: 'Input.TextArea',
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        allowClear: {
          name: 'allowClear',
          type: 'boolean',
          title: '是否展示清除按钮',
          required: false,
          component: 'Switch'
        },
        bordered: {
          name: 'bordered',
          type: 'boolean',
          title: '是否展示边框',
          required: false,
          component: 'Switch'
        },
        maxLength: {
          name: 'maxLength',
          type: 'string',
          title: '内容最大长度',
          component: 'Input',
          initialValue: ''
        },
        showCount: {
          name: 'showCount',
          type: 'boolean',
          title: '是否展示字数',
          required: false,
          component: 'Switch'
        },
        defaultValue: {
          name: 'defaultValue',
          type: 'string',
          title: '默认值',
          component: 'Input',
          initialValue: ''
        },
        placeholder: {
          name: 'template',
          type: 'string',
          title: '提示词',
          component: 'Input',
          initialValue: '请输入'
        },
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '禁用',
          component: 'Switch',
          initialValue: false
        }
      },
      event: inputEventConfig
    }
    // events: true
  },
  'Input.Password': {
    configName: 'Input.Password',
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        allowClear: {
          name: 'allowClear',
          type: 'boolean',
          title: '是否展示清除按钮',
          required: false,
          component: 'Switch'
        },
        bordered: {
          name: 'bordered',
          type: 'boolean',
          title: '是否展示边框',
          required: false,
          component: 'Switch'
        },
        maxLength: {
          name: 'maxLength',
          type: 'string',
          title: '内容最大长度',
          component: 'Input',
          initialValue: ''
        },
        showCount: {
          name: 'showCount',
          type: 'boolean',
          title: '是否展示字数',
          required: false,
          component: 'Switch'
        },
        defaultValue: {
          name: 'defaultValue',
          type: 'string',
          title: '默认值',
          component: 'Input',
          initialValue: ''
        },
        placeholder: {
          name: 'template',
          type: 'string',
          title: '提示词',
          component: 'Input',
          initialValue: '请输入'
        },
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '禁用',
          component: 'Switch',
          initialValue: false
        }
      },
      event: inputEventConfig
    }
    // events: true
  },
  Tabs: {
    configName: 'Tabs',
    formComponent: {
      basic: CustomTabForm as FC<any>
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      }
    }
  },
  Table: {
    configName: 'Table',
    formComponent: {
      basic: CustomTableForm as FC<any>
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      }
    }
  },
  Form: {
    configName: 'Form',
    formComponent: {
      basic: CustomFormForm
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      event: {
        onFinish: {
          name: 'onFinish',
          title: '提交表单时',
          component: 'Select'
        }
      }
    }
  },
  List: {
    configName: 'List',
    formComponent: {
      basic: CustomListForm as FC<any>
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      }
    }
  },
  Image: {
    configName: 'Image',
    schema: {
      basic: {
        src: {
          name: 'src',
          type: 'string',
          title: 'URL',
          component: 'Upload'
        },
        alt: {
          name: 'alt',
          type: 'string',
          title: '替代文本',
          initialValue: '这是一个占位符',
          component: 'Input'
        }
      },
      style: {
        layout: {
          width: true
        }
      }
    }
  },
  Placeholder: {
    configName: 'Placeholder',
    schema: {
      basic: {
        src: {
          name: 'src',
          type: 'string',
          title: 'URL',
          component: 'Upload'
        }
      },
      style: {
        layout: {
          width: true
        }
      }
    }
  },
  Tag: {
    configName: 'Tag',
    formComponent: {
      basic: CustomTagForm as FC<any>
    }
  },
  Steps: {
    configName: 'Steps',
    formComponent: {
      basic: CustomStepsForm
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        current: {
          name: 'current',
          type: 'number',
          title: '当前步骤',
          component: 'InputNumber',
          initialValue: 0
        },
        type: {
          name: 'type',
          type: 'string',
          title: '步骤条类型',
          required: false,
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'default',
                label: 'default'
              },
              {
                value: 'navigation',
                label: 'navigation'
              }
            ]
          },
          initialValue: 'default'
        },
        direction: {
          name: 'direction',
          type: 'string',
          title: '步骤条方向',
          required: false,
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'horizontal',
                label: 'horizontal'
              },
              {
                value: 'vertical',
                label: 'vertical'
              }
            ]
          },
          initialValue: 'horizontal'
        },
        labelPlacement: {
          name: 'labelPlacement',
          type: 'string',
          title: '标签位置',
          required: false,
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'horizontal',
                label: 'horizontal'
              },
              {
                value: 'vertical',
                label: 'vertical'
              }
            ]
          },
          initialValue: 'horizontal'
        },
        size: {
          name: 'size',
          type: 'string',
          title: '尺寸',
          required: false,
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'default',
                label: 'default'
              },
              {
                value: 'small',
                label: 'small'
              }
            ]
          },
          initialValue: 'default'
        },
        progressDot: {
          name: 'progressDot',
          type: 'boolean',
          title: '点状步骤条',
          component: 'Switch',
          initialValue: false
        }
      }
    }
  },
  Collapse: {
    configName: 'Collapse',
    formComponent: {
      basic: CustomCollapseForm as FC<any>
    }
  },
  Popover: {
    configName: 'Popover',
    formComponent: {
      basic: CustomPopoverForm as FC<any>
    },
    schema: {
      basic: {
        title: {
          name: 'title',
          type: 'string',
          title: '卡片标题',
          component: 'Input'
        },
        content: {
          name: 'content',
          type: 'string',
          title: '卡片内容',
          component: 'Input'
        },
        placement: {
          name: 'placement',
          type: 'string',
          title: '气泡位置',
          component: 'Select',
          componentProps: {
            options: [
              {
                value: 'top',
                label: '上'
              },
              {
                value: 'left',
                label: '左'
              },
              {
                value: 'right',
                label: '右'
              },
              {
                value: 'bottom',
                label: '下'
              },
              {
                value: 'topLeft',
                label: '上左'
              },
              {
                value: 'topRight',
                label: '上右'
              },
              {
                value: 'bottomLeft',
                label: '下左'
              },
              {
                value: 'bottomRight',
                label: '下右'
              },
              {
                value: 'leftTop',
                label: '左上'
              },
              {
                value: 'leftBottom',
                label: '左下'
              },
              {
                value: 'rightTop',
                label: '右上'
              },
              {
                value: 'rightBottom',
                label: '右下'
              }
            ]
          }
        },
        trigger: {
          name: 'trigger',
          type: 'string',
          title: '触发行为',
          component: 'Select',
          componentProps: {
            options: [
              {
                value: 'hover',
                label: '鼠标悬停'
              },
              {
                value: 'focus',
                label: '获得焦点'
              },
              {
                value: 'click',
                label: '鼠标点击'
              },
              {
                value: 'contextMenu',
                label: '右键菜单'
              }
            ]
          }
        },
        mouseEnterDelay: {
          name: 'mouseEnterDelay',
          type: 'string',
          title: '展示延时',
          component: 'Input'
        },
        mouseLeaveDelay: {
          name: 'mouseLeaveDelay',
          type: 'string',
          title: '隐藏延时',
          component: 'Input'
        }
      },
      style: {
        layout: {
          width: true,
          height: true
        }
      }
    }
  },
  Empty: {
    configName: 'Empty',
    schema: {
      basic: {
        image: {
          name: 'image',
          type: 'string',
          title: '图片地址',
          component: 'Input'
        },
        description: {
          name: 'description',
          type: 'string',
          title: '描述内容',
          component: 'Input'
        }
      }
    }
  },
  Cascader: {
    configName: 'Cascader',
    formComponent: {
      basic: CustomCascaderForm as FC<any>
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '禁用',
          component: 'Switch',
          initialValue: false
        }
      }
    }
  },

  RangePicker: {
    configName: 'RangePicker',
    formComponent: {
      basic: customRangePickerForm as FC<any>
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      event: {
        onChange: onChangeEventConfig
      }
    }
  },
  Tree: {
    configName: 'Tree',
    formComponent: {
      basic: CustomTreeForm('tree') as unknown as FC<any>
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        multiple: {
          name: 'placeholder',
          type: 'boolean',
          title: '是否多选',
          component: 'Switch',
          initialValue: false
        },
        checkable: {
          name: 'checkable',
          type: 'boolean',
          title: '是否增加复选框',
          component: 'Switch',
          initialValue: false
        },
        defaultExpandAll: {
          name: 'defaultExpandAll',
          type: 'boolean',
          title: '自动展开全部',
          component: 'Switch',
          initialValue: false,
          reRenderWhenChange: true
        },
        selectable: {
          name: 'selectable',
          type: 'boolean',
          title: '是否可选中',
          component: 'Switch',
          initialValue: false,
          reRenderWhenChange: true
        }
      }
    }
  },
  TreeSelect: {
    configName: 'TreeSelect',
    formComponent: {
      basic: CustomTreeForm('treeSelect') as unknown as FC<any>
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        placeholder: {
          name: 'placeholder',
          type: 'string',
          title: '提示词',
          component: 'Input',
          initialValue: '请选择'
        },
        multiple: {
          name: 'placeholder',
          type: 'boolean',
          title: '是否多选',
          component: 'Switch',
          initialValue: false
        },
        treeCheckable: {
          name: 'treeCheckable',
          type: 'boolean',
          title: '是否增加复选框',
          component: 'Switch',
          initialValue: false
        },
        treeDefaultExpandAll: {
          name: 'treeDefaultExpandAll',
          type: 'boolean',
          title: '自动展开全部',
          component: 'Switch',
          initialValue: false
        },
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '禁用',
          component: 'Switch',
          initialValue: false
        }
      },
      event: {
        onSelect: {
          name: 'onSelect',
          title: '选择时',
          component: 'Select'
        }
      }
    }
  },
  InputNumber: {
    configName: 'InputNumber',
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        defaultValue: {
          name: 'defaultValue',
          type: 'number',
          title: '默认值',
          component: 'InputNumber',
          initialValue: '',
          reRenderWhenChange: true
        },
        placeholder: {
          name: 'template',
          type: 'string',
          title: '提示词',
          component: 'Input',
          initialValue: '请输入'
        },
        controls: {
          name: 'controls',
          type: 'boolean',
          title: '是否显示增减按钮',
          component: 'Switch',
          initialValue: true
        },
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '是否禁用',
          component: 'Switch',
          initialValue: false
        },
        max: {
          name: 'max',
          type: 'number',
          title: '最大值',
          component: 'InputNumber',
          initialValue: null
        },
        min: {
          name: 'min',
          type: 'number',
          title: '最小值',
          component: 'InputNumber',
          initialValue: null
        },
        precision: {
          name: 'precision',
          type: 'number',
          title: '数值精度',
          component: 'InputNumber',
          initialValue: null
        },
        title: {
          name: 'template',
          type: 'string',
          title: 'title(bilibili/Ui)',
          component: 'Input',
          initialValue: '请输入'
        }
      },
      event: inputEventConfig
    }
    // events: true
  },
  Switch: {
    configName: 'Switch',
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        defaultChecked: {
          name: 'defaultChecked',
          type: 'boolean',
          title: '默认选中',
          required: false,
          component: 'Switch'
        },
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '是否禁用',
          required: false,
          component: 'Switch'
        },
        loading: {
          name: 'loading',
          type: 'boolean',
          title: '加载中',
          required: false,
          component: 'Switch'
        },
        size: {
          name: 'size',
          type: 'string',
          title: '尺寸',
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'default',
                label: 'default'
              },
              {
                value: 'small',
                label: 'small'
              }
            ]
          },
          initialValue: 'default'
        },
        checkedChildren: {
          name: 'checkedChildren',
          type: 'string',
          title: '选中时的内容',
          component: 'Input',
          initialValue: '请输入'
        },
        unCheckedChildren: {
          name: 'unCheckedChildren',
          type: 'string',
          title: '非选中时内容',
          component: 'Input',
          initialValue: '请输入'
        }
      },
      event: {
        onChange: onChangeEventConfig
      }
    }
  },
  Calendar: {
    configName: 'Calendar',
    schema: {
      basic: {
        fullscreen: {
          name: 'fullscreen',
          type: 'boolean',
          title: '是否全屏',
          required: false,
          component: 'Switch'
        },
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '禁用',
          component: 'Switch',
          initialValue: false
        }
        // mode: {
        //   name: 'mode',
        //   type: 'string',
        //   title: '初始模式',
        //   required: false,
        //   component: 'Select',
        //   componentProps: {
        //     options: [
        //       {
        //         value: 'month',
        //         label: '月'
        //       },
        //       {
        //         value: 'year',
        //         label: '年'
        //       },
        //     ]
        //   }
        // }
      },
      event: {
        onChange: onChangeEventConfig
      }
    }
  },
  Slider: {
    configName: 'Slider',
    formComponent: {
      basic: CustomSliderForm as FC<any>
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '是否禁用',
          required: false,
          component: 'Switch'
        },
        min: {
          name: 'min',
          type: 'number',
          title: '最小值',
          component: 'InputNumber',
          initialValue: null
        },
        max: {
          name: 'max',
          type: 'number',
          title: '最大值',
          component: 'InputNumber',
          initialValue: null
        },
        step: {
          name: 'step',
          type: 'number',
          title: '步长',
          component: 'InputNumber',
          initialValue: null
        },
        reverse: {
          name: 'reverse',
          type: 'boolean',
          title: '反向坐标轴',
          required: false,
          component: 'Switch'
        }
      }
    }
  },
  Transfer: {
    configName: 'Transfer',
    formComponent: {
      basic: CustomTransferForm
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '是否禁用',
          required: false,
          component: 'Switch'
        },
        oneWay: {
          name: 'oneWay',
          type: 'boolean',
          title: '展示为单向样式',
          required: false,
          component: 'Switch'
        },
        showSearch: {
          name: 'showSearch',
          type: 'boolean',
          title: '是否显示搜索框',
          required: false,
          component: 'Switch'
        },
        pagination: {
          name: 'pagination',
          type: 'boolean',
          title: '分页模式',
          required: false,
          component: 'Switch'
        }
      },
      event: {
        onChange: onChangeEventConfig
      }
    }
  },
  Descriptions: {
    configName: 'Descriptions',
    formComponent: {
      basic: CustomDescriptionsForm
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        title: {
          name: 'title',
          type: 'string',
          title: '标题',
          required: false,
          component: 'Input'
        },
        bordered: {
          name: 'bordered',
          type: 'boolean',
          title: '显示边框',
          required: false,
          component: 'Switch'
        },
        column: {
          name: 'column',
          type: 'number',
          title: '列数',
          component: 'InputNumber',
          initialValue: 3
        },
        size: {
          name: 'size',
          type: 'string',
          title: '尺寸',
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'default',
                label: 'default'
              },
              {
                value: 'middle',
                label: 'middle'
              },
              {
                value: 'small',
                label: 'small'
              }
            ]
          },
          initialValue: 'default'
        },
        layout: {
          name: 'layout',
          type: 'string',
          title: '布局方向',
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'horizontal',
                label: 'horizontal'
              },
              {
                value: 'vertical',
                label: 'vertical'
              }
            ]
          },
          initialValue: 'horizontal'
        },
        colon: {
          name: 'colon',
          type: 'boolean',
          title: '展示冒号',
          required: false,
          component: 'Switch'
        }
      }
    }
  },
  CommonUpload: {
    configName: 'CommonUpload',
    formComponent: {
      basic: CustomUploadForm
    },
    schema: {
      basic: {
        draggable: {
          name: 'draggable',
          type: 'boolean',
          title: '推拽上传',
          component: 'Switch',
          initialValue: false
        },
        maxSize: {
          name: 'maxSize',
          type: 'number',
          title: '文件大小',
          component: 'InputNumber',
          initialValue: 10,
          componentProps: {
            suffix: 'MB'
          }
        },
        editable: {
          name: 'editable',
          type: 'boolean',
          title: '是否可上传',
          component: 'Switch',
          initialValue: false
        },
        mirrorMode: {
          name: 'mirrorMode',
          type: 'boolean',
          title: '文件列表位置',
          component: 'Radio.Group',
          initialValue: false,
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: false,
                label: '下方'
              },
              {
                value: true,
                label: '上方'
              }
            ]
          }
        }
      },
      style: {
        layout: {
          width: true,
          height: true
        }
      }
    }
  },
  // 侧栏菜单
  ProMenu: {
    configName: 'ProMenu',
    formComponent: {
      basic: CustomProMenuForm
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        multiple: {
          name: 'placeholder',
          type: 'boolean',
          title: '是否多选',
          component: 'Switch',
          initialValue: false
        },
        showCollapse: {
          name: 'showCollapse',
          type: 'boolean',
          title: '启用底部功能区',
          component: 'Switch',
          initialValue: true
        },
        defaultCollapsed: {
          name: 'defaultCollapsed',
          type: 'boolean',
          title: '菜单默认收起',
          component: 'Switch',
          initialValue: false
        },
        resizable: {
          name: 'resizable',
          type: 'boolean',
          title: '启用拖拽功能',
          component: 'Switch',
          initialValue: true
        },
        triggerSubMenuAction: {
          name: 'triggerSubMenuAction',
          type: 'string',
          title: 'SubMenu触发行为',
          required: false,
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'hover',
                label: 'hover'
              },
              {
                value: 'click',
                label: 'click'
              }
            ]
          },
          initialValue: 'hover'
        },
        subMenuOpenDelay: {
          name: 'subMenuOpenDelay',
          type: 'number',
          title: '子菜单延时显示',
          component: 'InputNumber',
          initialValue: 0,
          componentProps: {
            suffix: '秒',
            step: 0.1
          }
        },
        subMenuCloseDelay: {
          name: 'subMenuCloseDelay',
          type: 'number',
          title: '子菜单延时隐藏',
          component: 'InputNumber',
          initialValue: 0.1,
          componentProps: {
            suffix: '秒',
            step: 0.1
          }
        }
      }
    }
  },
  // 侧栏菜单
  ProTitle: {
    configName: 'ProTitle',
    formComponent: {
      basic: CustomProTitleForm
    },
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        level: {
          name: 'level',
          type: 'string',
          title: '标题级别',
          required: true,
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 1,
                label: '一级标题'
              },
              {
                value: 2,
                label: '二级标题'
              }
            ]
          },
          initialValue: 1
        },
        title: {
          name: 'title',
          type: 'string',
          title: '标题字段',
          component: 'Input',
          initialValue: '标题字段'
        },
        description: {
          name: 'description',
          type: 'string',
          title: '解释说明',
          component: 'Input',
          initialValue: '解释说明'
        },
        showCollapse: {
          name: 'showCollapse',
          type: 'boolean',
          title: '启用「展开/收起」功能',
          component: 'Switch',
          initialValue: true
        },
        defaultCollapsed: {
          name: 'defaultCollapsed',
          type: 'boolean',
          title: '内容区默认收起',
          component: 'Switch',
          initialValue: false
        }
      }
    }
  },
  Approval: {
    configName: 'Approval',
    formComponent: {
      basic: CustomEEApprove as FC<any>
    },
    schema: {
      basic: {
        immersiveApproval: {
          name: 'immersiveApproval',
          type: 'boolean',
          title: '是否开启连续审批',
          component: 'Switch'
        }
      },
      style: {
        layout: {
          width: true,
          height: true
        }
      }
    }
  },
  'Radio.Group': {
    configName: 'Radio.Group',
    schema: {
      style: {
        layout: {
          width: true,
          height: true
        }
      },
      basic: {
        defaultValue: {
          name: 'defaultValue',
          type: 'string',
          title: '值',
          required: false,
          component: 'Input'
        },
        disabled: {
          name: 'disabled',
          type: 'boolean',
          title: '是否禁用',
          required: false,
          component: 'Switch'
        },
        options: {
          name: 'options',
          type: 'array',
          title: '选项',
          component: SelectOptions,
          initialValue: [
            { label: '选项1', value: '0' },
            { label: '选项2', value: '1' }
          ]
        },
        size: {
          name: 'size',
          type: 'string',
          title: '尺寸',
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'default',
                label: 'default'
              },
              {
                value: 'small',
                label: 'small'
              }
            ]
          },
          initialValue: 'default'
        },
        buttonStyle: {
          name: 'buttonStyle',
          type: 'string',
          title: '风格样式',
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'outline',
                label: 'outline'
              },
              {
                value: 'solid',
                label: 'solid'
              }
            ]
          },
          initialValue: 'outline'
        },
        optionType: {
          name: 'optionType',
          type: 'string',
          title: 'options 类型',
          component: 'Radio.Group',
          componentProps: {
            optionType: 'button',
            options: [
              {
                value: 'default',
                label: 'default'
              },
              {
                value: 'button',
                label: 'button'
              }
            ]
          },
          initialValue: 'default'
        }
      },
      event: {
        onChange: onChangeEventConfig
      }
    }
  }
};

function generateBiliUIFormConfig(): Record<string, IFormConfig> {
  const result = {
    ...ANTD_FORM_CONFIG
  };
  delete result.Cascader;
  delete result.Input;
  delete result.InputNumber;
  delete result.TreeSelect;
  delete result.Select;
  return Object.assign(result, {
    Select: {
      configName: 'Select',
      formComponent: {
        basic: CustomSelectForm as FC<any>
      },
      schema: {
        basic: {
          defaultValue: {
            name: 'defaultValue',
            type: 'string',
            title: '值',
            component: 'Input',
            initialValue: ''
          },
          placeholder: {
            name: 'placeholder',
            type: 'string',
            title: '提示词',
            component: 'Input',
            initialValue: '请选择'
          },
          title: {
            name: 'template',
            type: 'string',
            title: 'title(bilibili/Ui)',
            component: 'Input',
            initialValue: '请输入'
          },
          disabled: {
            name: 'disabled',
            type: 'boolean',
            title: '禁用',
            component: 'Switch'
          },
          isFillMode: {
            name: 'isFillMode',
            type: 'boolean',
            title: 'FillMode模式',
            required: false,
            component: 'Switch'
          }
        },
        event: {
          onChange: onChangeEventConfig
        }
      }
    },
    Cascader: {
      configName: 'Cascader',
      formComponent: {
        basic: CustomCascaderForm as FC<any>
      },
      schema: {
        basic: {
          title: {
            name: 'template',
            type: 'string',
            title: 'title(bilibili/Ui)',
            component: 'Input',
            initialValue: '请输入'
          },
          isFillMode: {
            name: 'isFillMode',
            type: 'boolean',
            title: '是否 fillMode模式',
            required: false,
            component: 'Switch'
          },
          disabled: {
            name: 'disabled',
            type: 'boolean',
            title: '禁用',
            component: 'Switch'
          }
        },
        style: {
          layout: {
            width: true,
            height: true
          }
        },
        event: {
          onChange: onChangeEventConfig
        }
      }
    },
    Input: {
      configName: 'BInput',
      schema: {
        style: {
          layout: {
            width: true,
            height: true
          }
        },
        basic: {
          allowClear: {
            name: 'allowClear',
            type: 'boolean',
            title: '是否展示清除按钮',
            required: false,
            component: 'Switch'
          },
          bordered: {
            name: 'bordered',
            type: 'boolean',
            title: '是否展示边框',
            required: false,
            component: 'Switch',
            componentProps: data => {
              return {
                disabled: data?.isFillMode,
                checked: data?.isFillMode ? false : data?.checked
              };
            }
          },
          maxLength: {
            name: 'maxLength',
            type: 'string',
            title: '内容最大长度',
            component: 'Input',
            initialValue: ''
          },
          showCount: {
            name: 'showCount',
            type: 'boolean',
            title: '是否展示字数',
            required: false,
            component: 'Switch'
          },
          defaultValue: {
            name: 'defaultValue',
            type: 'string',
            title: '默认值',
            component: 'Input',
            initialValue: ''
          },
          placeholder: {
            name: 'placeholder',
            type: 'string',
            title: '提示词',
            component: 'Input',
            initialValue: '请输入'
          },
          title: {
            name: 'template',
            type: 'string',
            title: 'title(bilibili/Ui)',
            component: 'Input',
            initialValue: '请输入'
          },
          isFillMode: {
            name: 'isFillMode(bilibili/Ui)',
            type: 'boolean',
            title: '是否 fillMode模式',
            required: false,
            component: 'Switch'
          },
          disabled: {
            name: 'disabled',
            type: 'boolean',
            title: '禁用',
            component: 'Switch'
          }
        },
        event: inputEventConfig
      }
      // events: true
    },
    TreeSelect: {
      configName: 'TreeSelect',
      formComponent: {
        basic: CustomTreeForm('treeSelect') as unknown as FC<any>
      },
      schema: {
        style: {
          layout: {
            width: true,
            height: true
          }
        },
        basic: {
          placeholder: {
            name: 'placeholder',
            type: 'string',
            title: '提示词',
            component: 'Input',
            initialValue: '请选择'
          },
          multiple: {
            name: 'placeholder',
            type: 'boolean',
            title: '是否多选',
            component: 'Switch',
            initialValue: false
          },
          treeCheckable: {
            name: 'treeCheckable',
            type: 'boolean',
            title: '是否增加复选框',
            component: 'Switch',
            initialValue: false
          },
          treeDefaultExpandAll: {
            name: 'treeDefaultExpandAll',
            type: 'boolean',
            title: '自动展开全部',
            component: 'Switch',
            initialValue: false
          },
          title: {
            name: 'template',
            type: 'string',
            title: 'title(bilibili/Ui)',
            component: 'Input',
            initialValue: '请输入'
          },
          isFillMode: {
            name: 'isFillMode',
            type: 'boolean',
            title: '是否 fillMode模式',
            required: false,
            component: 'Switch'
          },
          disabled: {
            name: 'disabled',
            type: 'boolean',
            title: '禁用',
            component: 'Switch'
          }
        },
        event: {
          onChange: onChangeEventConfig
        }
      }
    },
    InputNumber: {
      configName: 'InputNumber',
      schema: {
        style: {
          layout: {
            width: true,
            height: true
          }
        },
        basic: {
          defaultValue: {
            name: 'defaultValue',
            type: 'number',
            title: '默认值',
            component: 'InputNumber',
            initialValue: ''
          },
          placeholder: {
            name: 'template',
            type: 'string',
            title: '提示词',
            component: 'Input',
            initialValue: '请输入'
          },
          controls: {
            name: 'controls',
            type: 'boolean',
            title: '是否显示增减按钮',
            component: 'Switch',
            initialValue: true
          },
          disabled: {
            name: 'disabled',
            type: 'boolean',
            title: '是否禁用',
            component: 'Switch',
            initialValue: false
          },
          max: {
            name: 'max',
            type: 'number',
            title: '最大值',
            component: 'InputNumber',
            initialValue: null
          },
          min: {
            name: 'min',
            type: 'number',
            title: '最小值',
            component: 'InputNumber',
            initialValue: null
          },
          precision: {
            name: 'precision',
            type: 'number',
            title: '数值精度',
            component: 'InputNumber',
            initialValue: null
          }
        },
        event: inputEventConfig
      }
      // events: true
    }
  }) as Record<string, IFormConfig>;
}

const TOTAL_FORM_CONFIG = {
  '@bilibili/ui': generateBiliUIFormConfig(),
  antd: ANTD_FORM_CONFIG,
  '@bilibili/ee-components': {
    ...NativeSchemaConfig,
    ...SchemaConfig,
    ...eeFormCompConfig
  },
  html: {
    ...NativeSchemaConfig
  }
};

export async function loadFormLibrary(): Promise<Record<string, Record<string, IFormConfig>>> {
  // TODO: need implementation, 改为远程加载
  return TOTAL_FORM_CONFIG as Record<string, Record<string, IFormConfig>>;
}
