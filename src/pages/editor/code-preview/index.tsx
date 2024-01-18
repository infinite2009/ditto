import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // 这里可以选择不同的主题
import 'prismjs/components/prism-typescript';

import style from './index.module.less';
import { Select } from 'antd';
import { observer } from 'mobx-react';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import fileManager from '@/service/file';

export default observer(function CodePreview() {
  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);

  const [code, setCode] = useState<string>('');

  useLayoutEffect(() => {
    Prism.highlightAll();
  }, [code]);

  useEffect(() => {
    generateCode().then();
  }, [dslStore?.dsl]);

  function handleChangeFramework(data: string) {
    switch (data) {
      case '1':
        editorStore.setFramework('React', 'TypeScript');
        break;
      case '2':
        editorStore.setFramework('React', 'JavaScript');
        break;
      case '3':
        editorStore.setFramework('Vue', 'TypeScript');
        break;
    }
    generateCode().then();
  }

  function getFrameworkSelect() {
    if (editorStore.framework === 'React') {
      if (editorStore.language === 'TypeScript') {
        return '1';
      }
      return '2';
    } else {
      if (editorStore.language === 'TypeScript') {
        return '3';
      }
      return '4';
    }
  }

  async function generateCode() {
    if (!dslStore?.dsl) {
      setCode('');
    }
    let code: string;
    if (editorStore.framework === 'React') {
      code = await fileManager.generateReactCode(dslStore.dsl);
    } else {
      code = await fileManager.generateVueCode(dslStore.dsl);
    }
    setCode(code);
  }

  return (
    <div className={style.codePreview}>
      <div className={style.framework}>
        <span>切换框架：</span>
        <Select className={style.frameworkSelector} value={getFrameworkSelect()} onChange={handleChangeFramework}>
          <Select.Option value="1">React(TypeScript)</Select.Option>
          <Select.Option value="2">React(JavaScript)</Select.Option>
          <Select.Option value="3">Vue(TypeScript)</Select.Option>
        </Select>
      </div>
      <pre className={style.codeContent}>
        <code className="language-typescript">{code || '// 未生成有效代码'}</code>
      </pre>
    </div>
  );
});
