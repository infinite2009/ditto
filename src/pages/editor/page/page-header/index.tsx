import { observer } from 'mobx-react';
import React, { MouseEventHandler, useContext, useRef, useState } from 'react';
import { EditorStoreContext, IframeCommunicationContext } from '@/hooks/context';
import { message } from 'antd';
import { ProHeader, ProHeaderProps } from '@bilibili/ui';
import { findTreeNode } from '@/util';
import { UrlType } from '@/enum';

export default observer(function PageHeader() {
  const editorStore = useContext(EditorStoreContext);
  const iframeCommunication = useContext(IframeCommunicationContext);

  const [messageApi, contextHolder] = message.useMessage();

  const selectedTabRef = useRef<string>(null);

  const [selectedTab, setSelectedTab] = useState<string>(null);

  const clickTimeoutIdRef = useRef<NodeJS.Timeout>(null);

  const logo: ProHeaderProps['logo'] = {
    url: editorStore?.navConfig?.logo || 'https://s1.hdslb.com/bfs/templar/york-static/qDA51Kz4chURK9Iu.png'
  };

  const items = editorStore?.navConfig?.items || [];

  const clickInterval = 300;

  const onClickNavConfig: MouseEventHandler = e => {
    e.stopPropagation();
    editorStore.setPageConfig(true, 'nav');
  };

  const headerMenu: ProHeaderProps['menu'] = {
    items: items.map(i => ({
      key: `${i.key}`,
      label: i.label
    })),
    onTabClick(activeKey, e) {
      selectedTabRef.current = activeKey;
      // 如果已经有延时任务，说明之前点了一次，
      if (clickTimeoutIdRef.current) {
        return;
      }
      onClickNavConfig(e as any);
      clickTimeoutIdRef.current = setTimeout(() => {
        clickTimeoutIdRef.current = null;
      }, clickInterval);
    }
  };

  const onDoubleClick: MouseEventHandler = e => {
    e.stopPropagation();
    // 双击触发之后，把之前因为触发单击的延时任务取消掉
    if (clickTimeoutIdRef.current !== null) {
      if (selectedTabRef.current) {
        setSelectedTab(selectedTabRef.current);
        const matchItem = findTreeNode(items, i => i.key === selectedTabRef.current)?.[0];
        if (matchItem.type === UrlType.INTERNAL_LINK && matchItem.pageId) {
          editorStore.setSelectedPageId(editorStore.projectId, matchItem.pageId);
        } else if (matchItem.type === UrlType.EXTERNAL_LINK && matchItem.url) {
          window.open(matchItem.url);
        } else {
          messageApi.warning('未配置链接');
        }
      }
      clearTimeout(clickTimeoutIdRef.current);
      clickTimeoutIdRef.current = null;
    }
  };

  return (
    <div style={{ marginTop: '1px' }} onClick={onClickNavConfig} onDoubleClick={onDoubleClick}>
      {contextHolder}
      <ProHeader
        logo={logo}
        menu={headerMenu}
        userInfo={{
          avatar: 'https://s1.hdslb.com/bfs/templar/york-static/8IDfaWmU9FVF2Qpw.png',
          userName: '吴彦祖'
        }}
      />
    </div>
  );
});
