import { Tabs } from 'antd';
import styles from './index.module.less';

export default function FormPanel() {

  const tabsItems = [{
    key: 'event',
    label: '交互',
    children: <div className={styles.tabContent}><div style={{ height: 1000 }} ></div></div>
  }, {
    key: 'style',
    label: '样式',
    children: <div className={styles.tabContent}>样式</div>
  }];

  return (
    <div className={styles.main}>
      <Tabs items={tabsItems} />
    </div>
  );
}
