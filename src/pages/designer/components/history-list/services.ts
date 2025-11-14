import { postVoltronPageVersionList, PostVoltronPageVersionList } from '@/api';
import { useContext, useEffect } from 'react';
import { EditorStoreContext } from '@/hooks/context';
import { create } from 'zustand';
import { message, Modal } from 'antd';
import NewFileManager from '@/service/new-file-manager';
import usePageStore from '@/store/usePageStore';

interface HistoryListStore {
  /** 当前选中版本id */
  currentVersionId: string | null;
  /** 版本列表 */
  versionList: PostVoltronPageVersionList.PageVersionListItem[];
  /** 重置版本列表 */
  resetVersionList: (pageId: string) => Promise<void>;
  /** 设置当前选中版本id */
  setCurrentVersionId: (versionId: string, overrideDSL: (content: any) => void) => void;
  /** 获取当前选中版本 */
  getCurrentVersion: () => PostVoltronPageVersionList.PageVersionListItem | null;
  /** 删除版本 */
  deleteVersion: (versionId: string) => void;
}

export const useHistoryListStore = create<HistoryListStore>((set, get) => ({
  currentVersionId: null,
  versionList: [],
  resetVersionList: async (pageId: string) => {
    try {
      const list = await postVoltronPageVersionList({
        pageId
      });
      const versionList = list.data.pageVersionList.reverse();

      if (versionList.length > 0) {
        set({ currentVersionId: versionList[0].versionId });
      }

      set({ versionList });
    } catch (error) {
      console.error('error_in_rollback_dsl', error);
    }
  },
  setCurrentVersionId: (versionId: string, overrideDSL: (content: any) => void) => {
    Modal.confirm({
      title: '应用后，当前页面会替换为该版本的页面信息，请确认是否应用？',
      onOk: async () => {
        try {
          const targetVersion = get().versionList.find(item => item.versionId === versionId);

          const fileURL = await NewFileManager.fetchUrl(targetVersion.dslUrlBatchKey);
          const content = await NewFileManager.fetchDSL(fileURL);
          usePageStore.getState().setSkipAutoSave(true);
          overrideDSL(content);
          set({ currentVersionId: versionId });
          message.success(`已切换至版本: ${targetVersion.versionNumber}`);
        } catch (error) {
          console.error('error_in_rollback_dsl', error);
        }
      }
    });
  },
  getCurrentVersion: () => {
    const currentVersionId = get().currentVersionId;
    const versionList = get().versionList;
    const currentVersion = versionList.find(item => item.versionId === currentVersionId);
    return currentVersion;
  },
  deleteVersion: (versionId: string) => {
    message.info('敬请期待');
  }
}));

export function useHistoryList() {
  const editorStore = useContext(EditorStoreContext);
  useEffect(() => {
    if (!editorStore.selectedPageId) {
      return;
    }
    useHistoryListStore.getState().resetVersionList(editorStore.selectedPageId);
  }, [editorStore.selectedPageId]);

  return useHistoryListStore(state => state.versionList);
}
