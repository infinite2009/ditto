import styles from './index.module.less';

export default function CustomTitleBar() {
  return (
    <div data-tauri-drag-region={true} className={styles.main}>
      custom title bar works!
    </div>
  );
}
