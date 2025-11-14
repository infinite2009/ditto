import React from 'react';
import styles from './index.module.less';

export interface ISelectBorderProps {
  rectInfo: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export default function SelectBorder({rectInfo}: ISelectBorderProps) {
  return rectInfo ? (
    <div
      className={styles.outline}
      style={{
        top: rectInfo.top,
        left: rectInfo.left,
        width: rectInfo.width,
        height: rectInfo.height
      }}
    >
      <div className={styles.topLeft} />
      <div className={styles.topRight} />
      <div className={styles.bottomRight} />
      <div className={styles.bottomLeft} />
      {/*<TooltipBar />*/}
    </div>
  ) : null;
}