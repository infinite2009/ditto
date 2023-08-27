import EditableText from '@/components/editable-text';
import { useMemo } from 'react';

export interface ILinkProps {
  title: string;
  to: string;
  newTab?: boolean;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  color?: string;
}

export default function Link({
  title,
  to,
  newTab = true,
  fontWeight = 400,
  fontSize = 14,
  color = '#396fff',
  lineHeight = 14
}: ILinkProps) {
  const target = useMemo(() => {
    return newTab ? '_blank' : '_self';
  }, [newTab]);

  return (
    <a href={to} target={target}>
      <EditableText fontSize={fontSize} fontWeight={fontWeight} color={color} lineHeight={lineHeight}>
        {title}
      </EditableText>
    </a>
  );
}
