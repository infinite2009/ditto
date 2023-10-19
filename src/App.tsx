import { useEffect, useMemo, useState } from 'react';
import { Redirect, Route, Switch, useLocation } from 'wouter';
import Editor from '@/pages/editor';
import Home from '@/pages/home';
import Preview from '@/pages/preview';
import fileManager from '@/service/file';
import CustomTitleBar from '@/components/custom-title-bar';
import { ProjectInfo } from '@/types/app-data';

function App() {
  const [showUI, setShowUI] = useState<boolean>(false);
  const [openedProjects, setOpenedProjects] = useState<ProjectInfo[]>([]);
  const [currentProject, setCurrentProject] = useState<string>('');
  const [previewProjects, setPreviewProjects] = useState<string[]>([]);

  const [, setLocation] = useLocation();

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
      setLocation(`/edit/${currentProject}`);
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

  async function handleSelectingProject(projectId: string | null) {
    if (projectId === null) {
      setLocation('/home');
      return;
    }
    await fileManager.setCurrentProject(projectId);
    fetchAndOpenCurrentProject();
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

  return showUI ? (
    <div>
      <CustomTitleBar
        data={projectItems}
        selectedProjectId={currentProject}
        onSelect={handleSelectingProject}
        onClose={handleClosingProject}
      />
      <Switch>
        <Route path="/">
          <Redirect to="/home" />
        </Route>
        <Route path="/edit/:projectId">
          <Editor onPreview={handlePreviewProject} onPreviewClose={handlePreviewProjectClose} />
        </Route>
        <Route path="/home">
          <Home
            onOpenProject={handleOpeningProject}
            onDeleteProject={handleDeletingProject}
            onRenameProject={handleRenamingProject}
          />
        </Route>
        <Route path="/preview/:pageId">
          <Preview />
        </Route>
        <Route>404</Route>
      </Switch>
    </div>
  ) : null;
}

export default App;
