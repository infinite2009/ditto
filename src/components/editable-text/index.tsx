import { CSSProperties, useMemo } from 'react';

export interface IEditableTextProps {
  style: CSSProperties;
  children: string;
}

export default function EditableText({ style, children }: IEditableTextProps) {
  return <div style={style}>{children}</div>;
}
