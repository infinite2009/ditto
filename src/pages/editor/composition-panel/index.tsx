import { Tabs } from 'antd';
import ComponentPanel from '@/pages/editor/component-panel';
import FavoritePanel from '@/pages/editor/favorite-panel';

import styles from './index.module.less';

export interface ICompositionPanelProps {
  onApplyTemplate?: (path: string) => void;
  activeKey: string;
  onChangeTab?: (activeKey: string) => void;
}

export default function CompositionPanel({ onApplyTemplate, onChangeTab, activeKey = '1' }: ICompositionPanelProps) {
  const items = [
    {
      key: '1',
      label: '模块',
      // children: <TemplatePanel onApplyTemplate={onApplyTemplate} />
      children: <div>敬请期待</div>
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

  return (
    <Tabs className={styles.main} items={items} activeKey={activeKey} onChange={onChangeTab || (() => void 0)}></Tabs>
  );
}
