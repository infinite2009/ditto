export type ScrollDirection = 'top' | 'left' | 'right' | 'bottom';
export const SCROLL_CONFIG = {
  // 触发滚动的边缘阈值（像素）
  edgeThreshold: 20,
  // 基础滚动速度（像素/帧）
  baseSpeed: 1,
  // 加速度系数
  acceleration: 5
};

const getSpeed = (distance: number) => {
  return SCROLL_CONFIG.baseSpeed * Math.pow(SCROLL_CONFIG.acceleration, (Math.abs(distance)) / 10);
};

export const boundaryDetection = (dragDomRect: DOMRect, container: HTMLElement, offset = SCROLL_CONFIG.edgeThreshold) => {
  let isBoundary = false;
  let direction: ScrollDirection;
  let moveDistance = 0;

  const { top, left, right, bottom } = dragDomRect;
  const { top: containerTop, left: containerLeft, right: containerRight, bottom: containerBottom } = container.getBoundingClientRect();
  if (top < containerTop + offset) {
    isBoundary = true;
    direction = 'top';
    moveDistance = getSpeed(top - (containerTop + offset));
  }
  if (left < containerLeft + offset) {
    isBoundary = true;
    direction = 'left';
    moveDistance = getSpeed(left - (containerLeft + offset));
  }

  if (right > containerRight - offset) {
    isBoundary = true;
    direction = 'right';
    moveDistance = getSpeed(right - (containerRight - offset));
  }

  if (bottom >= containerBottom - offset) {
    isBoundary = true;
    direction = 'bottom';
    moveDistance = getSpeed(bottom - (containerBottom - offset));
  }
  // if (top < containerTop + offset && left < containerLeft + offset) {
  //   isBoundary = true;
  //   direction = 'topLeft';
  // }
  // if (top < containerTop + offset && right > containerRight - offset) {
  //   isBoundary = true;
  //   direction = 'topRight';
  // }
  // if (bottom > containerBottom - offset && left < containerLeft + offset) {
  //   isBoundary = true;
  //   direction = 'bottomLeft';
  // }
  // if (bottom > containerBottom - offset && right > containerRight - offset) {
  //   isBoundary = true;
  //   direction = 'bottomRight';
  // }
  return {
    isBoundary,
    direction,
    moveDistance
  };
};
