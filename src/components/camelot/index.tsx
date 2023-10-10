import { useEffect, useMemo } from 'react';

export interface IEditableTextProps {
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  color?: string;
  children: string;
}

export function BOaUserSelect({
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
  useEffect(() => {
    const url = 'https://s1.hdslb.com/bfs/live/oa-user-select/last/oa-user-select.mjs';
    import(/* @vite-ingore */ url).then((module) => {
      module.OaUserSelectRegister();
      console.log(module);
    });
  }, []);
  return <div style={style}><b-oa-user-select></b-oa-user-select></div>;
}
