import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import fileManager from '@/service/file';
import { ProjectInfo } from '@/types/app-data';
import { AppStoreContext } from '@/hooks/context';
import AppStore, { Scene } from '@/service/app-store';
import DbStore from '@/service/db-store';
import ComponentManager from '@/service/component-manager';
import { listen, TauriEvent } from '@tauri-apps/api/event';
import { isWeb, parseCustomProtocolUrl } from '@/util';
import { appWindow } from '@tauri-apps/api/window';
import NewFileManager from '@/service/new-file-manager';
import { useMemoizedFn } from 'ahooks';
import { info } from '@/service/logging';
import { UpdateModal } from '@/components/update-modal';
import { App as AntdApp, ConfigProvider, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Loading from '@/components/loading';
import RouteTabs from '@/components/route-tabs';
import routes from '@/routes';
import { relaunch } from '@tauri-apps/api/process';
import { emitter } from './api';
import HotkeysManager from '@/service/hotkeys-manager';
import { HotkeysProvider } from 'react-hotkeys-hook';

export default observer(function App() {
  const [showUI, setShowUI] = useState<boolean>(false);

  const [appStore] = useState<AppStore>(new AppStore());

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // 监听应用关闭
    let unListen1 = null;
    let unListen2 = null;

    init().finally(() => {
      if (isWeb()) {
        appStore.registerHandlers(Scene.system, { reload });
        return;
      }
      appStore.registerHandlers(Scene.system, { reload, relaunch: relaunchApp });
      listen<string>('scheme-request-received', event => {
        info(`App tsx: ${event}`);
        if (event.payload) {
          const result = parseCustomProtocolUrl(event.payload);
          appWindow.show().then();
          switch (result.host) {
            case 'login':
              handleLogin(result.queryParameters?.code as string).then();
              break;
            case 'share':
              handleShare(result.queryParameters).then();
              break;
          }
        }
      }).then(callback => {
        unListen1 = callback;
        // 让 Rust 后端重新触发一次 url scheme 事件
        // appWindow.emit('app:replay').then();
        // info(`App tsx: app:replay event emitted`).then();
      });

      listen<string>(TauriEvent.WINDOW_CLOSE_REQUESTED, () => {
        console.log('用户试图关闭 voltron');
      }).then(callback => {
        unListen2 = callback;
      });
    });

    return () => {
      if (unListen1) {
        unListen1();
      }
      if (unListen2) {
        unListen2();
      }
    };
  }, []);

  const reload = useMemoizedFn(() => {
    window.location.reload();
  });

  const relaunchApp = useMemoizedFn(() => {
    if (!isWeb()) {
      relaunch().then();
    }
  });

  // 处理登录
  async function handleLogin(code: string) {
    if (!code) {
      return;
    }
    info(`App.tsx: login code ${code}`);
    await AppStore.saveLoginStatus(code);
    initAfterLogin().then();
  }

  const handleShare = useMemoizedFn(async (query: Record<string, string | number>) => {
    const { project_id } = query;
    if (appStore.openedProjects.some(item => item.id === project_id)) {
      // 如果当前项目是一个打开的项目
      const localProject = await NewFileManager.fetchLocalProject(project_id as string);
      await handleOpeningProject(localProject);
    } else {
      const localProject = await NewFileManager.fetchLocalProject(project_id as string);
      if (localProject) {
        await handleOpeningProject(localProject);
      } else {
        // 获取所有项目
        const projects = await NewFileManager.fetchProjects();
        // 打开这个项目
        const projectFromShare = projects.find(p => p.id === project_id);
        await handleOpeningProject(projectFromShare);
      }
    }
  });

  async function fetchOpenedProjects() {
    const openProjects = await fileManager.fetchOpenedProjects();
    appStore.setOpenedProjects(openProjects);
  }

  /**
   * 打开
   */
  async function openActiveProject() {
    const activeProject = await NewFileManager.fetchActiveProject();
    appStore.setActiveProject(activeProject);
  }

  async function init() {
    // 初始化数据库
    await DbStore.init();
    await AppStore.checkLoginStatus();
    await initAfterLogin();
  }

  async function initAfterLogin() {
    // 初始化快捷键
    HotkeysManager.init().then();
    // 获取模板列表
    appStore.fetchTemplates().then();
    // 初始化组件库
    await ComponentManager.init();
    // await fileManager.initAppData();
    fetchOpenedProjects().then();
    await openActiveProject();
    setShowUI(true);
  }

  // 打开一个项目
  async function handleOpeningProject(projectInfo: ProjectInfo) {
    try {
      // 将远端的项目信息同步到本地
      await NewFileManager.synchronizeLocalProject(projectInfo);
      fetchOpenedProjects().then();
      await openActiveProject();
    } catch (err) {
      console.error(err);
    }
  }

  function renderUpdateModal() {
    return <UpdateModal />;
  }

  function renderRoutes() {
    const tpl = routes.map(({ path, element, hotkeyScopes }) => {
      const Component = element;
      return (
        <Route
          key={path}
          path={path}
          element={
            <HotkeysProvider initiallyActiveScopes={hotkeyScopes}>
              <Component />
            </HotkeysProvider>
          }
        />
      );
    });
    return <Routes>{tpl}</Routes>;
  }

  function renderUI() {
    if (!showUI) {
      return <Loading />;
    }
    if (isWeb()) {
      return renderRoutes();
    }
    return (
      <>
        <RouteTabs />
        {renderRoutes()}
      </>
    );
  }

  useEffect(() => {
    emitter.on('errorMessage', (e: { content: string }) => {
      messageApi.error(e.content).then();
    });
  }, []);
  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorError: '#F85A54',
          colorErrorHover: 'rgba(248,90,84,1,0.75)',
          colorPrimary: '#1A4BFF',
          fontSize: 12
        },
        components: {
          Select: {
            // activeBorderColor: 'transparent',
            // activeOutlineColor: 'transparent',
            optionSelectedColor: '#1A4BFF',
            optionSelectedBg: '#4C6DE41A'
          }
        }
      }}
      button={{ autoInsertSpace: false }}
    >
      {contextHolder}
      <AntdApp>
        <AppStoreContext.Provider value={appStore}>
          <BrowserRouter basename={isWeb() ? '/voltron' : '/'}>{renderUI()}</BrowserRouter>
          {!isWeb() ? renderUpdateModal() : null}
        </AppStoreContext.Provider>
      </AntdApp>
    </ConfigProvider>
  );
});
