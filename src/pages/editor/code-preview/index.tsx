import { useContext, useEffect, useRef, useState } from 'react';

import style from './index.module.less';
import { Button, message, Select, Tabs } from 'antd';
import { observer } from 'mobx-react';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Copy } from '@/components/icon';
import Editor from '@monaco-editor/react';
import { reaction, toJS } from 'mobx';
import fileManager from '@/service/file';
import { isDifferent } from '@/util';

export default observer(function CodePreview() {
  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);

  const [pageCode, setPageCode] = useState<string>('');
  const [storeCode, setStoreCode] = useState<string>('');

  const defaultPageCodeRef = useRef('');
  const defaultStoreCodeRef = useRef('');

  reaction(
    () => toJS(dslStore?.dsl),
    (data, oldData) => {
      if (!isDifferent(data, oldData)) {
        return;
      }
      generateCode().then();
    }
  );

  useEffect(() => {
    if (editorStore.framework === 'React') {
      if (!pageCode) {
        generateCode().then();
      }
    } else {
      if (!storeCode) {
        generateCode().then();
      }
    }
    generateCode().then();
  }, [editorStore.framework, editorStore.language]);

  const tabItemsForVue = [
    {
      key: 'view',
      label: '视图',
      children: renderView()
    }
  ];

  const tabItemsForReact = [
    ...tabItemsForVue,
    {
      key: 'store',
      label: '模型',
      children: renderStore()
    }
  ];

  function renderView() {
    return (
      <div className={style.codeContent}>
        <Editor
          theme="vs-dark"
          language="typescript"
          value={pageCode || '// 未生成有效代码'}
          onChange={onChange}
          beforeMount={monaco => {
            const compilerOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions();

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              ...compilerOptions,
              jsx: monaco.languages.typescript.JsxEmit.React
            });

            // 暂时先关闭语法检查。TODO 等待 依赖库集成的 d.ts 闭环后打开
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
              noSuggestionDiagnostics: true,
              noSemanticValidation: true,
              noSyntaxValidation: true
            });
          }}
        />
      </div>
    );
  }

  function renderStore() {
    return (
      <div className={style.codeContent}>
        <Editor
          theme="vs-dark"
          language="typescript"
          value={storeCode || '// 未生成有效代码'}
          onChange={onChangeStoreCode}
          beforeMount={monaco => {
            const compilerOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions();

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              ...compilerOptions,
              jsx: monaco.languages.typescript.JsxEmit.React
            });

            // 暂时先关闭语法检查。TODO 等待 依赖库集成的 d.ts 闭环后打开
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
              noSuggestionDiagnostics: true,
              noSemanticValidation: true,
              noSyntaxValidation: true
            });
          }}
        />
      </div>
    );
  }

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
      setPageCode('');
      setStoreCode('');
      defaultPageCodeRef.current = '';
      defaultStoreCodeRef.current = '';
      return;
    }
    if (editorStore.framework === 'React') {
      const { pageCode, storeCode } = await fileManager.generateReactCode(dslStore.dsl);
      setPageCode(pageCode);
      setStoreCode(storeCode);
      defaultPageCodeRef.current = pageCode;
      defaultStoreCodeRef.current = storeCode;
    } else {
      const pageCode = await fileManager.generateVueCode(dslStore.dsl);
      console.log('vue page code: ', pageCode);
      setPageCode(pageCode);
      defaultPageCodeRef.current = pageCode;
    }
  }

  function onChange(val: string) {
    setPageCode(val);
  }

  function onChangeStoreCode(val: string) {
    setStoreCode(val);
  }

  function resetCode() {
    setPageCode(defaultPageCodeRef.current);
  }

  return (
    <div className={style.codePreview}>
      <div className={style.framework}>
        <Button onClick={resetCode}>重置代码</Button>
        <span>切换框架：</span>
        <Select className={style.frameworkSelector} value={getFrameworkSelect()} onChange={handleChangeFramework}>
          <Select.Option value="1">React(TypeScript)</Select.Option>
          <Select.Option value="3">Vue(TypeScript)</Select.Option>
        </Select>
        <CopyToClipboard text={pageCode}>
          <Copy className={style.icon} onClick={() => message.success('已复制')} />
        </CopyToClipboard>
      </div>
      <Tabs
        rootClassName={style.codeTabs}
        items={editorStore.framework === 'React' ? tabItemsForReact : tabItemsForVue}
      />
    </div>
  );
});
