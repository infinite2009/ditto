export default interface AppData {
  currentProject: string;
  openedProjects: Record<string, OpenedProject>;
  recentProjects: Record<string, ProjectInfo>;
  pathToProjectDict: Record<string, ProjectInfo>;
  [key: string]: any;
}

export interface OpenedProject extends ProjectInfo {
  openedFile?: string;
}

export interface ProjectInfo {
  id: string;
  lastModified: number;
  name: string;
  path: string;
}
