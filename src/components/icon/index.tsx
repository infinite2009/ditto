import { CSSProperties, useMemo } from 'react';
import classNames from 'classnames';
import styles from './index.module.less';

interface IIconProps {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

function Icon({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: true,
        [styles.iconfont]: true,
        [styles.disabled]: disabled
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

export function Plus({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xinjian']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Menu({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-caidan']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Undo({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-chexiao-xianghou']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Close({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-guanbi1']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Clear({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-shanchusousuo']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Arrow({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-jiantou1']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Eye({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-liulan']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function DescendantOrder({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-paixu-zheng']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Layout({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-buju']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function More({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-gengduo1']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function AscendingOrder({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-paixu-dao']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Expand({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-cezhankai']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Phone({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-shouji']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Tablet({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-pingban']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Download({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xiazai']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function ExpandScreen({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-chuangkoukuanpingzhankai']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Desktop({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-web']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Preview({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bofang']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function ExpandDown({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zhankai1']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function PhoneSmall({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-shouji-xiao']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Redo({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-chexiao-xiangqian']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Clean({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-qingchu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function NewFolder({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-wenjianjiachuangjian']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function WebSmall({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-web-xiao']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function NewPage({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-shoujizhuomiankuaijie']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Share({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-fenxiang']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function EyeClose({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-a-eye_browse_off_linebukejian']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Playlist({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bodan']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function SuccessFilled({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-fankuitijiaochenggong']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function SwitchOrder({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-qiehuan']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Feedback({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-wentifankui']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Home({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zhuye']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function ArrowSmall({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-dakai']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function InfoFilled({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xinxi']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Start({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-hengxiangshunpaibu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function SpaceAround({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-hengxiangjunfenpaibu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Height({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-gaodu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Width({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-kuandu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function ShortBar({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bujuweizhi-duan']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Justify({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zuoyoulaqi']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Border({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bianju']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function AlignStart({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bujuweizhi2']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function Bold({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-jiacu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function ExpandThin({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zhankai']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function AlignCenter({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bujuweizhi-hengxiang-zhong']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function CircleCorner({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-yuanjiao']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Gap({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zuoyoujianju']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function UnderLine({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xiahuaxian']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function SingleGap({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-danbianju']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}

export function TextAlignCenter({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-juzhongduiqi']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Minus({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-shanchu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function TextAlignRight({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-youduiqi']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function PlusThin({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-tianjia']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Padding({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-shangxiazuoyoubianju']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Thickness({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xiankuang-cuxi']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Compact({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-jincouneirong']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function SingleBorder({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-danxiankuang']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Line({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xiankuang-zhixian']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Fixed({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-guding']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function LongBar({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bujuweizhi-chang']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function AlignCenter2({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-bujuweizhi-zongxiang-zhong']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Shadow({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-touying']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function ColumnSpaceBetween({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zongxiangliangduanduiqipaibu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function TextAlignLeft({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zuoduiqi']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function RowSpaceBetween({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-hengxiangliangduanduiqipaibu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function ColumnSpaceAround({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zongxiangjunfenpaibu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function LineThrough({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zhonghuaxian']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function ColumnLayout({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-zongxiangshunpaibu']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Border2({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xiankuang-sizhou']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Wrap({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-jiantou-huanhang']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function NoWrap({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-jiantou-jinhuanhang']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Grow({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-shiyingkuochong']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function Italian({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xieti']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
export function DashedLine({ style, className, onClick, disabled }: IIconProps) {
  const classes = useMemo(
    () =>
      classNames({
        [className]: !!className,
        [styles['icon-xiankuang-xuxian']]: true
      }),
    [className]
  );

  return <Icon className={classes} onClick={onClick} style={style} disabled={disabled} />;
}
