import { Tabs } from 'antd';
import ComponentPanel from '@/pages/editor/component-panel';
import TemplatePanel from '@/pages/editor/template-panel';
import FavoritePanel from '@/pages/editor/favorite-panel';

import styles from './index.module.less';

const items = [
  {
    key: '1',
    label: '模板',
    children: <TemplatePanel />
  },
  {
    key: '2',
    label: '组件',
    children: <ComponentPanel />
  },
  {
    key: '3',
    label: '收藏',
    children: <FavoritePanel />
  }
];

export default function CompositionPanel() {
  return <Tabs className={styles.main} items={items}></Tabs>;
}
