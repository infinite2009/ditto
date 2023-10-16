import styles from './index.module.less';
import { HomeOutlined } from '@ant-design/icons';
import { useState } from 'react';

export interface IPanelTabProps {}

enum PanelType {
  file,
  commponent
}

export default function PanelTab({}: IPanelTabProps) {
  const [selectedType, setSelectedType] = useState<PanelType>(PanelType.file);

  function togglePanel(panelType: PanelType) {}

  return (
    <div className={styles.main}>
      <button className={styles.selectedBtn} onClick={() => togglePanel(PanelType.file)}>
        <HomeOutlined />
      </button>
      <button onClick={() => togglePanel(PanelType.commponent)}>
        <HomeOutlined />
      </button>
    </div>
  );
}
