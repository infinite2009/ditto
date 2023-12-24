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
    window.addEventListener('keyup', handleKeyEvent);
    return () => {
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

  function fetchOpenedProjects() {
    const openedProjectsDict = fileManager.fetchOpenedProjects();
    setOpenedProjects(Object.values(openedProjectsDict));
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
    if (!projectId) {
      setCurrentProjectId('');
      return;
    }
    await fileManager.setCurrentProject(projectId);
    fetchAndOpenCurrentProject();
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
      return (
        <DSLStoreContext.Provider key={key} value={value.dslStore}>
          <EditorStoreContext.Provider value={value.editorStore}>
            <Editor
              onPreview={handlePreviewProject}
              onPreviewClose={handlePreviewProjectClose}
              style={key === currentProjectId.toString() ? undefined : { display: 'none' }}
            />
          </EditorStoreContext.Provider>
        </DSLStoreContext.Provider>
      );
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
