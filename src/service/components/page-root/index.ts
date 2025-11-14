import { define, generateDefaultStyleConfig } from '../utils';
import { ComponentDefaultIcon } from '@/components/icon';
import pageRoot from '@/components/page-root';
import ComponentFeature from '@/types/component-feature';

export default define({
  configName: 'PageRoot',
  callingName: 'div',
  categories: ['常用'],
  isHidden: true,
  dependency: 'html',
  component: pageRoot,
  feature: ComponentFeature.root,
  title: '页面',
  icon: ComponentDefaultIcon,
  propsConfig: {
    onMount: {
      id: 'onMount',
      schemaType: 'props',
      name: 'onMount',
      title: '加载',
      category: 'event',
      value: undefined,
      valueType: 'function',
      valueSource: 'handler'
    },
    onUnmount: {
      id: 'onUnmount',
      schemaType: 'props',
      name: 'onUnmount',
      title: '卸载',
      category: 'event',
      value: undefined,
      valueType: 'function',
      valueSource: 'handler'
    },
    style: generateDefaultStyleConfig(
      { display: 'flex', flexDirection: 'column' },
      {
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
        border: true,
        backgroundColor: true
      }
    )
  }
});