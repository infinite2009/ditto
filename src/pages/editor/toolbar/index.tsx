import styles from './index.module.less';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageAction from '@/types/page-action';

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

  return (
    <div className={styles.main}>
      <div>
        <Button onClick={handleOpenProject}>打开项目</Button>
        <Button type="primary" onClick={handleCreatingNewPage}><PlusOutlined />新建页面</Button>
        <Button onClick={handleSavingFile}>保存页面</Button>
      </div>
      <div>
        <Button className={styles.btn} onClick={handleUndo}>撤销</Button>
        <Button className={styles.btn} onClick={handleRedo}>重做</Button>
      </div>
      <div className={styles.right}>
        <Button className={styles.btn} onClick={handlePreview}>预览</Button>
        <Button className={styles.btn} onClick={handleExportingCode}>下载代码</Button>
      </div>
    </div>
  );
}
