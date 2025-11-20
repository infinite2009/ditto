import { Input, Modal, Select, TreeSelect } from 'antd';

import styles from './index.module.less';
import { CloseThin } from '@/components/icon';

export interface ReplacementConfigModalProps {
  onClose: () => void;
  open: boolean;
}

function ReplacementConfigModal({ open, onClose }: ReplacementConfigModalProps) {
  function handleOk() {
    onClose?.();
  }

  function handleClose() {
    onClose?.();
  }

  function handleGitAddr() {

  }

  return (
    <Modal
      classNames={{ content: styles.modalContent, header: styles.modalHeader, footer: styles.modalFooter }}
      title="业务组件配置"
      open={open}
      onOk={handleOk}
      onCancel={handleClose}
      closeIcon={<CloseThin className={styles.icon} />}
    >
      <div className={styles.replacementConfigContent}>
        <div className={styles.fieldContainer}>
          <span className={styles.fieldLabel}>代码仓库地址</span>
          <div className={styles.fieldInput}><span className={styles.fieldInputPrefix}>https://github.com/</span><Input onBlur={handleGitAddr} onPressEnter={handleGitAddr} /></div>
        </div>
        <div className={styles.fieldContainer}>
          <span className={styles.fieldLabel}>分支</span>
          <Select classNames={{ root: styles.branchSelect }} />
        </div>
        <div className={styles.fieldContainer}>
          <span className={styles.fieldLabel}>业务组件路径</span>
          <TreeSelect classNames={{ root: styles.componentPathTree }} variant="outlined"/>
        </div>
      </div>
    </Modal>
  );
}

ReplacementConfigModal.displayName = 'ReplacementConfigModal';

export default ReplacementConfigModal;
