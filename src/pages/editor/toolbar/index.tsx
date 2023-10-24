import styles from './index.module.less';
import { Divider, Radio } from 'antd';
import PageAction from '@/types/page-action';
import React from 'react';
import {
  ClearOutlined,
  DesktopOutlined,
  DownloadOutlined,
  ExpandOutlined,
  LayoutOutlined,
  MobileOutlined,
  RedoOutlined,
  TabletOutlined,
  UndoOutlined,
  YoutubeOutlined
} from '@ant-design/icons';

export interface PageActionEvent {
  type: PageAction;
  payload?: { [key: string]: any };
}

interface IToolbarProps {
  onDo: (e: PageActionEvent) => void;
  disabledButtons: string[];
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

  function handleTogglePlatform(platform: 'pc' | 'tablet' | 'phone') {
    if (onDo) {
      onDo({
        type: PageAction.changePlatform
      });
    }
  }

  function handleClear() {
    if (onDo) {
      onDo({
        type: PageAction.clear
      });
    }
  }

  function handleExpand() {
    if (onDo) {
      onDo({
        type: PageAction.expandCanvas
      });
    }
  }

  function handleShowLayout() {
    // TODO: 展示布局
  }

  function handleChangeMode() {
    if (onDo) {
      onDo({ type: PageAction.changeView });
    }
  }

  function isDisabled(btnName: string) {}

  return (
    <div className={styles.main}>
      <div className={styles.leftBtnWrapper}>
        <Divider type="vertical" style={{ marginLeft: 0, borderColor: '#F1F2F3' }} />
        <UndoOutlined className={styles.iconBtn} onClick={handleUndo} />
        <RedoOutlined className={styles.iconBtn} onClick={handleRedo} />
        <Divider className={styles.divider} type="vertical" />
        <DesktopOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('pc')} />
        <TabletOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('tablet')} />
        <MobileOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('phone')} />
        <Divider className={styles.divider} type="vertical" />
        <ClearOutlined className={styles.iconBtn} onClick={() => handleClear} />
        <ExpandOutlined className={styles.iconBtn} onClick={() => handleExpand} />
        <LayoutOutlined className={styles.iconBtn} style={{ marginLeft: 'auto' }} onClick={() => handleShowLayout} />
        <Divider type="vertical" style={{ marginRight: 0, borderColor: '#F1F2F3' }} />
      </div>
      <div className={styles.rightBtnWrapper}>
        <DownloadOutlined className={styles.iconBtn} onClick={handleExportingCode} />
        <YoutubeOutlined className={styles.iconBtn} onClick={handlePreview} />
        <Radio.Group
          options={[
            { label: '设计', value: 'design' },
            { label: '源码', value: 'code' }
          ]}
          onChange={handleChangeMode}
          defaultValue="design"
          optionType="button"
          buttonStyle="solid"
        />
      </div>
    </div>
  );
}
