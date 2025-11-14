import { ProTabs } from '@bilibili/ui';
import { define, generateDefaultStyleConfig } from '../utils';
import { TabsIcon } from '@/components/icon';
import CustomTabForm from './CustomTabForm';
import ComponentFeature from '@/types/component-feature';

export default define({
  configName: 'ProTabs',
  name: 'ProTabs',
  callingName: 'ProTabs',
  dependency: 'antd',
  component: ProTabs,
  feature: ComponentFeature.WITH_SLOTS,
  categories: ['常用', '数据展示'],
  title: '标签页（新）',
  icon: TabsIcon,
  propsConfig: {
    style: generateDefaultStyleConfig({}, 'all'),
    items: {
      schemaType: 'props',
      category: 'basic',
      value: [
        {
          key: '1',
          label: '标签页1',
          children: {}
        }
      ],
      valueSource: 'editorInput',
      valueType: 'array',
      templateKeyPathsReg: [
        {
          type: 'object',
          path: '\\[\\d+\\]\\.children'
        }
      ]
    },
    level: {
      schemaType: 'props',
      category: 'basic',
      value: 1,
      valueType: 'number',
      valueSource: 'editorInput',
      schema: {
        title: '标签页级别',
        component: 'Select',
        componentProps: {
          options: [
            {
              label: '一级标签',
              value: 1
            },
            {
              label: '二级标签',
              value: 2
            },
            {
              label: '三级标签',
              value: 3
            }
          ]
        }
      }
    }
  },
  formSchema: {
    formComponent: {
      basic: CustomTabForm
    }
  }
});
