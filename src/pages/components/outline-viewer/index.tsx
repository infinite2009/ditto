/**
 * @file 鼠标悬停时显示容器组件及其祖先的轮廓
 */
import { ComponentId } from '@/types';
import styles from './index.module.less';

export interface IOutlineViewerProps {
  rectsInfo: { id: ComponentId; rect: { top: number; left: number; width: number; height: number } }[];
}

export default function OutlineViewer({rectsInfo}: IOutlineViewerProps) {

  function renderSketch() {
    return rectsInfo.map(item => {
      return <div key={item.id} className={styles.outline} style={item.rect} />;
    });
  }

  return <div>{renderSketch()}</div>;
}
