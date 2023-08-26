import React, {CSSProperties} from 'react';
import IAnchorCoordinates from '@/types/anchor-coordinate';

export interface IDropAnchorProps {
  coordinate: IAnchorCoordinates;
}

export default function DropAnchor({coordinate}: IDropAnchorProps) {
  const style: CSSProperties = {
    position: 'fixed',
    zIndex: 99,
    ...coordinate,
    backgroundColor: '#f00',
  };
  return <div style={style} />;
}
