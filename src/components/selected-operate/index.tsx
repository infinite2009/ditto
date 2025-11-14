import classNames from 'classnames';
import styles from './index.module.less';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';

interface SelectedOperateProps {
  test?: any;
}

const SelectedOperate: React.FC<SelectedOperateProps> = props => {
  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);
  const [pos, setPos] = useState<string>('');
  const operateWrapperSize = {
    width: 62,
    height: 25
  };

  const className = classNames({
    [styles.wrapper]: true,
    [styles[pos]]: true
  });

  const operateWrapper = useRef<HTMLDivElement>(null);
  const { x: x1, y: y1 } = editorStore.getPageRootWrapperRef()?.getBoundingClientRect() ?? {};

  const id = dslStore.selectedComponent.id;

  const onDeleted = useCallback(() => {
    dslStore.deleteComponent(id);
  }, [id]);

  const calcPosition = (x: number, y: number, width: number, height: number) => {
    // 水平方向位置
    let horizon = '';
    let vertical = '';

    if (x < width) {
      horizon = 'left';
    } else {
      horizon = 'right';
    }
    if (y < height) {
      vertical = 'Bottom';
    } else {
      vertical = 'Top';
    }
    return `${horizon}${vertical}`;
  };

  useEffect(() => {
    const { x: x2, y: y2, width: pWidth, height: pHeight } = operateWrapper.current?.parentElement?.getBoundingClientRect() ?? {};
    const left = x2 - x1 + pWidth;
    const top = y2 - y1;
    const pos = calcPosition(left, top, operateWrapperSize.width, operateWrapperSize.height);
    setPos(pos);
  }, [id]);

  return (
    <div className={className} ref={operateWrapper}>
      <span className={classNames([styles['copy-btn'], styles['operate-btn']])}>复制</span>
      <span className={classNames([styles['del-btn'], styles['operate-btn']])} onClick={onDeleted}>
        删除
      </span>
    </div>
  );
};

export default SelectedOperate;
