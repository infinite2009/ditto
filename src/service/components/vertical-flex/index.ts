import Container from '@/components/container';
import { define, generateDefaultStyleConfig } from '../utils';
import { VerticalFlexIcon } from '@/components/icon';
import ComponentFeature from '@/types/component-feature';

export default define({
  configName: 'VerticalFlex',
  callingName: 'div',
  dependency: 'html',
  feature: ComponentFeature.container,
  categories: ['常用'],
  title: '垂直弹性布局',
  icon: VerticalFlexIcon,
  component: Container,
  propsConfig: {
    style: generateDefaultStyleConfig(
      {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 10
      },
      ['layout', 'backgroundColor', 'border']
    )
  },
  formSchema: {
    valuesToIgnore: ['flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'rowGap', 'columnGap']
  }
});