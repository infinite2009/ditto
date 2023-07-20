import styles from './index.module.less';
import { Tabs } from 'antd';

export default function FormPanel() {

  const tabsItems = [{
    key: 'event',
    label: '交互',
    children: <div>交互</div>
  }, {
    key: 'style',
    label: '样式',
    children: <div>样式</div>
  }];

  return (
    <div className={styles.main}>
      <Tabs items={tabsItems} />
    </div>
  );
}
