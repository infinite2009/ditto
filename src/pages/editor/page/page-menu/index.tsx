import { observer } from 'mobx-react';
import React, { MouseEventHandler, PropsWithChildren, useContext, useMemo, useRef } from 'react';
import { EditorStoreContext } from '@/hooks/context';
import { message } from 'antd';
import { findTreeNode, mapTree } from '@/util';
import { ProMenu, ProMenuProps } from '@bilibili/ui';
import classNames from 'classnames';
import { FlexProps } from 'antd/lib';
import styles from '@/components/page-root/index.module.less';
import { UrlType } from '@/enum';
import { useUpdateEffect } from 'ahooks';
import useIframeStore from '@/iframe/store';
import { DesignMode } from '@/service/editor-store';

type MenuProps = PropsWithChildren<FlexProps>;

export default observer(function PageMenu({ children, className }: MenuProps) {
  const editorStore = useContext(EditorStoreContext);
  const selectedMenuRef = useRef<string>(null);
  const clickTimeoutIdRef = useRef<NodeJS.Timeout>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const { iframe } = useIframeStore();

  const menuItems = editorStore.menuConfig?.items || [];
  const clickInterval = 300;

  const items = useMemo(() => mapTree(editorStore?.menuConfig?.items, (item) => {
    return {
      id: item.key,
      key: item.key,
      label: item.label,
      children: item.children
    };
  }), [editorStore.menuConfig?.items]);

  const handleDoubleClick: React.MouseEventHandler<HTMLUListElement> = e => {
    e.stopPropagation();
    // 双击触发之后，把之前因为触发单击的延时任务取消掉
    if (clickTimeoutIdRef.current !== null) {
      if (selectedMenuRef.current) {
        const matchItem = findTreeNode(menuItems, i => i.key === selectedMenuRef.current)?.[0];
        if (matchItem.type === UrlType.INTERNAL_LINK && matchItem.pageId) {
          editorStore.setSelectedPageId(editorStore.projectId, matchItem.pageId);
        } else if (matchItem.type === UrlType.EXTERNAL_LINK && matchItem.url) {
          window.open(matchItem.url);
        } else {
          messageApi.warning('未配置链接').then();
        }
      }
      clearTimeout(clickTimeoutIdRef.current);
      clickTimeoutIdRef.current = null;
    }
  };

  const handleSelectingMenu: ProMenuProps['onSelect'] = ({ key, keyPath }) => {
    selectedMenuRef.current = key;
    if (editorStore.mode !== DesignMode.preview) {
      // 如果已经有延时任务，说明之前点了一次，
      if (clickTimeoutIdRef.current) {
        return;
      }
      editorStore.setMenuConfig({
        ...editorStore.menuConfig,
        openKeys: keyPath
      });
      clickTimeoutIdRef.current = setTimeout(() => {
        clickTimeoutIdRef.current = null;
      }, clickInterval);
    } else {
      const matchItem = findTreeNode(menuItems, i => i.key === selectedMenuRef.current)?.[0];
      if (matchItem.type === UrlType.INTERNAL_LINK && matchItem.pageId) {
        editorStore.setSelectedPageId(editorStore.projectId, matchItem.pageId);
      } else if (matchItem.type === UrlType.EXTERNAL_LINK && matchItem.url) {
        window.open(matchItem.url);
      } else {
        messageApi.warning('未配置链接').then();
      }
    }
  };

  const onClickMenuConfig: MouseEventHandler = e => {
    e.stopPropagation();
    editorStore.setPageConfig(true, 'menu');
  };

  useUpdateEffect(() => {
    // editorStore.updateComponentSizeSketch(editorStore.scale, iframe);
  }, [editorStore?.menuConfig?.show]);

  function onClickMenu(keyPath: string) {
    console.log('keyPath: ', keyPath);
    clickTimeoutIdRef.current = setTimeout(() => {
      clickTimeoutIdRef.current = null;
    }, clickInterval);
  }

  return (
    <div className={classNames(styles.menuContentWrapper, className)}>
      {contextHolder}
      {editorStore?.menuConfig?.show && (
        <div className={styles['left']} onClick={onClickMenuConfig}>
          <div className={classNames(styles['left-inner'], 'page-menu-wrapper')}>
            <ProMenu
              defaultOpenKeys={editorStore?.menuConfig?.defaultOpenKeys}
              defaultSelectedKeys={editorStore?.menuConfig?.defaultSelectedKeys}
              items={items}
              // onDoubleClick={handleDoubleClick}
              // onClick={({ domEvent, key, keyPath }) => {
              //   domEvent.stopPropagation();
              //   onClickMenu(keyPath);
              // }}
              onSelect={handleSelectingMenu}
            />
          </div>
        </div>
      )}
      {children}
    </div>
  );
});
