import { useLatest } from 'ahooks';
import { getTargetElement } from 'ahooks/es/utils/domTarget';
import useDeepCompareEffectWithTarget from 'ahooks/es/utils/useDeepCompareWithTarget';
import type { MutableRefObject } from 'react';

type TargetValue<T> = T | undefined | null;

type TargetType = HTMLElement | Element | Window | Document;

export type BasicTarget<T extends TargetType = Element> = (() => TargetValue<T>) | TargetValue<T> | MutableRefObject<TargetValue<T>>;

const useResizeObserver = (callback: ResizeObserverCallback, target: BasicTarget, options?: ResizeObserverOptions): void => {
  const callbackRef = useLatest(callback);

  useDeepCompareEffectWithTarget(() => {
    const element = getTargetElement(target);
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(callbackRef.current);
    observer.observe(element, options);
    return () => {
      observer?.disconnect();
    };
  },
  [options],
  target
  );
};
export default useResizeObserver;