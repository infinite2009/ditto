import React, { CSSProperties } from 'react';

interface IRowProps {
  children: React.ReactNode;
}

export default function RowContainer({ children }: IRowProps) {
  const style: CSSProperties = {
    display: 'flex',
    flexDirection: 'row'
  };

  return <div style={style}>{children}</div>;
}
