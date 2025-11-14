import { ComponentDefaultIcon, FormIcon } from '@/components/icon';
import IComponentConfig from '@/types/component-config';
import {
  Approval,
  CategoryTreeSelect,
  CommonUpload,
  FooterBar,
  RichEditor,
  SearchFormLayout
} from '@bilibili/ee-components';
import { generateDefaultStyleConfig } from '.';
import { versionListDefaultData } from './defalutData';

import IFormConfig from '@/types/form-config';
import CustomSearchForm from '@/pages/components/custom-forms/custom-search-form';
import ComponentFeature from '@/types/component-feature';

export const eeCompConfig: Record<string, IComponentConfig> = {
  // 审批包裹组件
  ['Approval']: {
    configName: 'Approval',
    callingName: 'Approval',
    dependency: '@bilibili/ee-components',
    importName: 'Approval',
    component: Approval,
    categories: ['常用'],
    feature: ComponentFeature.WITH_SLOTS,
    title: '审批组件',
    icon: ComponentDefaultIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ paddingBottom: '65px', position: 'relative', height: '100%' }),
      immersiveApproval: {
        id: 'immersiveApproval',
        schemaType: 'props',
        name: 'immersiveApproval',
        title: '是否开启连续审批',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      footerProps: {
        id: 'footerProps',
        schemaType: 'props',
        name: 'footerProps',
        title: 'footer配置',
        category: 'basic',
        value: {
          permissions: [],
          getContainer: node => {
            return node?.parentNode;
          },
          style: {
            position: 'fixed',
            left: 0,
            right: 0,
            width: '100%'
          }
        },

        valueType: 'object',
        valueSource: 'editorInput',
        templateKeyPathsReg: [
          {
            type: 'function',
            path: 'getContainer',
            repeatType: 'eeApprovalFooter'
          }
        ]
      },
      panelType: {
        id: 'panelType',
        schemaType: 'props',
        name: 'panelType',
        title: '面板类型',
        category: 'basic',
        value: '',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      panelProps: {
        id: 'panelProps',
        schemaType: 'props',
        name: 'panelProps',
        title: 'panel配置',
        category: 'basic',
        value: {
          versionList: versionListDefaultData,
          versionHistList: versionListDefaultData,
          ccList: [],
          flowChartList: [{}],
          histList: [],
          style: { paddingTop: '0px', paddingBottom: 0, height: '100%', marginTop: '56px' }
        },
        valueType: 'object',
        valueSource: 'editorInput'
      }
    },
    children: {
      value: [],
      type: 'slot',
      name: 'children',
      category: 'children'
    }
  },
  ['ApprovalFooter']: {
    configName: 'ApprovalFooter',
    callingName: 'Approval.Footer',
    dependency: '@bilibili/ee-components',
    importName: 'Approval',
    component: Approval.Footer,
    categories: ['常用'],
    title: '审批按钮组',
    icon: ComponentDefaultIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ width: '100%' }),
      permissions: {
        id: 'permissions',
        schemaType: 'props',
        name: 'permissions',
        title: '权限',
        category: 'basic',
        value: [],
        valueType: 'object',
        valueSource: 'editorInput'
      },
      getContainer: {
        id: 'getContainer',
        schemaType: 'props',
        name: 'getContainer',
        title: '包裹元素',
        category: 'basic',
        value: () => {
          return document.getElementById('pageRoot');
        },
        valueType: 'function',
        valueSource: 'editorInput'
      }
    }
  },
  ['Approval.Content']: {
    configName: 'Approval.Content',
    callingName: 'Approval.Content',
    dependency: '@bilibili/ee-components',
    importName: 'Approval',
    feature: ComponentFeature.slot,
    component: Approval.Content,
    categories: ['常用'],
    title: '审批-内容区域',
    icon: ComponentDefaultIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ width: 'auto' })
    },
    children: {
      value: [],
      type: 'slot',
      name: 'children',
      category: 'children'
    }
  },
  ['Approval.VersionPanel']: {
    configName: 'Approval.VersionPanel',
    callingName: 'Approval.VersionPanel',
    dependency: '@bilibili/ee-components',
    importName: 'Approval',
    feature: ComponentFeature.slot,
    component: Approval.VersionPanel,
    categories: ['常用'],
    title: '侧边栏-版本详情',
    icon: ComponentDefaultIcon,
    propsConfig: {
      // style: generateDefaultStyleConfig({ width: '100%' }),
      // 版本列表
      versionList: {
        id: 'versionList',
        schemaType: 'props',
        name: 'versionList',
        title: '版本列表',
        category: 'basic',
        value: versionListDefaultData,
        valueType: 'array',
        valueSource: 'editorInput'
      },
      versionHistList: {
        id: 'versionHistList',
        schemaType: 'props',
        name: 'versionHistList',
        title: '版本历史列表',
        category: 'basic',
        value: versionListDefaultData,
        valueType: 'array',
        valueSource: 'editorInput'
      }
    }
  },
  ['Approval.ApprovalPanel']: {
    configName: 'Approval.ApprovalPanel',
    callingName: 'Approval.ApprovalPanel',
    dependency: '@bilibili/ee-components',
    importName: 'Approval',
    component: Approval.ApprovalPanel,
    feature: ComponentFeature.slot,
    categories: ['常用'],
    title: '侧边栏-审批详情',
    icon: ComponentDefaultIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ width: '100%' }),
      // 版本列表
      ccList: {
        id: 'ccList',
        schemaType: 'props',
        name: 'ccList',
        title: '抄送列表',
        category: 'basic',
        value: [],
        valueType: 'array',
        valueSource: 'editorInput'
      },
      flowChartList: {
        id: 'flowChartList',
        schemaType: 'props',
        name: 'flowChartList',
        title: '审批流',
        category: 'basic',
        value: [{}],
        valueType: 'array',
        valueSource: 'editorInput'
      },
      histList: {
        id: 'histList',
        schemaType: 'props',
        name: 'histList',
        title: '审批流',
        category: 'basic',
        value: [],
        valueType: 'array',
        valueSource: 'editorInput'
      }
    }
  },
  RichEditor: {
    configName: 'RichEditor',
    dependency: '@bilibili/ee-components',
    component: RichEditor,
    categories: ['常用', '信息录入'],
    title: '富文本组件',
    icon: ComponentDefaultIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ width: '100%' }),
      placeholder: {
        id: 'placeholder',
        schemaType: 'props',
        name: 'placeholder',
        title: '提示词',
        category: 'basic',
        value: '请输入',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      maxHeight: {
        id: 'maxHeight',
        schemaType: 'props',
        name: 'maxHeight',
        title: '最大高度',
        category: 'basic',
        value: null,
        valueType: 'number',
        valueSource: 'editorInput'
      }
    }
  },
  SearchFormLayout: {
    configName: 'SearchFormLayout',
    component: SearchFormLayout,
    categories: ['常用', '信息录入'],
    title: '表单',
    dependency: '@bilibili/ee-components',
    icon: FormIcon,
    feature: ComponentFeature.blackBox,
    propsConfig: {
      style: generateDefaultStyleConfig(),
      layout: {
        id: 'layout',
        schemaType: 'props',
        name: 'layout',
        title: '布局',
        category: 'basic',
        value: 'horizontal',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      onFinish: {
        id: 'onFinish',
        schemaType: 'props',
        name: 'onFinish',
        title: '左键点击',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
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
  CommonUpload: {
    configName: 'CommonUpload',
    dependency: '@bilibili/ee-components',
    component: CommonUpload,
    categories: ['常用', '信息录入'],
    title: '上传组件',
    icon: ComponentDefaultIcon,
    propsConfig: {
      style: generateDefaultStyleConfig({ padding: 8, width: '100%' }),
      draggable: {
        id: 'draggable',
        schemaType: 'props',
        name: 'draggable',
        title: '推拽上传',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      maxSize: {
        id: 'maxSize',
        schemaType: 'props',
        name: 'maxSize',
        title: '文件大小',
        category: 'basic',
        value: 10,
        valueType: 'number',
        valueSource: 'editorInput'
      },
      tip: {
        id: 'tip',
        schemaType: 'props',
        name: 'tip',
        title: '文件大小',
        category: 'basic',
        value: undefined,
        valueType: 'string',
        valueSource: 'editorInput'
      },
      editable: {
        id: 'editable',
        schemaType: 'props',
        name: 'editable',
        title: '是否可上传',
        category: 'basic',
        value: true,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      accept: {
        id: 'accept',
        schemaType: 'props',
        name: 'accept',
        title: '文件类型',
        category: 'basic',
        value: '*',
        valueType: 'string',
        valueSource: 'editorInput'
      },
      mirrorMode: {
        id: 'mirrorMode',
        schemaType: 'props',
        name: 'mirrorMode',
        title: '文件列表位置',
        category: 'basic',
        value: false,
        valueType: 'boolean',
        valueSource: 'editorInput'
      },
      fileList: {
        id: 'fileList',
        schemaType: 'props',
        name: 'fileList',
        title: '文件列表',
        category: 'basic',
        valueType: 'array',
        value: [
          { name: 'demo1.pdf', batchKey: '123' },
          { name: 'demo2.xls', batchKey: '1234' }
        ],
        valueSource: 'editorInput'
      },
      onChange: {
        id: 'onChange',
        schemaType: 'props',
        name: 'onChange',
        title: '左键点击',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      }
    }
  },
  CategoryTreeSelect: {
    configName: 'CategoryTreeSelect',
    dependency: '@bilibili/ee-components',
    component: CategoryTreeSelect,
    categories: ['常用', '信息录入'],
    title: '品类选择器',
    icon: ComponentDefaultIcon,
    propsConfig: {
      onChange: {
        id: 'onChange',
        schemaType: 'props',
        name: 'onChange',
        title: '变更时',
        category: 'event',
        value: undefined,
        valueType: 'function',
        valueSource: 'handler'
      }
    }
  },
  FooterBar: {
    configName: 'FooterBar',
    dependency: '@bilibili/ee-components',
    component: FooterBar,
    categories: ['常用'],
    feature: ComponentFeature.WITH_SLOTS,
    title: '底部按钮组（FooterBar）',
    icon: ComponentDefaultIcon,
    propsConfig: {
      extra: {
        id: 'extra',
        schemaType: 'props',
        name: 'extra',
        title: '额外插槽',
        valueType: 'object',
        category: 'hidden',
        templateKeyPathsReg: [
          {
            type: 'object',
            path: ''
          }
        ],
        value: {},
        valueSource: 'editorInput'
      }
    }
  }
};

export const eeFormCompConfig: Record<string, IFormConfig> = {
  ['Approval.Footer']: {
    configName: 'Approval.Footer',
    schema: {
      basic: {
        permissions: {
          name: 'permissions',
          type: 'array',
          title: '按钮显隐',
          component: 'Select',
          componentProps: {
            mode: 'multiple',
            maxTagCount: 'responsive',
            options: [
              { label: '加批', value: 'add' },
              { label: '抄送', value: 'cc' },
              { label: '废弃', value: 'terminate' },
              { label: '转办', value: 'transfer' },
              { label: '驳回', value: 'reject' },
              { label: '撤回', value: 'back' },
              { label: '通过', value: 'execute' },
              { label: '发起群聊', value: 'startChat' },
              { label: '暂挂', value: 'pend' },
              { label: '取消暂挂', value: 'cancelPend' }
            ]
          }
        },
      }
    }
  },
  RichEditor: {
    configName: 'RichEditor',
    schema: {
      basic: {
        placeholder: {
          name: 'placeholder',
          type: 'string',
          title: '提示词',
          component: 'Input',
          initialValue: '请输入'
        },
        maxHeight: {
          name: 'placeholder',
          type: 'number',
          title: '最大高度',
          component: 'InputNumber',
          initialValue: null
        }
      },
      style: {
        layout: {
          width: true,
          height: true
        }
      },
    }
  },
  SearchFormLayout: {
    configName: 'SearchFormLayout',
    formComponent: {
      basic: CustomSearchForm
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
          title: '提交时',
          component: 'Select'
        }
      }
    }
    // events: true
  },
};
