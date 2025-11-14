import { useRef, useCallback } from 'react';

interface UseScrollIntoViewOptions {
  /**
   * 是否启用平滑滚动
   * @default true
   */
  smooth?: boolean;
  /**
   * 滚动行为
   * @default 'nearest'
   */
  block?: ScrollLogicalPosition;
}

/**
 * 手动触发元素滚动到可见区域
 * @param options 配置选项
 * @returns [ref, scrollIntoView] ref 用于绑定到目标元素，scrollIntoView 用于触发滚动
 */
export function useScrollIntoView({ smooth = true, block = 'end' }: UseScrollIntoViewOptions = {}) {
  const elementRef = useRef<HTMLElement | null>(null);

  const scrollIntoView = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    element.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block
    });
  }, [smooth, block]);

  return [elementRef, scrollIntoView] as const;
}
