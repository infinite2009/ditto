import React, {CSSProperties} from 'react';

export interface IDropAnchorProps {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function DropAnchor({top, left, width, height}: IDropAnchorProps) {
  const style: CSSProperties = {
    position: 'fixed',
    zIndex: 99,
    top,
    left,
    width,
    height,
    backgroundColor: '#f00',
  };
  return <div style={style} />;
}
