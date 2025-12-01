import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { AppStoreContext } from '@/hooks/context';
import AppStore, { Scene } from '@/service/app-store';
import ComponentManager from '@/service/component-manager';
import NewFileManager from '@/service/new-file-manager';
import { useMemoizedFn } from 'ahooks';
import { App as AntdApp, ConfigProvider, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Loading from '@/components/loading';
import routes from '@/routes';
import { emitter } from './api';
import HotkeysManager from '@/service/hotkeys-manager';
import { HotkeysProvider } from 'react-hotkeys-hook';

const App = function () {
  const [showUI, setShowUI] = useState<boolean>(false);

  const [appStore] = useState<AppStore>(new AppStore());

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // 监听应用关闭
    init().finally(() => {
        appStore.registerHandlers(Scene.system, { reload });
    });

  }, []);

  const reload = useMemoizedFn(() => {
    window.location.reload();
  });

  /**
   * 打开
   */
  async function openActiveProject() {
    const activeProject = await NewFileManager.fetchActiveProject();
    appStore.setActiveProject(activeProject);
  }

  async function init() {
    // 初始化数据库
    await initAfterLogin();
  }

  async function initAfterLogin() {
    // 初始化快捷键
    HotkeysManager.init().then();
    // 获取模板列表
    appStore.fetchTemplates().then();
    // 初始化组件库
    await ComponentManager.init();
    await openActiveProject();
    setShowUI(true);
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
      return renderRoutes();
  }

  useEffect(() => {
    emitter.emit('errorMessage', (e: { content: string }) => {
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
          <BrowserRouter basename="/ditto">{renderUI()}</BrowserRouter>
        </AppStoreContext.Provider>
      </AntdApp>
    </ConfigProvider>
  );
};

App.displayName = 'App';

const Index = observer(App);

export default Index;
