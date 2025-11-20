import classNames from 'classnames';
import style from './index.module.less';
import { Close, Home } from '@/components/icon';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectInfo } from '@/types/app-data';
import ROUTE_NAMES from '@/enum';
import NewFileManager from '@/service/new-file-manager';
import { observer } from 'mobx-react';
import { AppStoreContext } from '@/hooks/context';
import fileManager from '@/service/file';
import { DesignMode } from '@/service/editor-store';

export default observer(function RouteTabs() {
  const appStore = useContext(AppStoreContext);
  const navigate = useNavigate();

  const selectedProjectId = appStore.activeProject?.id;
  const data = appStore.openedProjects;

  useEffect(() => {
    if (data?.length > 0) {
      return;
    }
    handleSelecting(null).then();
  }, [data]);

  /**
   * 打开
   */
  async function openActiveProject() {
    const activeProject = await NewFileManager.fetchActiveProject();
    appStore.setActiveProject(activeProject);
  }

  async function handleSelecting(project: ProjectInfo) {
    if (!project) {
      await NewFileManager.deactivateLocalProject(/**appStore.activeProject.id*/);
      appStore.setActiveProject(null);
      navigate(ROUTE_NAMES.PROJECT_MANAGEMENT);
    } else {
      // 将远端的项目信息同步到本地
      await NewFileManager.synchronizeLocalProject(project);
      await openActiveProject();
      // 切换预览页
      if (project?.id?.startsWith(DesignMode.preview)) {
        const realProjectId = project?.id?.match(/preview_(.+)/)?.[1];
        if (realProjectId) {
          navigate(`${ROUTE_NAMES.PAGE_PREVIEW}?projectId=${realProjectId}`);
        }
      } else {
        // 编辑页
        navigate(`${ROUTE_NAMES.PAGE_EDIT}?projectId=${project.id}`);
      }
    }
  }

  function handleClickHome() {
    handleSelecting(null).then();
  }

  const homeClass = classNames({
    [style.home]: true,
    [style.selected]: !selectedProjectId,
    [style.unselected]: !!selectedProjectId
  });

  async function handleCloseProject(e: any, project: ProjectInfo) {
    e.stopPropagation();
    // TODO: 关闭项目时现在无法自动保存了
    // if (dslStore.shouldSave) {
    //   console.log('自动保存中');
    //   await NewFileManager.savePageDSLFile(editorStore.selectedPageId, dslStore.dsl);
    // }
    await NewFileManager.closeProject(project.id);

    if (data?.length) {
      const l = data.length;
      // 如果右侧有打开的项目，选择右边第一个，如果没有，选择左侧最后一个
      const index = data.findIndex(item => project.id === item.id);
      if (index > -1) {
        let nextSelected;
        if (index < l - 1) {
          nextSelected = data[index + 1];
        } else if (index > 0) {
          nextSelected = data[index - 1];
        } else {
          nextSelected = null;
        }
        if (nextSelected === null) {
          return;
        }
        handleSelecting(nextSelected).then();
      }
    }
  }

  function handleClickTab(item: ProjectInfo) {
    handleSelecting(item);
  }

  function renderTitle() {
    return data?.map(item => {
      const titleWrapperClass = classNames({
        [style.titleWrapper]: true,
        [style.selected]: item.id === selectedProjectId,
        [style.unselected]: item.id !== selectedProjectId
      });
      return (
        <div key={item.id} className={titleWrapperClass}>
          <div className={style.left} onClick={() => handleClickTab(item)}>
            {/*{item.isPreview ? <VideoCameraOutlined className={style.previewIcon} /> : null}*/}
            {item.name}
          </div>
          <Close onClick={(e: any) => handleCloseProject(e, item)} />
        </div>
      );
    });
  }

  return (
    <div data-tauri-drag-region={true} className={style.routeTabs}>
      <div className={homeClass} onClick={handleClickHome}>
        <Home className={style.homeIcon} />
      </div>
      {renderTitle()}
    </div>
  );
});
