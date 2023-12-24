export default interface AppData {
  currentProject: number;
  pathToProjectDict: Record<string, Partial<ProjectInfo>>;
  // recentProjects: Record<string, ProjectInfo>;

  [key: string]: any;
}

export interface ProjectInfo {
  createdTime: number;
  id: string;
  isActive: boolean;
  isOpen: boolean;
  name: string;
  openedFile: string;
  path: string;
  updatedTime: number;
}
