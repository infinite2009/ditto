import { useEffect, useMemo, useState } from 'react';
import Editor from '@/pages/editor';
import Home from '@/pages/home';
import fileManager from '@/service/file';
import CustomTitleBar from '@/components/custom-title-bar';
import { ProjectInfo } from '@/types/app-data';
import DSLStore from '@/service/dsl-store';
import { DSLStoreContext } from '@/hooks/context';

function App() {
  const [showUI, setShowUI] = useState<boolean>(false);
  const [openedProjects, setOpenedProjects] = useState<ProjectInfo[]>([]);
  const [currentProject, setCurrentProject] = useState<string>('');
  const [previewProjects, setPreviewProjects] = useState<string[]>([]);
  const [editorDict, setEditorDict] = useState<Record<string, any>>({});

  useEffect(() => {
    init();
  }, []);

  const projectItems = useMemo(() => {
    return openedProjects.map(item => {
      return {
        id: item.id,
        title: item.name,
        isPreview: previewProjects.some(id => item.id === id)
      };
    });
  }, [openedProjects, previewProjects]);

  function fetchOpenedProjects() {
    const openedProjectsDict = fileManager.fetchOpenedProjects();
    setOpenedProjects(Object.values(openedProjectsDict));
  }

  function fetchAndOpenCurrentProject() {
    const currentProject = fileManager.fetchCurrentProjectId();
    setCurrentProject(currentProject);
    if (currentProject) {
      if (!(currentProject in editorDict)) {
        setEditorDict(Object.assign({ ...editorDict }, { [currentProject]: new DSLStore() }));
      }
    }
  }

  async function init() {
    await fileManager.initAppData();
    fetchOpenedProjects();
    fetchAndOpenCurrentProject();
    setShowUI(true);
  }

  function handlePreviewProject(projectId: string) {
    previewProjects.splice(0, 0, projectId);
    setPreviewProjects([...previewProjects]);
  }

  function handlePreviewProjectClose(projectId: string) {
    const index = previewProjects.indexOf(projectId);
    if (index > -1) {
      previewProjects.splice(index, 1);
      setPreviewProjects([...previewProjects]);
    }
  }

  async function handleSelectingProject(projectId: string) {
    if (!projectId) {
      setCurrentProject('');
      return;
    }
    await fileManager.setCurrentProject(projectId);
    fetchAndOpenCurrentProject();
    setCurrentProject(projectId);
  }

  async function handleOpeningProject(projectId: string) {
    await Promise.all([fileManager.openProject(projectId), fileManager.setCurrentProject(projectId)]);
    fetchOpenedProjects();
    fetchAndOpenCurrentProject();
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
        <DSLStoreContext.Provider key={key} value={value}>
          <Editor
            onPreview={handlePreviewProject}
            onPreviewClose={handlePreviewProjectClose}
            style={key === currentProject ? undefined : { display: 'none' }}
          />
        </DSLStoreContext.Provider>
      );
    });
  }

  function renderHome() {
    if (currentProject) {
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
      <CustomTitleBar
        data={projectItems}
        selectedProjectId={currentProject}
        onSelect={handleSelectingProject}
        onClose={handleClosingProject}
      />
      {renderHome()}
      {renderEditorTabs()}
    </div>
  ) : null;
}

export default App;
