import React, { useContext, useEffect } from 'react';
import PageRenderer from '@/pages/components/page-renderer';
import fileManager from '@/service/file';
import { message } from 'antd';
import { useSearch } from 'wouter/use-location';
import { observer } from 'mobx-react';
import { DSLStoreContext } from '@/hooks/context';

export default observer(function Preview() {
  const search = useSearch();
  const dslStore = useContext(DSLStoreContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetchDSL(params.get('file') as string, params.get('projectId') as string);
  }, [search]);

  async function fetchDSL(file: string, projectId: string): Promise<void> {
    if (!file || !projectId) {
      message.error('未找到文件!');
    }
    // 根据 pageId 获取 dsl
    const content = await fileManager.openFile(file, projectId);
    if (content) {
      dslStore.initDSL(JSON.parse(content));
    } else {
      message.error('文件已损坏!');
    }
  }

  return <PageRenderer />;
});
