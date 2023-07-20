
import Toolbar from '@/pages/editor/toolbar';

import { Tabs } from 'antd';
import PagePanel from '@/pages/editor/ page-panel';
import ComponentPanel from '@/pages/editor/component-panel';
import TemplatePanel from '@/pages/editor/template-panel';

import styles from './index.module.less';
import FormPanel from '@/pages/editor/form-panel';
import PageRenderer from '@/pages/components/page-renderer';
import React, { useEffect, useState } from 'react';
import IPageSchema from '@/types/page.schema';
import * as dsl from '@/mock/tab-case.json';

export default function Editor() {

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

  const tabsItems = [
    {
      key: 'component',
      label: '组件',
      children: <ComponentPanel />
    },
    {
      key: 'template',
      label: '模板',
      children: <TemplatePanel />
    }
  ];

  return <div className={styles.main}>
    <Toolbar />
    <div className={styles.editArea}>
      <div className={styles.panel}>
        <div className={styles.pagePanel}>
          <PagePanel />
        </div>
        <div className={styles.componentPanel}>
          <Tabs items={tabsItems} />
        </div>
      </div>
      <div className={styles.canvas}>
        <div className={styles.canvasInner}>
          { dslState ? <PageRenderer dsl={dslState} /> : <div>未获得有效的DSL</div> }
        </div>
      </div>
      <div className={styles.formPanel}>
        <FormPanel />
      </div>
    </div>
  </div>;
}
