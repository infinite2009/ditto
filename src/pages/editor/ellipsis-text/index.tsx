import { Tooltip } from 'antd';
import { useLayoutEffect, useRef, useState } from 'react';

export interface IEllipsisTextProps {
  className?: string;
  style?: React.CSSProperties;
  text: string;
}

export default function EllipsisText({ className, text, style }: IEllipsisTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState<boolean>(false);

  useLayoutEffect(() => {
    if (text && ref.current) {
      setOverflow(ref.current.scrollWidth > ref.current.clientWidth);
    }
  }, [text]);

  function renderText() {
    return (
      <span style={style} className={className} ref={ref}>
        {text}
      </span>
    );
  }

  return overflow ? <Tooltip title={text}>{renderText()}</Tooltip> : renderText();
}
