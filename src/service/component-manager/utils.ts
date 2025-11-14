import { IPropsConfigItem } from '@/types/component-config';
import { CSSProperties } from 'react';

export function generateDefaultStyleConfig(style: CSSProperties = {}): IPropsConfigItem {
  return {
    id: 'style',
    schemaType: 'props',
    name: 'style',
    title: '样式',
    category: 'style',
    value: {
      ...style
    },
    valueType: 'object',
    valueSource: 'editorInput'
  };
}
