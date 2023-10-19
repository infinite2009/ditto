import styles from './index.module.less';
import { HomeOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import classNames from 'classnames';

export interface IPanelTabProps {
  onSelect: (type: PanelType) => void;
}

export enum PanelType {
  file,
  component
}

export default function PanelTab({ onSelect }: IPanelTabProps) {
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
    <div className={styles.main}>
      <button className={fileBtnClassNames} onClick={() => togglePanel(PanelType.file)}>
        <HomeOutlined />
      </button>
      <button className={componentClassNames} onClick={() => togglePanel(PanelType.component)}>
        <HomeOutlined />
      </button>
    </div>
  );
}
