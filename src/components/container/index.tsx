import { CSSProperties, ReactNode, useContext, useMemo } from 'react';
import classNames from 'classnames';

import styles from './index.module.less';
import { DSLStoreContext, EditorStoreContext, IframeCommunicationContext } from '@/hooks/context';
import useCustomProps from '@/hooks/useCustomProps';
import { DesignMode } from '@/service/editor-store';

export interface IContainerProps {
  align: 'normal' | 'start' | 'center' | 'end' | 'stretch';
  // style: CSSProperties;
  children: ReactNode[];
  gap: number;
  justify: 'normal' | 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch';
  style: CSSProperties;
  vertical: boolean;
  wrap: 'nowrap' | 'wrap';
}

export default function Container({ children, vertical, gap, wrap, justify, align, style, ...otherProps }: IContainerProps) {
  const customProps = useCustomProps(otherProps);
  const dslStore = useContext(DSLStoreContext);
  const classes = useMemo(() => {
    return classNames({
      [styles.rowWithoutChildren]: style?.flexDirection === 'row',
      [styles.columnWithoutChildren]: style?.flexDirection === 'column'
    });
  }, [children]);
  const editorStore = useContext(EditorStoreContext);
  const iframeCommunicationService = useContext(IframeCommunicationContext);

  function extractGapFromStr(gapStr = '') {
    const gapList = gapStr.trim().split(' ').filter(i => i);
    if (!gapList.length) return [0, 0];
    if (gapList.length === 1) {
      const item = parseInt(gapList[0]);
      return [item, item];
    }
    const [row, col] = gapList;
    return [parseInt(row), parseInt(col)];

  }

  const mergeGap = (rowGap: number | undefined, columnGap: number | undefined, gapStr: string) => {
    const [row, column] = extractGapFromStr(gapStr);
    return [rowGap ?? row, columnGap ?? column];
  };

  const mergedStyle: CSSProperties = useMemo(() => {
    let calculateGap = '';
    if ('columnGap' in style || 'rowGap' in style) {
      const [row, col] = mergeGap(parseInt(`${style.rowGap || 0}`), parseInt(`${style.columnGap || 0}`), `${gap}`);
      delete style.rowGap;
      delete style.columnGap;
      calculateGap = `${row}px ${col}px`;
    }
    return {
      justifyContent: justify,
      alignItems: align,
      ...style,
      gap: calculateGap,
      wrap,
      display: 'flex'
    };
  }, [vertical, gap, wrap, justify, align, style]);

  function renderChildren() {
    if (children?.length) {
      return children;
    }
    return editorStore.mode === DesignMode.preview ? null : <div className={classes}>请拖入任意元素</div>;
  }

  return (
    <div {...customProps} style={mergedStyle} >
      {renderChildren()}
    </div>
  );
}
