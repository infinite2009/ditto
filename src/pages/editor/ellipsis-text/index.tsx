import { Tooltip } from 'antd';
import { useLayoutEffect, useRef, useState } from 'react';

export interface IEllipsisTextProps {
  className: string;
  text: string;
}

export default function EllipsisText({ className, text }: IEllipsisTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState<boolean>(false);

  useLayoutEffect(() => {
    if (text && ref.current) {
      setOverflow(ref.current.scrollWidth > ref.current.clientWidth);
    }
  }, [text]);

  function renderText() {
    return (
      <span className={className} ref={ref}>
        {text}
      </span>
    );
  }

  return overflow ? <Tooltip>{renderText()}</Tooltip> : renderText();
}
