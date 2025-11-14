import Container from '@/components/container';
import { define, generateDefaultStyleConfig } from '../utils';
import { HorizontalFlexIcon } from '@/components/icon';
import ComponentFeature from '@/types/component-feature';

export default define({
  configName: 'HorizontalFlex',
  callingName: 'div',
  dependency: 'html',
  feature: ComponentFeature.container,
  categories: ['常用'],
  title: '水平弹性布局',
  icon: HorizontalFlexIcon,
  component: Container,
  propsConfig: {
    style: generateDefaultStyleConfig(
      {
        display: 'flex',
        flexDirection: 'row',
        padding: 10,
        gap: 10,
        alignSelf: 'stretch'
      },
      ['layout', 'backgroundColor', 'border']
    )
  },
  formSchema: {
    valuesToIgnore: ['flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'rowGap', 'columnGap']
  }
});