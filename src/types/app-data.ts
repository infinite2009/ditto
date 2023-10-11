export default interface AppData {
  currentFile: string;
  currentProject: string;
  openedProjects: Record<string, ProjectInfo>;
  recentProjects: Record<string, ProjectInfo>;
  pathToProjectDict: Record<string, ProjectInfo>;
  [key: string]: any;
}

export interface ProjectInfo {
  id: string;
  lastModified: number;
  name: string;
  path: string;
}
