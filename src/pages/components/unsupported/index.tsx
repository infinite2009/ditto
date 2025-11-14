import { ReactElement } from 'react';

import styles from './index.module.less';
import { OpenedBox } from '@/components/icon';

export interface IUnsupportedProps {
  title: string;
  icon?: ReactElement;
}

export default function Unsupported({ title, icon }: IUnsupportedProps) {
  // const Icon = icon;
  return (
    <div className={styles.unsupported}>
      {icon || <OpenedBox className={styles.eventIcon} />}
      <span className={styles.title}>{title}</span>
    </div>
  );
}
