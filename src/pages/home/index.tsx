import { CloseOutlined, FileFilled, PlusOutlined, SelectOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Button, Dropdown, Input, InputRef, message, Modal } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import fileManager from '@/service/file';
import { ProjectInfo } from '@/types/app-data';
import classNames from 'classnames';
import { AppStoreContext } from '@/hooks/context';
import { Scene } from '@/service/app-store';
import style from './index.module.less';

export interface IHomeProps {
  onDeleteProject: (projectId: string) => void;
  onOpenProject: (projectId: string) => void;
  onRenameProject: (projectId: string) => void;
}

export default function Home({ onOpenProject, onDeleteProject, onRenameProject }: IHomeProps) {
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [temporaryProjectName, setTemporaryProjectName] = useState<string>('');

  const inputRef = useRef<InputRef>(null);
  const deleteFolder = useRef<boolean>(true);
  const selectedProjectInfoRef = useRef<ProjectInfo>(null);

  const appStore = useContext(AppStoreContext);

  useEffect(() => {
    // 创建上下文
    appStore.createHomeContext(
      Scene.projectManagement,
      {
        isHome: true
      },
      {
        createProject,
        openLocalProject,
        openProject,
        openInFinder,
        createCopy,
        rename: handleClickRenameBtn,
        remove: openProjectDeletingModal
      }
    );
    fetchRecentProjects();
  }, []);

  useEffect(() => {
    appStore.registerHandlers(appStore.homeContextId, {
      createProject,
      openLocalProject,
      openProject,
      openInFinder,
      createCopy,
      rename: handleClickRenameBtn,
      remove: openProjectDeletingModal
    });
  }, [
    createProject,
    openLocalProject,
    openProject,
    openInFinder,
    createCopy,
    handleClickRenameBtn,
    openProjectDeletingModal
  ]);

  useEffect(() => {
    if (isEditing && selectedProject) {
      inputRef.current?.focus({
        cursor: 'all'
      });
    }
  }, [isEditing]);

  useEffect(() => {
    if (selectedProject === null) {
      setIsEditing(false);
    }
  }, [selectedProject]);

  async function fetchRecentProjects() {
    const res = await fileManager.fetchProjects();
    setRecentProjects(res);
  }

  async function changeText(e: any) {
    if (!selectedProject) {
      return;
    }
    if (selectedProject.name.trim() === e.target.value.trim()) {
      setIsEditing(false);
      return;
    }
    try {
      await fileManager.renameProject(selectedProject, e.target.value.trim());
      if (onRenameProject) {
        onRenameProject(selectedProject.id);
      }
      await fetchRecentProjects();
    } catch (err: any) {
      message.error(err.toString());
    } finally {
      setIsEditing(false);
    }
  }

  function handleClickDropdownMenu({ key }: { key: string }) {
    switch (key) {
      case '1':
        break;
      case '2':
        break;
      case '3':
        break;
    }
  }

  function generateDropDownMenu() {
    return {
      items: [
        {
          key: '1',
          label: (
            <div className={style.dropDownItem} onClick={openProject}>
              <span>打开</span>
              <span className={style.menuShortKey}>
                {appStore.generateShortKeyDisplayName(Scene.projectManagement, 'openProject')}
              </span>
            </div>
          )
        },
        {
          key: '2',
          label: (
            <div className={style.dropDownItem} onClick={openInFinder}>
              <span>打开文件所在位置</span>
              <span className={style.menuShortKey}>
                {appStore.generateShortKeyDisplayName(Scene.projectManagement, 'openInFinder')}
              </span>
            </div>
          )
        },
        {
          type: 'divider'
        },
        {
          key: '3',
          label: (
            <div className={style.dropDownItem} onClick={createCopy}>
              <span>创建副本</span>
              <span className={style.menuShortKey}>
                {appStore.generateShortKeyDisplayName(Scene.projectManagement, 'createCopy')}
              </span>
            </div>
          )
        },
        {
          key: '4',
          label: (
            <div className={style.dropDownItem} onClick={handleClickRenameBtn}>
              <span>重命名</span>
              <span className={style.menuShortKey}>
                {appStore.generateShortKeyDisplayName(Scene.projectManagement, 'rename')}
              </span>
            </div>
          )
        },
        {
          type: 'divider' as unknown as any
        },
        {
          key: '5',
          label: (
            <div className={style.dropDownItem} onClick={openProjectDeletingModal}>
              <span>删除</span>
              <span className={style.menuShortKey}>
                {appStore.generateShortKeyDisplayName(Scene.projectManagement, 'remove')}
              </span>
            </div>
          )
        }
      ],
      onClick: handleClickDropdownMenu
    };
  }

  function handleClickWrapper(e: any, data: ProjectInfo) {
    // 如果是 dropdown 按钮触发的，则忽略
    if (e.target.id === 'dropdownBtn') {
      return;
    }
    selectedProjectInfoRef.current = data;
    openProject();
  }

  function renderRecentProjects() {
    return recentProjects.map(project => {
      const wrapperClassName = classNames({
        [style.project]: true,
        [style.selected]: selectedProject?.id === project.id
      });
      return (
        <li key={project.id}>
          <Dropdown
            menu={generateDropDownMenu(project)}
            overlayClassName={style.dropdownContainer}
            destroyPopupOnHide
            onOpenChange={(open: boolean) => onOpenChange(open, project)}
            trigger={['contextMenu']}
          >
            <div className={wrapperClassName} onClick={e => handleClickWrapper(e, project)}>
              <div className={style.projectName}>
                <FileFilled className={style.projectIcon} />
                {selectedProject?.id === project.id && isEditing ? (
                  <Input
                    ref={inputRef}
                    value={temporaryProjectName}
                    onInput={(e: any) => setTemporaryProjectName(e.target.value)}
                    onClick={e => e.stopPropagation()}
                    onPressEnter={changeText}
                    onBlur={changeText}
                  />
                ) : (
                  <span>{project.name}</span>
                )}
              </div>
              <span className={style.editTime}>12分钟前</span>
              <div className={style.action}>{renderActionComponent(project)}</div>
            </div>
          </Dropdown>
        </li>
      );
    });
  }

  async function openProject() {
    if (!selectedProjectInfoRef.current) {
      return;
    }
    if (onOpenProject) {
      onOpenProject(selectedProjectInfoRef.current.id);
    }
  }

  /**
   * 打开文件所在位置
   */
  async function openInFinder() {
    if (!selectedProjectInfoRef.current) {
      return;
    }
    try {
      await fileManager.openLocalFileDirectory(selectedProjectInfoRef.current);
    } catch (error) {
      message.error(error as string);
    }
  }

  /**
   * 创建项目副本
   */
  async function createCopy() {
    if (!selectedProjectInfoRef.current) {
      return;
    }
    await fileManager.copyProject(selectedProjectInfoRef.current);
    await fetchRecentProjects();
  }

  /**
   * 重命名项目，展示编辑名称的输入框
   * @param data
   */
  function handleClickRenameBtn() {
    if (!selectedProjectInfoRef.current) {
      return;
    }
    setTemporaryProjectName(selectedProjectInfoRef.current.name);
    setIsEditing(true);
  }

  function openProjectDeletingModal() {
    if (!selectedProjectInfoRef.current) {
      return;
    }
    Modal.confirm({
      title: (
        <div className={style.modalTitleWrapper}>
          <h3 className={style.modalTitle}>删除项目</h3>
          <CloseOutlined className={style.modalCloseIcon} />
        </div>
      ),
      icon: null,
      content: (
        <div className={style.deleteProject}>
          <p className={style.deleteLateral}>
            确认要删除 “{selectedProjectInfoRef.current.name}” 吗？删除后文件将被移至系统废纸篓
          </p>
          {/*<Checkbox onChange={e => (deleteFolder.current = e.target.checked)}>*/}
          {/*</Checkbox>*/}
        </div>
      ),
      onOk() {
        return deleteProject(selectedProjectInfoRef.current);
      },
      okText: '确认删除',
      okButtonProps: { style: { borderRadius: 8, backgroundColor: '#F85A54' } },
      cancelText: '取消',
      cancelButtonProps: {},
      focusTriggerAfterClose: false,
      autoFocusButton: null
    });
  }

  /**
   * 弹出删除项目
   * @param data
   */
  async function deleteProject(data: ProjectInfo) {
    try {
      await fileManager.deleteProject(data, deleteFolder.current);
      Modal.info({
        icon: null,
        title: '已删除',
        content: '请重新'
      });
      if (onDeleteProject) {
        onDeleteProject(data.id);
      }
      await fetchRecentProjects();
      return Promise.resolve(data);
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  }

  function onOpenChange(open: boolean, data: ProjectInfo) {
    if (open) {
      setSelectedProject(data);
      selectedProjectInfoRef.current = data;
    } else {
      // 防止菜单关闭以后，快捷键依旧生效
      selectedProjectInfoRef.current = null;
    }
  }

  function renderActionComponent(data: ProjectInfo) {
    return (
      <div
        onClick={(e: any) => {
          if (e.target.id !== 'dropdownBtn') {
            e.stopPropagation();
          }
        }}
        onContextMenu={e => e.stopPropagation()}
      >
        <Dropdown
          menu={generateDropDownMenu(data)}
          overlayClassName={style.dropdownContainer}
          destroyPopupOnHide
          onOpenChange={(open: boolean) => onOpenChange(open, data)}
          trigger={['click']}
        >
          <div
            id="dropdownBtn"
            className={style.dropDownBtn}
            onContextMenu={(e: any) => {
              e.stopPropagation();
              e.preventDefault();
              e.target.click();
            }}
          >
            ...
          </div>
        </Dropdown>
      </div>
    );
  }

  async function createProject() {
    const project = await fileManager.createProject();
    if (!project) {
      message.error('项目创建失败，请重试');
      return;
    }
    selectedProjectInfoRef.current = project;
    openProject();
  }

  /**
   * 打开本地的文件夹
   */
  async function openLocalProject() {
    const project = await fileManager.openLocalProject();
    if (!project) {
      return;
    }
    selectedProjectInfoRef.current = project;
    openProject();
  }

  function handleClickWhiteSpace(e: any) {
    if (e.target?.id === 'wrapper' || e.target?.id === 'main') {
      setSelectedProject(null);
    }
  }

  return (
    <div id="wrapper" onClick={handleClickWhiteSpace}>
      <div id="main" className={style.main}>
        <div className={style.btnWrapper}>
          <div className={style.left}>
            <Button className={style.newBtn} type="primary" onClick={createProject}>
              <PlusOutlined className={style.btnIcon} />
              新建
              <span className={style.shortKey}>
                {appStore.generateShortKeyDisplayName(Scene.projectManagement, 'createProject')}
              </span>
            </Button>
            <Button className={style.openBtn} onClick={openLocalProject}>
              <SelectOutlined />
              打开
              <span className={style.shortKey} style={{ color: '#0958d9' }}>
                {appStore.generateShortKeyDisplayName(Scene.projectManagement, 'openLocalProject')}
              </span>
            </Button>
          </div>
        </div>
        <h3 className={style.title}>最近项目</h3>
        <div className={style.projectList}>
          <div className={style.listHeader}>
            <span className={style.projectNameCol}>项目名</span>
            <div className={style.recentEdit}>
              <span>最近编辑</span>
              <SortAscendingOutlined />
            </div>
          </div>
          <ul className={style.projectListBody}>{renderRecentProjects()}</ul>
        </div>
      </div>
    </div>
  );
}
