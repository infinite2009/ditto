import { Button, Drawer, DrawerProps, Space } from 'antd';
import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import fileManager from '@/service/file';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // 这里可以选择不同的主题
import 'prismjs/components/prism-typescript';
import style from './index.module.less';
import { Checkbox, message } from '@bilibili/ui';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CheckOutlined } from '@ant-design/icons';
import { Editor } from '@monaco-editor/react';

export default observer(function SourceEditor({ onClose, ...others }: DrawerProps) {
  const dslStore = useContext(DSLStoreContext);
  const [messageApi, contextHolder] = message.useMessage();
  // copyToClipboard(code);
  const { open } = others;
  const [content, setContent] = useState<string>('');
  const [simple, setSimple] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  async function loadCode() {
    if (!dslStore.dsl?.componentIndexes?.[dslStore.selectedComponent?.id]) {
      return;
    }
    const { id, configName } = dslStore.dsl.componentIndexes[dslStore.selectedComponent.id];
    const { pageCode: code } = await fileManager.generateReactCode(
      {
        ...dslStore.dsl,
        child: {
          current: id,
          configName,
          isText: false
        }
      },
      {
        simple
      }
    );
    // 末尾有个分号，这里通过slice去掉
    // setContent(code.slice(0, code.length - 2));
    setContent(simple ? code.slice(0, code.length - 2) : code);
  }

  function resetEventListener(e: ClipboardEvent) {
    e.preventDefault();
    e.preventDefault(); // 阻止默认行为
    const selectedText = window.getSelection().toString();
    e.clipboardData.setData('text/plain', `${selectedText}`);
  }

  useEffect(() => {
    if (open) {
      loadCode();
      window.addEventListener('copy', resetEventListener);
    }
    return () => {
      window.removeEventListener('copy', resetEventListener);
    };
  }, [open]);

  useEffect(() => {
    loadCode();
  }, [simple]);

  useLayoutEffect(() => {
    Prism.highlightAll();
  }, [content]);

  useEffect(() => {
    loadCode();
  }, []);

  return (
    <Drawer
      width="80%"
      onClose={onClose}
      maskClosable
      title="查看源码"
      extra={
        <Space>
          <Checkbox
            checked={simple}
            onChange={e => {
              setSimple(e.target.checked);
            }}
          >
            仅展示组件
          </Checkbox>
          <CopyToClipboard
            text={content}
            onCopy={() => {
              if (isCopied) {
                return;
              }
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 3000);
              messageApi.success('已复制');
            }}
          >
            <Button type="primary" iconPosition="end" icon={isCopied ? <CheckOutlined /> : null}>
              {isCopied ? '已复制' : '复制'}
            </Button>
          </CopyToClipboard>
        </Space>
      }
      {...others}
    >
      <div className={style.codePreview}>
        {contextHolder}

        {/* <pre className={style.codeContent}> */}
        <Editor
          theme="vs-dark"
          language="typescript"
          value={content || '// 未生成有效代码'}
          options={{
            readOnly: true,
            fontSize: 16
          }}
        />
        {/* <code className="language-typescript">{content || '// 未生成有效代码'}</code> */}
        {/* </pre> */}
      </div>
    </Drawer>
  );
});
