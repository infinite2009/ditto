import React, { CSSProperties, useMemo } from 'react';

export interface IDropAnchorProps {
  style: CSSProperties | undefined;
}

export default function DropAnchor({ style }: IDropAnchorProps) {
  const syntheticStyle: CSSProperties = useMemo(() => {
    if (!style) {
      return {};
    }
    const result = {
      position: 'fixed',
      zIndex: 99,
      borderRadius: 4,
      backgroundColor: '#194BFF',
      ...style
    };
    if (result.width > 20) {
      (result.width as number) -= 16;
      (result.left as number) += 8;
    }
    if (result.height > 20) {
      (result.height as number) -= 16;
      (result.top as number) += 8;
    }
    return result;
  }, [style]);

  return <div style={syntheticStyle} />;
}
