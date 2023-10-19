export default interface AppData {
  currentProject: string;
  recentProjects: Record<string, ProjectInfo>;
  pathToProjectDict: Record<string, ProjectInfo>;
  [key: string]: any;
}

export interface ProjectInfo {
  id: string;
  lastModified: number;
  name: string;
  path: string;
  openedFile: string;
  isOpen: boolean;
}
