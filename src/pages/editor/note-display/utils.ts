import { Position } from "@xyflow/react";
import { CSSProperties } from "react";

type CalcParam = {
  x1: number;
  w1: number;
  x2: number;
  w2: number;
  y1: number;
  y2: number;
  h1: number;
  h2: number;
};

const calc = (value: number, scale = 100) => {
  return (value || 0) / (scale / 100);
};

const calcOffsetFromTop = ({ x1, x2, w1, w2, y1, y2, h1, h2 }: CalcParam) => {
  return {
    x: x1 + w1 / 2 - (x2 + w2 / 2),
    y: y2 + h2 - y1
  };
};
const calcOffsetFromRight = ({ x1, x2, w1, w2, y1, y2, h1, h2 }: CalcParam) => {
  return {
    x: x2 - x1 - w1,
    y: y2 + h2 / 2 - (y1 + h1 / 2)
  };
};
const calcOffsetFromBottom = ({ x1, x2, w1, w2, y1, y2, h1, h2 }: CalcParam) => {
  return {
    x: 0,
    y: 0
  };
};
const calcOffsetFromLeft = ({ x1, x2, w1, w2, y1, y2, h1, h2 }: CalcParam) => {
  return {
    x: x1 - (x2 + w2),
    y: y1 + h1 / 2 - (y2 + h2 / 2)
  };
};

export const calcOffset = ({ startRect, endRect, placement, scale = 100 }: { startRect: DOMRect; endRect: DOMRect; placement: Position; scale?: number }) => {
  const { x: x1, y: y1, width: w1, height: h1 } = startRect || {};
  const { x: x2, y: y2, width: w2, height: h2 } = endRect || {};
  const params = {
    x1: calc(x1, scale),
    x2: calc(x2, scale),
    y1: calc(y1, scale),
    y2: calc(y2, scale),
    w1: calc(w1, scale),
    w2: calc(w2, scale),
    h1: calc(h1, scale),
    h2: calc(h2, scale),
  };
  if (placement === Position.Top) {
    return calcOffsetFromTop(params);
  } else if (placement === Position.Right) {
    return calcOffsetFromRight(params);
  } else if (placement === Position.Bottom) {
    return calcOffsetFromBottom(params);
  } else if (placement === Position.Left) {
    return calcOffsetFromLeft(params);
  }
};

type Delta = {
  x: number;
  y: number;
};

const calcPointFromTop = (delta: Delta) => {
  if (delta.x > 0) {
    return {
      start: {
        x: delta.x,
        y: -delta.y
      },
      end: {
        x: 0,
        y: 0
      }
    };
  } else {
    return {
      start: {
        x: 0,
        y: -delta.y
      },
      end: {
        x: -delta.x,
        y: 0
      }
    };
  }
};

const calcPointFromRight = (delta: Delta) => {
  if (delta.y > 0) {
    return {
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: delta.x,
        y: delta.y
      }
    };
  }
  return {
    start: {
      x: 0,
      y: -delta.y
    },
    end: {
      x: delta.x,
      y: 0
    }
  };
};

const calcPointFromBottom = (delta: Delta) => {
  if (delta.x > 0) {
    return {
      start: {
        x: 0,
        y: 0
      },
      end: {
        x: delta.x,
        y: delta.y
      }
    };
  } else {
    return {
      start: {
        x: -delta.x,
        y: 0
      },
      end: {
        start: 0,
        end: delta.y
      }
    };
  }
};

const calcPointFromLeft = (delta: Delta) => {
  if (delta.y > 0) {
    return {
      start: {
        x: delta.x,
        y: delta.y
      },
      end: {
        x: 0,
        y: 0
      }
    };
  } else {
    return {
      start: {
        x: delta.x,
        y: 0
      },
      end: {
        x: 0,
        y: -delta.y
      }
    };
  }
};

export const calcPoint = ({ placement, delta }: { placement: Position; delta: Delta }) => {
  if (placement === Position.Top) {
    return calcPointFromTop(delta);
  } else if (placement === Position.Right) {
    return calcPointFromRight(delta);
  } else if (placement === Position.Bottom) {
    return calcPointFromBottom(delta);
  } else if (placement === Position.Left) {
    return calcPointFromLeft(delta);
  }
};

const calcContainerStyleFromTop = (delta: Delta, width: number, height: number): CSSProperties => {
  return {
    left: delta.x > 0 ? width / 2 : delta.x + width / 2,
    bottom: delta.y - 4
  };
};
const calcContainerStyleFromRight = (delta: Delta, width: number, height: number): CSSProperties => {
  return {
    left: -delta.x,
    top: delta.y < 0 ? height / 2 : height / 2 - delta.y
  };
};
const calcContainerStyleFromBottom = (delta: Delta, width: number, height: number): CSSProperties => {
  return {
    left: 0,
    top: 0
  };
};
const calcContainerStyleFromLeft = (delta: Delta, width: number, height: number): CSSProperties => {
  return {
    left: width,
    top: delta.y > 0 ? height / 2 : height / 2 + delta.y
  };
};

export const calcContainerStyle = ({ placement, delta, endRect, scale }: { placement: Position; delta: Delta; endRect: DOMRect; scale?: number }) => {
  const width = calc(endRect.width, scale);
  const height = calc(endRect.height, scale);
  if (placement === Position.Top) {
    return calcContainerStyleFromTop(delta, width, height);
  } else if (placement === Position.Right) {
    return calcContainerStyleFromRight(delta, width, height);
  } else if (placement === Position.Bottom) {
    return calcContainerStyleFromBottom(delta, width, height);
  } else if (placement === Position.Left) {
    return calcContainerStyleFromLeft(delta, width, height);
  }
};