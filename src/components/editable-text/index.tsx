import { useMemo } from 'react';

export interface IEditableTextProps {
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  color?: string;
  children: string;
}

export default function EditableText({
  fontSize = 14,
  fontWeight = 400,
  lineHeight = 14,
  color = '#000',
  children
}: IEditableTextProps) {
  const style = useMemo(() => {
    return {
      fontSize,
      fontWeight,
      lineHeight: `${lineHeight}px`,
      color
    };
  }, [fontSize, fontWeight, lineHeight, color]);
  return <div style={style}>{children}</div>;
}
