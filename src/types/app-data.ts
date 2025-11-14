import { PostVoltronPageList, PostVoltronProjectList } from "@/api";

export default interface AppData {
  currentProject: number;
  pathToProjectDict: Record<string, Partial<ProjectInfo>>;
  // recentProjects: Record<string, ProjectInfo>;

  [key: string]: any;
}

export type ProjectInfo = PostVoltronProjectList.ResItem & {
  isActive?: boolean;
  isOpen?: boolean;
  openedPage?: string;
};

export type PageInfo = PostVoltronPageList.ResItem & {
  id: string;
};