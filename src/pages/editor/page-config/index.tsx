import { Tabs } from 'antd';
import { observer } from 'mobx-react';
import NavConfig from './NavConfig';
import MenuConfig from './MenuConfig';
import { useSearchParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { TabsProps } from 'antd/lib';
import NoteConfig from '../note-config';

export default observer(function PageConfig() {
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);

  const [searchParams] = useSearchParams();
  const [activeKey, setActiveKey] = useState('nav');
  const projectId = searchParams.get('projectId');

  useEffect(() => {
    setActiveKey(editorStore.pageConfig.activeKey || 'nav');
  }, [editorStore.pageConfig.activeKey]);

  const onChange: TabsProps['onChange'] = e => {
    setActiveKey(e);
    editorStore.setPageConfig(true, e);
  };

  return (
    <Tabs
      activeKey={activeKey}
      onChange={onChange}
      items={[
        {
          label: '顶部导航',
          key: 'nav',
          children: <NavConfig projectId={projectId} />
        },
        {
          label: '菜单栏',
          key: 'menu',
          children: <MenuConfig projectId={projectId} />
        },
        {
          label: '批注',
          key: 'note',
          children: (
            <NoteConfig
              pageId={dslStore.currentPageId}
              componentId="PageRoot0"
            />
          )
        }
      ]}
    ></Tabs>
  );
});
