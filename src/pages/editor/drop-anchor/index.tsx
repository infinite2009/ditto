import React, { CSSProperties, useMemo } from 'react';

import styles from './index.module.less';

export interface IDropAnchorProps {
  style: CSSProperties | undefined;
}

export default function DropAnchor({ style }: IDropAnchorProps) {
  const syntheticStyle: CSSProperties = useMemo(() => {
    if (!style) {
      return {};
    }
    const result = {
      zIndex: 99,
      borderRadius: 4,
      backgroundColor: '#194BFF',
      ...style
    };
    if (result.width > 2) {
      const originWidth = result.width as number;
      result.width = Math.max((result.width as number) - 16, 12);
      result.left = (result.left as number) + Math.round((originWidth - result.width) / 2);
    }
    if (result.height > 2) {
      const originHeight = result.height as number;
      result.height = Math.max((result.height as number) - 16, 12);
      result.top = (result.top as number) + Math.round((originHeight - result.height) / 2);
    }
    return result;
  }, [style]);

  return <div className={styles.dropAnchor} style={syntheticStyle} />;
}
