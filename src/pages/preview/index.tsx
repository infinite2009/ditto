import React, { useEffect, useState } from 'react';
import IPageSchema from '@/types/page.schema';
import * as dsl from '@/mock/tab-case.json';
import PageRenderer from '@/pages/components/page-renderer';

export default function Preview() {
  const [dslState, setDslState] = useState<IPageSchema>();

  useEffect(() => {
    fetchDSL().then(data => {
      setDslState(data);
    });
  }, []);

  async function fetchDSL(): Promise<IPageSchema> {
    return new Promise<IPageSchema>(resolve => {
      resolve(dsl as unknown as IPageSchema);
    });
  }

  return dslState ? <PageRenderer dsl={dslState} /> : <div>未获得有效的DSL</div>;
}