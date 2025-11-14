import { observer } from 'mobx-react';

import styles from './index.module.less';
import PageList from '@/pages/designer/components/page-list';
import ComponentStructure from '@/pages/designer/components/component-structure';
import { useCallback, useContext, useRef } from 'react';
import NewFileManager from '@/service/new-file-manager';
import { toJS } from 'mobx';
import { AppStoreContext, DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { useSearchParams } from 'react-router-dom';

function LeftPanel() {
  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);
  const appStore = useContext(AppStoreContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const isSavingRef = useRef<boolean>(false);

  const handleSelectingPage = useCallback((pageId: string) => {
    // 如果该值为真，标明当前 dsl 还没有等到下一次 reaction，需要强制保存，但是这个操作是有文献性的
    if (dslStore.shouldSave && !isSavingRef.current) {
      // 上锁，防止页面保存中，用户快速切换页面，
      isSavingRef.current = true;
      // 这里用上一个页面的 id
      NewFileManager.savePageDSLFile(editorStore.selectedPageId, toJS(dslStore.dsl))
        .then(() => {
          dslStore.setShouldSave(false);
        })
        .finally(() => {
          isSavingRef.current = false;
        });
    }
    const openedProjectId = searchParams.get('projectId');
    editorStore.setSelectedPageId(openedProjectId, pageId);
  }, []);

  const handleExportTemplate = useCallback(() => {
    fetchTemplateData().then();
  }, []);

  async function fetchTemplateData() {
    await appStore.fetchTemplates();
  }

  return (
    <div className={styles.leftPanel}>
      <PageList onExportTemplate={handleExportTemplate} onSelect={handleSelectingPage} />
      <div className={styles.componentStructureWrapper}>
        <ComponentStructure />
      </div>
    </div>
  );
}

LeftPanel.displayName = 'LeftPanel';

export default observer(LeftPanel);
