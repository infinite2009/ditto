import { CSSProperties, useMemo } from 'react';
import classNames from 'classnames';
import styles from './index.module.less';

interface IIconProps {
  className?: string;
  onClick?: (e) => void;
  style?: CSSProperties;
}

function Icon({ style, className, onClick }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: true,
        [styles.iconfont]: true
      }),
    [className]
  );

  function handleClicking(e: any) {
    if (onClick) {
      onClick(e);
    }
  }

  return <i className={classes} onClick={handleClicking} style={style} />;
}

export function Plus({ style, className, onClick }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xinjian']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} />;
}

export function Menu({ style, className, onClick }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-caidan']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} />;
}

export function RoundedCorner({ style, className, onClick }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-danyuanjiao']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} />;
}

export function SideAlignment({ style, className, onClick }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bujuweizhi2']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} />;
}

export function Bold({ style, className, onClick }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-jiacu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} />;
}

export function LayoutDirection({ style, className, onClick }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bujuweizhi2']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} />;
}
