import styles from './index.module.less';
import { CSSProperties, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Menu, Playlist } from '@/components/icon';

export interface IPanelTabProps {
  onSelect: (type: PanelType) => void;
  style?: CSSProperties;
}

export enum PanelType {
  file,
  component
}

export default function PanelTab({ onSelect, style }: IPanelTabProps) {
  const [selectedType, setSelectedType] = useState<PanelType>(PanelType.file);

  function togglePanel(panelType: PanelType) {
    if (onSelect) {
      onSelect(panelType);
    }
    setSelectedType(panelType);
  }

  const fileBtnClassNames = useMemo(() => {
    return classNames({
      [styles.btn]: true,
      [styles.selected]: selectedType === PanelType.file
    });
  }, [selectedType]);

  const componentClassNames = useMemo(() => {
    return classNames({
      [styles.btn]: true,
      [styles.selected]: selectedType === PanelType.component
    });
  }, [selectedType]);

  return (
    <div className={styles.main} style={style}>
      <button className={fileBtnClassNames} onClick={() => togglePanel(PanelType.file)}>
        <Menu className={styles.tabIcon} />
      </button>
      <button className={componentClassNames} onClick={() => togglePanel(PanelType.component)}>
        <Playlist className={styles.tabIcon} />
      </button>
    </div>
  );
}
