import React, { CSSProperties } from 'react';

interface IColumnContainerProps {
  children: React.ReactNode;
}

export default function ColumnContainer({ children }: IColumnContainerProps) {
  const style: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={style}>{children}</div>
  );
}