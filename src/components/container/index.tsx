import { CSSProperties, ReactNode, useMemo } from 'react';
import classNames from 'classnames';

import style from './index.module.less';

export interface IContainerProps {
  flexDirection: CSSProperties['flexDirection'];
  flexBasis: number;
  height: number;
  width: number;
  flexGrow: number;
  flexShrink: number;
  alignItems: CSSProperties['alignItems'];
  justifyContent: CSSProperties['justifyContent'];
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  backgroundColor: string;
  children: ReactNode;
}

export default function Container({
  children,
  flexDirection,
  flexBasis,
  height,
  width,
  flexGrow,
  flexShrink,
  alignItems,
  justifyContent,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  backgroundColor
}: IContainerProps) {
  const inlineStyle: CSSProperties = useMemo(() => {
    return {
      display: 'flex',
      flexDirection,
      flexBasis,
      height,
      width,
      flexGrow,
      flexShrink,
      alignItems,
      justifyContent,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      backgroundColor: children ? backgroundColor : '#eee'
    };
  }, [
    flexDirection,
    flexBasis,
    height,
    width,
    flexGrow,
    flexShrink,
    alignItems,
    justifyContent,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    backgroundColor,
    children
  ]);

  const classes = useMemo(() => {
    return classNames({
      [style.rowWithoutChildren]: (flexDirection as string) === 'column',
      [style.columnWithoutChildren]: (flexDirection as string) === 'row'
    });
  }, [children]);

  function renderChildren() {
    if (children) {
      return children;
    }
    return <div className={classes}>请拖入任意元素</div>;
  }

  return <div style={inlineStyle}>{renderChildren()}</div>;
}
