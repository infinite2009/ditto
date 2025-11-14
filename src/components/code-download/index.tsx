/**
 * @DATE 2024/9/25
 * @AUTHOR luodongyang
 */
import { ReactNode, useRef } from 'react';

import styles from './index.module.less';

// import styles from './index.module.less';

export interface ICodeDownloadProps {
  text: string;
  fileName: string;
  children: ReactNode;
}

export default function CodeDownload({ children, text, fileName }: ICodeDownloadProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null);

  function handleClicking() {
    if (text && anchorRef.current) {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const anchor = anchorRef.current;
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
    }
  }

  return (
    <div onClick={handleClicking}>
      {children}
      <a className={styles.download} ref={anchorRef} />
    </div>
  );
}
