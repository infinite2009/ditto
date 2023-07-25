import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { Tabs } from 'antd';

import Toolbar from '@/pages/editor/toolbar';
import PagePanel from '@/pages/editor/ page-panel';
import ComponentPanel from '@/pages/editor/component-panel';
import TemplatePanel from '@/pages/editor/template-panel';
import FormPanel from '@/pages/editor/form-panel';
import PageRenderer from '@/pages/components/page-renderer';
import IPageSchema from '@/types/page.schema';
import * as dsl from '@/mock/tab-case.json';
import LayerComponentPanel from '@/pages/editor/layer-component-panel';
import { HTML5Backend } from 'react-dnd-html5-backend';

import styles from './index.module.less';

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
      key: 'layer',
      label: '图层组件',
      children: <LayerComponentPanel />
    },
    {
      key: 'template',
      label: '模板',
      children: <TemplatePanel />
    }
  ];

  return (
    <div className={styles.main}>
      <Toolbar />
      <div className={styles.editArea}>
        <DndProvider backend={HTML5Backend}>
          <div className={styles.draggableArea}>
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
                {dslState ? <PageRenderer dsl={dslState} /> : <div>未获得有效的DSL</div>}
              </div>
            </div>
          </div>
        </DndProvider>
        <div className={styles.formPanel}>
          <FormPanel />
        </div>
      </div>
    </div>
  );
}
