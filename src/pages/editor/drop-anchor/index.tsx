import React, { CSSProperties } from 'react';

export interface IDropAnchorProps {
  style: CSSProperties | undefined;
}

export default function DropAnchor({ style }: IDropAnchorProps) {
  const syntheticStyle: CSSProperties = {
    position: 'fixed',
    zIndex: 99,
    ...style,
    backgroundColor: '#f00'
  };
  return <div style={syntheticStyle} />;
}
