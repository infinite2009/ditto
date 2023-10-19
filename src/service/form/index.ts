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
        style: [],
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
    }
  });
}
