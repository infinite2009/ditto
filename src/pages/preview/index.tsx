import React, { useEffect } from 'react';
import PageRenderer from '@/pages/components/page-renderer';
import fileManager from '@/service/file';
import { message } from 'antd';
import { useSearch } from 'wouter/use-location';

export default function Preview() {
  const search = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetchDSL(params.get('file') as string);
  }, [search]);

  async function fetchDSL(file: string): Promise<void> {
    if (!file) {
      message.error('未找到文件!');
    }
    // 根据 pageId 获取 dsl
    const content = await fileManager.openFile(file);
    if (content) {
      dslStore.initDSL(JSON.parse(content));
    } else {
      message.error('文件已损坏!');
    }
  }

  return <PageRenderer />;
}
