import { useLayoutEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // 这里可以选择不同的主题
import 'prismjs/components/prism-typescript';

import style from './index.module.less';

export interface ICodePreviewProps {
  code: string;
}

export default function CodePreview({ code }: ICodePreviewProps) {
  useLayoutEffect(() => {
    Prism.highlightAll();
  }, []);

  if (!code) {
    return <div>未生成代码</div>;
  }

  return (
    <pre className={style.codePreview}>
      <code className="language-typescript">{code}</code>
    </pre>
  );
}
