import styles from './index.module.less';
import { Button, Divider } from 'antd';
import PageAction from '@/types/page-action';
import React from 'react';
import { DesktopOutlined, MobileOutlined, RedoOutlined, TabletOutlined, UndoOutlined } from '@ant-design/icons';

export interface PageActionEvent {
  type: PageAction;
  payload?: { [key: string]: any };
}

interface IToolbarProps {
  onDo: (e: PageActionEvent) => void;
}

export default function Toolbar({ onDo }: IToolbarProps) {
  function handleUndo() {
    if (onDo) {
      onDo({
        type: PageAction.undo
      });
    }
  }

  function handleRedo() {
    if (onDo) {
      onDo({
        type: PageAction.redo
      });
    }
  }

  function handlePreview() {
    if (onDo) {
      onDo({
        type: PageAction.preview
      });
    }
  }

  function handleExportingCode() {
    if (onDo) {
      onDo({
        type: PageAction.exportCode
      });
    }
  }

  function handleCreatingNewPage() {
    if (onDo) {
      onDo({
        type: PageAction.createPage
      });
    }
  }

  function handleOpenProject() {
    if (onDo) {
      onDo({
        type: PageAction.openProject
      });
    }
  }

  function handleSavingFile() {
    if (onDo) {
      onDo({
        type: PageAction.saveFile
      });
    }
  }

  function handleTogglePlatform(platform: 'pc' | 'pad' | 'phone') {}

  return (
    <div className={styles.main}>
      <div className={styles.leftBtnWrapper}>
        <UndoOutlined className={styles.iconBtn} onClick={handleUndo} />
        <RedoOutlined className={styles.iconBtn} onClick={handleRedo} />
        <Divider type="vertical" />
        <DesktopOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('pc')} />
        <TabletOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('pc')} />
        <MobileOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('pc')} />
        <Divider type="vertical" />
      </div>
      <div className={styles.right}>
        <Button className={styles.btn} onClick={handlePreview}>
          预览
        </Button>
        <Button className={styles.btn} onClick={handleExportingCode}>
          下载代码
        </Button>
      </div>
    </div>
  );
}
