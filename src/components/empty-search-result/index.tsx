import styles from './index.module.less';
import { ReactNode } from 'react';

export interface IEmptySearchResultProps {
  keyword: string;
  children?: ReactNode;
}

export default function EmptySearchResult({ keyword, children }: IEmptySearchResultProps) {
  return (
    <div className={styles.emptySearchResult}>
      <span className={styles.keyword}>“{keyword}”</span>
      <span className={styles.content}>{ children ? children : '暂无相关内容'}</span>
    </div>
  );
}
