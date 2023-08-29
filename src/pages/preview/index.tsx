import React, { useEffect, useState } from 'react';
import IPageSchema from '@/types/page.schema';
import * as dsl from '@/mock/tab-case.json';
import PageRenderer from '@/pages/components/page-renderer';
import DSLStore from '@/service/dsl-store';

export default function Preview() {
  const dslStore = DSLStore.createInstance();

  useEffect(() => {
    fetchDSL().then(data => {
      dslStore.initDSL(data);
    });
  }, []);

  async function fetchDSL(): Promise<IPageSchema> {
    return new Promise<IPageSchema>(resolve => {
      resolve(dsl as unknown as IPageSchema);
    });
  }

  return dslStore.dsl ? <PageRenderer dslStore={dslStore} /> : <div>未获得有效的DSL</div>;
}