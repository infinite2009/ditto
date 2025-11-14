import React, { forwardRef, memo } from 'react';

export interface IIframeComponentProps {
  onLoad: () => void;
}

export default memo(function IframeComponent({ onLoad }: IIframeComponentProps, ref: React.Ref<HTMLIFrameElement>) {
  return (<iframe
    src="/voltron-dnd/"
    // ref={ref}
    onLoad={onLoad}
    height="100%"
    width="100%"
  />);
});
