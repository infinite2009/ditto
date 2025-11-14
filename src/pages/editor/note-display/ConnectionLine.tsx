import { SVGAttributes } from 'react';
import styles from './index.module.less';
import classNames from 'classnames';
interface ConnectionLineProps extends React.HTMLAttributes<HTMLDivElement> {
  width: number | string;
  height: number | string;
  svg?: SVGAttributes<SVGElement>;
  animated?: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = props => {
  const { width, height, svg, animated, ...rest } = props;

  return (
    <div {...rest}>
      <svg
        width={width}
        height={height}
        className={classNames({
          [styles.animated]: animated
        })}
      >
        <path d={svg.path} stroke={svg.stroke || 'black'} strokeWidth={svg.strokeWidth || 1} fill="none" {...svg} />
      </svg>
    </div>
  );
};

export default ConnectionLine;
