import styles from './index.module.less';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function Toolbar() {
  function handleUndo() {
    console.log('handleUndo works!');
  }

  function handleRedo() {
    console.log('handleRedo works!');
  }

  function handlePreview() {
    console.log('handlePreview works!');
  }

  function handleDownloadingCode() {
    console.log('handleDownloadingCode works!');
  }

  function handleCreatingNewPage() {
    // TODO: 增加新页面
  }

  return (
    <div className={styles.main}>
      <div>
        <Button type="primary" onClick={handleCreatingNewPage}><PlusOutlined />新建页面</Button>
      </div>
      <div>
        <Button className={styles.btn} onClick={handleUndo}>撤销</Button>
        <Button className={styles.btn} onClick={handleRedo}>重做</Button>
      </div>
      <div className={styles.right}>
        <Button className={styles.btn} onClick={handlePreview}>预览</Button>
        <Button className={styles.btn} onClick={handleDownloadingCode}>下载代码</Button>
      </div>
    </div>
  );
}
