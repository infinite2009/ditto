import styles from './index.module.css';
import { Button } from 'antd';

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

  return (
    <div className={styles.main}>
      <div></div>
      <div>
        <Button onClick={handleUndo}>撤销</Button>
        <Button onClick={handleRedo}>重做</Button>
      </div>
      <div className={styles.right}>
        <Button onClick={handlePreview}>预览</Button>
        <Button onClick={handleDownloadingCode}>下载代码</Button>
      </div>
    </div>
  );
}
