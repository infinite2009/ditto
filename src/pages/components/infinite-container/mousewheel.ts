type Options = {
  /**
   * 容差
   */
  tolerance: number;
  /**
   * 起始x
   */
  bX: number;
  /**
   * 起始y
   */
  bY: number;
  /**
   * 手势滑动路径，x/y（跟onGesture事件同步触发）
   * @param x
   * @param y
   * @returns
   */
  onPath: (x: number, y: number) => void;
  /**
   * 时间锁
   */
  timeLock: boolean;
  /**
   * 手势捕获时长
   */
  captureTime: number;
  /**
   * 手势点集合x
   */
  xPoints: number[];
  /**
   * 手势点集合y
   */
  yPoints: number[];
  /**
   * 手势点集合差x
   */
  xcPoints: number[];
  /**
   * 手势点集合差y
   */
  ycPoints: number[];
  /**
   * 手势解析，上、下、左、右、放大、缩小 | 由一段时间行为形成
   */
  onGesture: (gesture: string, event: WheelEvent) => void;
};

type Gesture = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'mini';

class MacMouseWheel {
  private options: Options;
  private defaults: Options = {
    tolerance: 5,
    bX: 0,
    bY: 0,
    onPath: (x, y) => {
      console.log(x, y);
    },
    timeLock: false,
    captureTime: 1200,
    xPoints: [],
    yPoints: [],
    xcPoints: [],
    ycPoints: [],
    onGesture: (gesture: Gesture, event: WheelEvent) => {
      console.log(gesture, event);
      console.log('------end------');
    }
  };
  // private el: HTMLElement;
  constructor(private el: HTMLElement) {
    console.log(this);
  }

  init(options: Partial<Options>) {
    this.options = {
      ...this.defaults,
      ...options
    };
    this.el.addEventListener('wheel', this.onWheel.bind(this));
    console.log(this);
  }
  off() {
    this.el.removeEventListener('wheel', this.onWheel.bind(this));
  }

  private eventHandler(event: WheelEvent) {
    const deltaX = event.deltaX;
    const deltaY = event.deltaY;

    let finalX: number, finalY: number;

    if (Math.abs(deltaX) < this.options.tolerance) {
      // 避免低值差的算法（一般双指缓慢滑动行为）
      finalX = deltaX;
    } else {
      const xSpace = this.options.bX - deltaX;
      finalX = this.getFinalSpace(deltaX, xSpace);
    }

    if (Math.abs(deltaY) < this.options.tolerance) {
      finalY = deltaY;
    } else {
      const ySpace = this.options.bY - deltaY;
      finalY = this.getFinalSpace(deltaY, ySpace);
    }

    if (finalX !== 0 || finalY !== 0) {
      this.options.onPath(finalX, finalY);
      this.options.bX = deltaX;
      this.options.bY = deltaY;
    }
    this.storePoints(finalX, finalY, deltaX, deltaY);
    this.analysisGesture(event);
  }

  private onWheel(event: WheelEvent) {
    this.eventHandler(event);
    event.stopPropagation();
    event.preventDefault();
  }


  private analysisGesture(event: WheelEvent) {
    if (this.options.timeLock) return;
    this.options.timeLock = true;
    setTimeout(() => {
      const gesture = this.getGesture(this.sumValue(this.options.xcPoints), this.sumValue(this.options.ycPoints), this.sumValue(this.options.xPoints) + this.sumValue(this.options.yPoints));
      this.options.onGesture(gesture, event);
      this.options.xPoints = [];
      this.options.yPoints = [];
      this.options.xcPoints = [];
      this.options.ycPoints = [];
      this.options.timeLock = false;
    }, this.options.captureTime);
  }
  getGesture(aX: number, aY: number, aXY: number): Gesture {
    const abX = Math.abs(aX),
      abY = Math.abs(aY);
    let gesture: Gesture;
    if (aXY !== 0 && aXY % 120 === 0) {
      if (aXY > 0) gesture = 'zoom';
      else gesture = 'mini';
    } else {
      if (abX > abY) {
        if (aX > 0) {
          gesture = 'right';
        } else {
          gesture = 'left';
        }
      }
      if (abX < abY) {
        if (aY > 0) {
          gesture = 'down';
        } else {
          gesture = 'up';
        }
      }
    }
    return gesture;
  }
  sumValue(arr: number[]): number {
    return arr.reduce((acc, cur) => acc + cur, 0);
  }
  private storePoints(finalX: number, finalY: number, deltaX: number, deltaY: number) {
    this.options.xPoints.push(deltaX);
    this.options.yPoints.push(deltaY);
    this.options.xcPoints.push(finalX);
    this.options.ycPoints.push(finalY);
  }
  private getFinalSpace(delta: number, space: number): number {
    return delta > 0 && space > 0 || delta < 0 && space < 0 ? space : 0;
  }
}

export function macMouseWheel(el: HTMLElement, options: Partial<Options>) {
  const nM = new MacMouseWheel(el);
  nM.init(options);
  return nM;
}