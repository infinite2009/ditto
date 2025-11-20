import { observer } from 'mobx-react';
import { MouseEventHandler, useContext, useRef, useState } from 'react';
import { EditorStoreContext } from '@/hooks/context';
import { message } from 'antd';
import { findTreeNode } from '@/util';
import { UrlType } from '@/enum';

function PageHeader() {
  const editorStore = useContext(EditorStoreContext);

  const [messageApi, contextHolder] = message.useMessage();

  const selectedTabRef = useRef<string>(null);

  const [_, setSelectedTab] = useState<string>(null);
  const clickTimeoutIdRef = useRef<NodeJS.Timeout>(null);

  const items = editorStore?.navConfig?.items || [];

  const onClickNavConfig: MouseEventHandler = e => {
    e.stopPropagation();
    editorStore.setPageConfig(true, 'nav');
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
    </div>
  );
}

PageHeader.displayName = 'PageHeader';

const Index = observer(PageHeader);

export default Index;
