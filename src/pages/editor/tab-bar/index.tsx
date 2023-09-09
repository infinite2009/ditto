import { CloseOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import classNames from 'classnames';
import styles from './index.module.less';

export interface TabItem {
  title: string;
  val: string;
}

export interface ITabBarProps {
  data: TabItem[];
  selected: string;
  onSelect: (selected: string, data: TabItem) => void;
  onClose: (closed: string, data: TabItem) => void;
}

export default function TabBar({ data, selected, onSelect, onClose }: ITabBarProps) {
  const handleClosingTab = useCallback((item: TabItem) => {
    if (onClose) {
      onClose(item.val, item);
    }
  }, []);

  const handleSelectingTab = useCallback((item: TabItem) => {
    if (onSelect) {
      onSelect(item.val, item);
    }
  }, []);

  const calcClasses = useCallback(
    (item: TabItem) => {
      return classNames({
        [styles.tabItem]: true,
        [styles.selected]: item.val === selected
      });
    },
    [selected]
  );

  const tpl = data.map(item => {
    return (
      <div key={item.val} className={calcClasses(item)} onClick={() => handleSelectingTab(item)}>
        <p className={styles.title}>{item.title}</p>
        <CloseOutlined
          className={styles.closeIcon}
          onClick={e => {
            e.stopPropagation();
            handleClosingTab(item);
          }}
        />
      </div>
    );
  });

  return <div className={styles.main}>{tpl}</div>;
}
