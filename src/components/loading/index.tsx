/**
 * @DATE 2024/9/9
 * @AUTHOR luodongyang
 */

import styles from './index.module.less';

export interface ILoadingProps {}

export default function Loading(props: ILoadingProps) {
  return <div className={styles.loading}>加载中...</div>;
}
