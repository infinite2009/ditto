import { DesignMode } from '@/service/editor-store';
import styles from '@/pages/designer/index.module.less';
import { useContext } from 'react';
import { EditorStoreContext } from '@/hooks/context';
import useProjectStore from '@/store/useProjectStore';
import { Button } from 'antd';
import { useHistoryListStore } from './services';
import dayjs from 'dayjs';

export function RollbackHeader() {
  const editorStore = useContext(EditorStoreContext);
  const projectStore = useProjectStore();
  const currentVersion = useHistoryListStore(state => state.getCurrentVersion());
  return (
    <div className={[styles.toolBarContainer, 'flex justify-between'].join(' ')}>
      <div className="flex gap-2 items-center">
        <div className="max-w-[320px] truncate text-[#18191C] text-xs/tight font-medium ">
          {projectStore?.currentProject?.name}
        </div>
        <div className="text-[#61666D] text-xs/tight font-normal">
          预览 {dayjs(currentVersion?.ctime).format('YYYY-MM-DD HH:mm')} 版本
        </div>
      </div>
      <Button
        type="primary"
        size="small"
        onClick={() => {
          editorStore.toDesignViewMode();
          editorStore.toggleMode(DesignMode.edit);
        }}
      >
        返回编辑
      </Button>
    </div>
  );
}
