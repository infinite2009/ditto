import IFormConfig from '@/types/form-config';
import { getCamelotComponentPropsFrom } from '../load-config/camelot';
import CustomTabForm from '@/pages/components/custom-forms/custom-tab-form';
import { FC } from 'react';
import CustomTableForm from '@/pages/components/custom-forms/custom-table-form';
import CustomFormForm from '@/pages/components/custom-forms/custom-form-form';

const flexTransformerStr =
  'return (values => {' +
  '  if (!values) {' +
  '    return {};' +
  '  }' +
  '  const result = {};' +
  '  const { flexDirection, flexWrap, justifyContent, alignItems, rowGap, columnGap } = values;' +
  "  if (flexDirection && flexDirection === 'column') {" +
  '    result.vertical = true;' +
  '  } else {' +
  '    result.vertical = false;' +
  '  }' +
  "  result.wrap = flexWrap || 'nowrap';" +
  '  if (justifyContent) {' +
  '    result.justify = justifyContent;' +
  '  } else {' +
  "    result.justify = 'normal';" +
  '  }' +
  '  if (alignItems) {' +
  '    result.align = alignItems;' +
  '  } else {' +
  "    result.align = 'normal';" +
  '  }' +
  '  const arr = [];' +
  '  if (rowGap) {' +
  '    arr.push(`${rowGap}px`);' +
  '  }' +
  '  if (columnGap) {' +
  '    arr.push(`${columnGap}px`);' +
  '  }' +
  '  if (arr.length) {' +
  "    result.gap = arr.join(' ');" +
  '  }' +
  '  return result;' +
  '})(values)';

const typographyTransformerStr =
  'return (values => {' +
  '  if (!values) {' +
  '    return {};' +
  '  }' +
  '  const result = {};' +
  '  const { textDecoration, fontWeight, fontStyle } = values;' +
  '  if (textDecoration) {' +
  "    const arr = textDecoration.split(' ');" +
  "    if (arr.includes('line-through')) {" +
  '      result.delete = true;' +
  '    }' +
  "    if (arr.includes('underline')) {" +
  '      result.underline = true;' +
  '    }' +
  '  }' +
  '  if (fontWeight >= 600) {' +
  '    result.strong = true;' +
  '  }' +
  "  if (fontStyle === 'italic') {" +
  '    result.italic = true;' +
  '  }' +
  '  return result;' +
  '})(values);';

/**
 * 记载整个表单库，它和组件库是一对一的。
 */
export async function loadFormLibrary(): Promise<Record<string, IFormConfig>> {
  // TODO: need implementation, 改为远程加载
  let camelotComponentProps = {};
  try {
    camelotComponentProps = await getCamelotComponentPropsFrom();
  } catch (err) {
    console.log(err);
  }
  return {
    PageRoot: {
      configName: 'PageRoot',
      schema: {
        style: {
          layout: {
            wrap: {
              nowrap: true
            },
            direction: {
              column: true
            },
            alignItems: true,
            justifyContent: true,
            padding: true,
            gap: true
          },
          backgroundColor: true
        }
      },
      transformerStr: flexTransformerStr
    },
    Button: {
      configName: 'Button',
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
          },
          shadow: true,
          text: {
            // 字号和行高
            size: true,
            color: true,
            decoration: true
          }
        },
        basic: {
          type: {
            name: 'type',
            type: 'string',
            title: '按钮类型',
            component: 'Select',
            componentProps: {
              options: [
                {
                  value: 'primary',
                  label: '主要'
                },
                {
                  value: 'dashed',
                  label: '虚线边框'
                },
                {
                  value: 'link',
                  label: '链接'
                },
                {
                  value: 'text',
                  label: '文本'
                },
                {
                  value: 'default',
                  label: '文本'
                }
              ]
            }
          },
          danger: {
            name: 'danger',
            type: 'boolean',
            title: '设置为危险按钮',
            required: false,
            component: 'Switch'
          },
          disabled: {
            name: 'disabled',
            type: 'boolean',
            title: '设置失效',
            required: false,
            component: 'Switch'
          },
          href: {
            name: 'href',
            type: 'string',
            title: '跳转地址',
            required: false,
            component: 'Input'
          },
          target: {
            name: 'target',
            type: 'boolean',
            title: '跳转到新标签',
            required: false,
            component: 'Switch'
          },
          loading: {
            name: 'loading',
            type: 'boolean',
            title: '加载状态',
            required: false,
            component: 'Switch'
          },
          shape: {
            name: 'shape',
            type: 'string',
            title: '按钮形状',
            required: false,
            component: 'Select',
            componentProps: {
              options: [
                { value: 'default', label: '默认' },
                {
                  value: 'circle',
                  label: '水平圆角'
                },
                { value: 'round', label: '圆形' }
              ]
            }
          },
          size: {
            name: 'size',
            type: 'string',
            title: '尺寸',
            component: 'Select',
            componentProps: {
              options: [
                {
                  value: 'large',
                  label: '大'
                },
                {
                  value: 'middle',
                  label: '中'
                },
                {
                  value: 'small',
                  label: '小'
                }
              ]
            },
            initialValue: 'middle'
          },
          children: {
            name: 'children',
            type: 'string',
            title: '标题',
            component: 'Input',
            initialValue: '按钮'
          }
        }
      }
    },
    HorizontalFlex: {
      configName: 'HorizontalFlex',
      transformerStr: flexTransformerStr,
      valuesToIgnore: ['flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'rowGap', 'columnGap'],
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
          // shadow: true,
        }
      }
    },
    VerticalFlex: {
      configName: 'VerticalFlex',
      transformerStr: flexTransformerStr,
      valuesToIgnore: ['flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'rowGap', 'columnGap'],
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
          // shadow: true
        }
      }
    },
    Text: {
      configName: 'Text',
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
        basic: {
          value: {
            name: 'value',
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
            initialValue: '请输入'
          }
        }
      }
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
        }
      }
    },
    ...camelotComponentProps
  };
}
