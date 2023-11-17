import IFormConfig from '@/types/form-config';

/**
 * 记载整个表单库，它和组件库是一对一的。
 */
export function loadFormLibrary(): Promise<Record<string, IFormConfig>> {
  // TODO: need implementation, 改为远程加载
  return Promise.resolve({
    Button: {
      configName: 'Button',
      schema: {
        style: {
          width: true,
          height: true,
          fontSize: true,
          fontWeight: true
        },
        basic: {
          type: {
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
            type: 'boolean',
            title: '设置为危险按钮',
            required: false,
            component: 'Switch'
          },
          disabled: {
            type: 'boolean',
            title: '设置失效',
            required: false,
            component: 'Switch'
          },
          href: {
            type: 'string',
            title: '跳转地址',
            required: false,
            component: 'Input'
          },
          target: {
            type: 'boolean',
            title: '跳转到新标签',
            required: false,
            component: 'Switch'
          },
          loading: {
            type: 'boolean',
            title: '加载状态',
            required: false,
            component: 'Switch'
          },
          shape: {
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
          }
        }
      }
    },
    HorizontalFlex: {
      configName: 'HorizontalFlex',
      schema: {
        style: {
          vertical: {
            type: 'boolean',
            title: '方向',
            required: false,
            component: 'Switch',
            initialValue: false
            // 这个 form 配置项将合并到哪个 props 上，此时该 props 是一个对象，如果没有这个配置，则不进行合并
          },
          wrap: {
            type: 'boolean',
            title: '换行',
            required: false,
            component: 'Switch',
            initialValue: false
          },
          justify: {
            type: 'string',
            title: '主轴对齐',
            required: false,
            component: 'Select',
            componentProps: {
              options: [
                {
                  value: 'normal',
                  label: '自动'
                },
                {
                  value: 'start',
                  label: '头对齐'
                },
                {
                  value: 'center',
                  label: '居中对齐'
                },
                {
                  value: 'end',
                  label: '尾对齐'
                }
              ]
            },
            initialValue: 'start'
          },
          align: {
            type: 'string',
            title: '副轴对齐',
            required: false,
            component: 'Select',
            componentProps: {
              options: [
                {
                  value: 'normal',
                  label: '自动'
                },
                {
                  value: 'start',
                  label: '头对齐'
                },
                {
                  value: 'center',
                  label: '居中对齐'
                },
                {
                  value: 'end',
                  label: '尾对齐'
                }
              ]
            },
            initialValue: 'start'
          },
          gap: {
            type: 'string',
            title: '间距',
            required: false,
            component: 'Input',
            initialValue: '8px'
          }
        }
      }
    },
    VerticalFlex: {
      configName: 'VerticalFlex',
      schema: {
        style: {
          vertical: {
            type: 'boolean',
            title: '方向',
            required: false,
            component: 'Switch',
            initialValue: true
            // 这个 form 配置项将合并到哪个 props 上，此时该 props 是一个对象，如果没有这个配置，则不进行合并
          },
          wrap: {
            type: 'boolean',
            title: '换行',
            required: false,
            component: 'Switch',
            initialValue: false
          },
          justify: {
            type: 'string',
            title: '主轴对齐',
            required: false,
            component: 'Select',
            componentProps: {
              options: [
                {
                  value: 'normal',
                  label: '自动'
                },
                {
                  value: 'start',
                  label: '头对齐'
                },
                {
                  value: 'center',
                  label: '居中对齐'
                },
                {
                  value: 'end',
                  label: '尾对齐'
                }
              ]
            },
            initialValue: 'start'
          },
          align: {
            type: 'string',
            title: '副轴对齐',
            required: false,
            component: 'Select',
            componentProps: {
              options: [
                {
                  value: 'normal',
                  label: '自动'
                },
                {
                  value: 'start',
                  label: '头对齐'
                },
                {
                  value: 'center',
                  label: '居中对齐'
                },
                {
                  value: 'end',
                  label: '尾对齐'
                }
              ]
            },
            initialValue: 'start'
          },
          gap: {
            type: 'string',
            title: '间距',
            required: false,
            component: 'Input',
            initialValue: '8px'
          }
        }
      }
    }
  });
}
