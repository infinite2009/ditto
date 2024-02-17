import { useLayoutEffect, useRef } from 'react';

export interface IEllipsisTextProps {
  className: string;
  text: string;
}

export default function EllipsisText({ className, text }: IEllipsisTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (text) {
    }
  }, [text]);

  return <span className={className} ref={ref}></span>;
}
