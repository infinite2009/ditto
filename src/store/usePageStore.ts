import { PostVoltronPageList } from "@/api";
import { create } from "zustand";

type Page = PostVoltronPageList.ResItem;

type Store = {
  pageList: Page[];
  currentPageId: string;
  currentPage: Page;
  setCurrentPageId: (id: string) => void;
  setPageList: (list: Page[]) => void;
  // 是否跳过自动保存
  skipAutoSave: boolean;
  setSkipAutoSave: (skip: boolean) => void;
};

const usePageStore = create<Store>((set, get) => ({
  pageList: [],
  currentPageId: '',
  currentPage: () => {
    const { pageList, currentPageId } = get();
    return pageList.find(i => i.pageId === currentPageId);
  },
  setPageList: (pageList) => set(() => ({ pageList })),
  setCurrentPageId: (currentPageId) => set(() => ({ currentPageId })),
  skipAutoSave: false,
  setSkipAutoSave: (skipAutoSave) => set(() => ({ skipAutoSave })),
}));

export default usePageStore;