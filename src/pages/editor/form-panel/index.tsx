import { Tabs } from 'antd';
import styles from './index.module.less';

export default function FormPanel() {
  const tabsItems = [
    {
      key: 'style',
      label: '样式',
      children: <div className={styles.tabContent}>样式</div>
    },
    {
      key: 'basic',
      label: '基础',
      children: <div className={styles.tabContent}>基础</div>
    },
    {
      key: 'event',
      label: '事件',
      children: <div className={styles.tabContent}>事件</div>
    }
  ];

  return (
    <div className={styles.main}>
      <Tabs items={tabsItems} />
    </div>
  );
}
