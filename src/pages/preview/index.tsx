import { useCallback, useContext, useEffect, useState } from 'react';
import Toolbar, { PageActionEvent, PageWidth } from '@/pages/preview/toolbar';
import PageRenderer from '@/pages/components/page-renderer';
import styles from './index.module.less';
import PageAction from '@/types/page-action';
import Empty from '@/pages/editor/empty';
import { Button, message } from 'antd';
import { AimOutlined } from '@ant-design/icons';
import { AppStoreContext, DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import EditorStore, { DesignMode } from '@/service/editor-store';
import NewFileManager from '@/service/new-file-manager';
import IPageSchema from '@/types/page.schema';
import DSLStore from '@/service/dsl-store';
import { isDifferent, isWeb, mapTree } from '@/util';
import { useSearchParams } from 'react-router-dom';
import { getVoltronMenuList, getVoltronNavigationList } from '@/api';
import { UrlType } from '@/enum';
import { MenuItem } from '../editor/page-config/MenuConfig';
import { NavItem } from '../editor/page-config/NavConfig';
import { nanoid } from 'nanoid';
import ComponentManager from '@/service/component-manager';
import usePageStore from '@/store/usePageStore';
import { useMount } from 'ahooks';
import { reaction } from 'mobx';

export default observer(function Preview() {
  // hooks
  const appStore = useContext(AppStoreContext);
  const pageStore = usePageStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // state
  const [dslStore] = useState<DSLStore>(new DSLStore());
  const [editorStore] = useState<EditorStore>(new EditorStore());
  const [showTab, setShowTab] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  /**
   * 打开指定pageId的文件
   */
  const openFile = useCallback(async (pageId: string) => {
    const { dsl, data } = await NewFileManager.fetchDSLByPageId(pageId);
    editorStore.setMenuConfig({
      show: Boolean(data.showMenu)
    });
    if (dsl) {
      dslStore.initDSL(dsl as unknown as IPageSchema);
    } else {
      message.error('文件已损坏!');
    }
  }, []);

  useMount(() => {
    editorStore.setProjectId(searchParams.get('projectId'));
    editorStore.setPageWidth(Number(searchParams.get('pageWidth')) || PageWidth.auto);
    reaction(
      () => editorStore.selectedPageId,
      (data, oldData) => {
        if (!isDifferent(data, oldData)) {
          return;
        }
        if (data) {
          openFile(editorStore.selectedPageId).then();
        }
      }
    );
  });

  /**
   * 预览尺寸变更
   */
  function changePageSize(pageWidth: PageWidth) {
    searchParams.set('pageWidth', String(pageWidth));
    setSearchParams(searchParams);
    editorStore.setPageWidth(pageWidth);
  }

  /**
   * Tab栏事件
   */
  async function handleOnDo(e: PageActionEvent) {
    switch (e.type) {
      case PageAction.changePageSize:
        changePageSize(e?.payload?.pageWidth);
        break;
    }
  }

  /**
   * 鼠标移入Icon
   */
  const handleMouseOverIcon = () => {
    setShowTab(true);
  };

  /**
   * 鼠标移出悬浮Tab
   */
  const handleMouseOutTab = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setTimeoutId(
      setTimeout(() => {
        setShowTab(false);
      }, 400)
    );
  };

  /**
   * 鼠标移入悬浮Tab
   */
  const handleMouseEnterTab = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  /**
   * 根据projectId获取页面列表
   */
  async function fetchPageList() {
    const projectId = searchParams.get('projectId');
    const pages = await NewFileManager.fetchPages(projectId);
    pageStore.setPageList(pages);
    editorStore.setPageList(pages);
    return pages;
  }

  async function fetchNav() {
    const projectId = searchParams.get('projectId');
    const { data } = await getVoltronNavigationList({ projectId });
    const result: NavItem[] = (data?.list || []).map(i => ({
      label: i.name,
      key: i.id || nanoid(),
      url: i.urlType === UrlType.EXTERNAL_LINK ? i.url : '',
      pageId: i.urlType === UrlType.INTERNAL_LINK ? i.url : '',
      type: i.urlType
    }));
    editorStore.setNavConfig({
      items: result
    });
    return result;
  }

  async function fetchMenu() {
    const projectId = searchParams.get('projectId');
    const { data } = await getVoltronMenuList({ projectId });
    const result = mapTree(data || [], item => {
      return {
        ...item,
        key: String(item.id),
        label: item.name,
        type: item.urlType,
        pageId: item.urlType === UrlType.INTERNAL_LINK ? item.url : '',
        url: item.urlType === UrlType.EXTERNAL_LINK ? item.url : '',
        isLeaf: undefined
      };
    }) as any as MenuItem[];
    editorStore.setMenuConfig({
      items: result
    });
    return result;
  }

  /**
   * 初始化配置
   */
  async function init() {
    const pageList = await fetchPageList();
    Promise.allSettled([fetchNav(), fetchMenu()]);

    editorStore.setPageConfig(true, 'nav');
    const openedProjectId = searchParams.get('projectId');
    if (pageList.length) {
      const selectedPageId = searchParams.get('pageId') || pageList[0].id;
      editorStore.setSelectedPageId(openedProjectId, selectedPageId);
      openFile(selectedPageId);
    } else {
      editorStore.removeOpenedPage(openedProjectId);
    }
  }

  /**
   * 模式切换为预览
   */
  useEffect(() => {
    // 初始化组件库
    ComponentManager.init('preview').then();
    editorStore.toggleMode(DesignMode.preview);
  }, []);

  /**
   * 监听query变化
   */
  useEffect(() => {
    init().then();
  }, [searchParams]);

  return (
    <EditorStoreContext.Provider value={editorStore}>
      <DSLStoreContext.Provider value={dslStore}>
        <div
          className={classNames({
            [styles.preview]: true
          })}
          style={{ height: '100vh'}}
        >
          {/* 悬浮tab栏 */}
          <Button
            className={styles.icon}
            onMouseOver={handleMouseOverIcon}
            shape="circle"
            icon={<AimOutlined />}
          ></Button>
          <div
            className={classNames({
              [styles.stickyTab]: true,
              [styles.show]: showTab
            })}
            onMouseLeave={handleMouseOutTab}
            onMouseEnter={handleMouseEnterTab}
          >
            <Toolbar
              showTab={showTab}
              onDo={handleOnDo}
              pageWidth={editorStore.pageWidth}
              projectId={appStore.activeProject?.id}
              openFile={openFile}
            />
          </div>

          {/* 实际预览区 */}
          <div className={styles.previewArea}>
            <div className={styles.canvas}>
              <div id="canvasRoot">{editorStore.selectedPageId ? <PageRenderer /> : <Empty />}</div>
            </div>
          </div>
        </div>
      </DSLStoreContext.Provider>
    </EditorStoreContext.Provider>
  );
});
