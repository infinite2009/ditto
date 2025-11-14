import { GetVoltronProjectDetail } from "@/api";
import { create } from "zustand";

type Project = GetVoltronProjectDetail.Res;

type Store = {
  currentProject: Project;
  projectList: Project[];
  setCurrentProject: (project: Project) => void;
  setProjectList: (projectList: Project[]) => void;
};

const useProjectStore = create<Store>((set) => ({
  projectList: [],
  currentProject: {} as Project,
  setCurrentProject: (currentProject) => set(() => ({ currentProject })),
  setProjectList: (projectList) => set(() => ({ projectList })),
}));

export default useProjectStore;