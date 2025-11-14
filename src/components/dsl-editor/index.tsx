import { Button, Drawer, DrawerProps, Select, Space } from 'antd';
import { observer } from 'mobx-react';
import Editor from '@monaco-editor/react';
import { DSLStoreContext } from '@/hooks/context';
import { useContext, useEffect, useMemo, useState } from 'react';
import { error } from '@/service/logging';
import { jsonrepair } from 'jsonrepair';

export default observer(function DSLEditor({ onClose, ...others }: DrawerProps) {
  const dslStore = useContext(DSLStoreContext);
  const { open } = others;
  const [content, setContent] = useState<string>('');
  function onChange(e) {
    setContent(e?.replace('const dsl = ', ''));
  }

  function onCloseCb(e) {
    resetDSLContent();
    if (onClose) {
      onClose(e);
    }
  }

  function resetDSLContent() {
    setContent(JSON.stringify(dslStore.dsl, null, 4));
  }

  function onApply() {
    try {
      dslStore.overrideDSL(JSON.parse(content));
    } catch (e) {
      console.error('DSL 格式不正确，以下是具体错误：');
      error(e);
      resetDSLContent();
    }
  }

  useEffect(() => {
    if (open) {
      resetDSLContent();
    }
  }, [open]);

  return (
    <Drawer
      width={640}
      onClose={onClose}
      maskClosable
      title="编辑DSL"
      extra={
        <Space>
          <Button onClick={() => {
            setContent(jsonrepair(content));
          }}>格式修复</Button>
          <Button onClick={onCloseCb}>取消</Button>
          <Button onClick={resetDSLContent}>重置</Button>
          <Button type="primary" onClick={onApply}>
            应用
          </Button>
        </Space>
      }
      {...others}
    >
      <Editor width={600} language="json" value={content} onChange={onChange} />
    </Drawer>
  );
});
