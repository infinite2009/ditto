import { observer } from 'mobx-react';
import { useContext, useEffect, useMemo, useState } from 'react';
import Editor from '@/pages/editor';
import Home from '@/pages/home';
import fileManager from '@/service/file';
import CustomTitleBar from '@/components/custom-title-bar';
import { ProjectInfo } from '@/types/app-data';
import DSLStore from '@/service/dsl-store';
import { AppStoreContext, DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import EditorStore from '@/service/editor-store';
import { Scene } from '@/service/app-store';
import DbStore from '@/service/db-store';
import ComponentManager from '@/service/component-manager';
import { listen } from '@tauri-apps/api/event';
import { parseCustomProtocolUrl } from '@/util';
import { appWindow } from '@tauri-apps/api/window';

export default observer(function App() {
  const [showUI, setShowUI] = useState<boolean>(false);
  const [openedProjects, setOpenedProjects] = useState<ProjectInfo[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [previewProjectIds, setPreviewProjectIds] = useState<string[]>([]);
  const [editorDict, setEditorDict] = useState<
    Record<
      string,
      {
        dslStore: DSLStore;
        editorStore: EditorStore;
      }
    >
  >({});

  const appStore = useContext(AppStoreContext);

  useEffect(() => {
    init();
    let unlisten = null;
    listen<string>('scheme-request-received', event => {
      console.log(`Got error in window ${event.windowLabel}, payload: ${event.payload}`);
      if (event.payload) {
        const result = parseCustomProtocolUrl(event.payload);
        console.log('打开窗口');
        appWindow.show();
        switch (result.host) {
          case 'login':
            handleLogin(result.queryParameters?.code as string);
            break;
        }
      }
    }).then(callback => {
      unlisten = callback;
    });
    window.addEventListener('keyup', handleKeyEvent);
    return () => {
      if (unlisten) {
        unlisten();
      }
      window.removeEventListener('keyup', handleKeyEvent);
    };
  }, []);

  useEffect(() => {
    if (!currentProjectId && appStore.homeContextId) {
      appStore.activateSceneContext(appStore.homeContextId);
    } else if (!(currentProjectId in appStore.contextIdDictForProject)) {
      if (currentProjectId) {
        // 创建一个新的上下文
        appStore.setContextIdForProject(
          appStore.createContext(Scene.editor, {
            projectId: currentProjectId
          }),
          currentProjectId
        );
      }
    } else {
      appStore.activateSceneContext(appStore.getContextIdForProject(currentProjectId));
    }
  }, [currentProjectId]);

  // 处理登录
  function handleLogin(code: string) {
    debugger;
    appStore.saveLoginStatus(code);
  }

  function handleKeyEvent(e) {
    e.stopPropagation();
    e.preventDefault();
    // FIX: mac 系统上 alt + 字母键会导致 e.key 的值为希腊字母或其他符号
    appStore.execute(e.code.replace(/^Key/, ''), {
      alt: e.altKey,
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      meta: e.metaKey
    });
  }

  const projectItems = useMemo(() => {
    return openedProjects.map(item => {
      return {
        id: item.id,
        title: item.name,
        isPreview: previewProjectIds.some(id => item.id === id)
      };
    });
  }, [openedProjects, previewProjectIds]);

  async function fetchOpenedProjects() {
    const openProjects = await fileManager.fetchOpenedProjects();
    setOpenedProjects(openProjects);
  }

  async function fetchAndOpenCurrentProject() {
    const currentProject = await fileManager.fetchCurrentProjectId();
    setCurrentProjectId(currentProject);
    if (currentProject) {
      if (!(currentProject in editorDict)) {
        setEditorDict(
          Object.assign(
            { ...editorDict },
            { [currentProject]: { dslStore: new DSLStore(), editorStore: new EditorStore() } }
          )
        );
      }
    }
  }

  async function init() {
    // 初始化数据库
    await DbStore.init();
    await appStore.checkLoginStatus();
    // 初始化组件库
    await ComponentManager.init();
    // await fileManager.initAppData();
    fetchOpenedProjects();
    await fetchAndOpenCurrentProject();
    setShowUI(true);
  }

  function handlePreviewProject(projectId: string) {
    previewProjectIds.splice(0, 0, projectId);
    setPreviewProjectIds([...previewProjectIds]);
  }

  function handlePreviewProjectClose(projectId: string) {
    const index = previewProjectIds.indexOf(projectId);
    if (index > -1) {
      previewProjectIds.splice(index, 1);
      setPreviewProjectIds([...previewProjectIds]);
    }
  }

  async function handleSelectingProject(projectId: string) {
    await fileManager.setCurrentProject(projectId);
    if (!projectId) {
      setCurrentProjectId('');
      return;
    }
    await fetchAndOpenCurrentProject();
    setCurrentProjectId(projectId);
    // 激活上下文
    // appStore.activateSceneContext(appStore.getContextIdForProject(projectId));
    // console.log('当前上下文id： ', appStore.getContextIdForProject(projectId));
  }

  async function handleOpeningProject(projectId: string) {
    try {
      await Promise.all([fileManager.openProject(projectId), fileManager.setCurrentProject(projectId)]);
      fetchOpenedProjects();
      fetchAndOpenCurrentProject();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClosingProject(projectId: string) {
    await fileManager.closeProject(projectId);
    fetchAndOpenCurrentProject();
    fetchOpenedProjects();
  }

  function handleDeletingProject(projectId: string) {
    fetchOpenedProjects();
  }

  function handleRenamingProject(projectId: string) {
    fetchOpenedProjects();
  }

  function renderEditorTabs() {
    return Object.entries(editorDict).map(([key, value]) => {
      return key === currentProjectId ? (
        <DSLStoreContext.Provider key={key} value={value.dslStore}>
          <EditorStoreContext.Provider value={value.editorStore}>
            <Editor onPreview={handlePreviewProject} onPreviewClose={handlePreviewProjectClose} />
          </EditorStoreContext.Provider>
        </DSLStoreContext.Provider>
      ) : null;
    });
  }

  function renderHome() {
    if (currentProjectId) {
      return null;
    }
    return (
      <Home
        onOpenProject={handleOpeningProject}
        onDeleteProject={handleDeletingProject}
        onRenameProject={handleRenamingProject}
      />
    );
  }

  return showUI ? (
    <div>
      <AppStoreContext.Provider value={appStore}>
        <CustomTitleBar
          data={projectItems}
          selectedProjectId={currentProjectId}
          onSelect={handleSelectingProject}
          onClose={handleClosingProject}
        />
        {renderHome()}
        {renderEditorTabs()}
      </AppStoreContext.Provider>
    </div>
  ) : null;
});
