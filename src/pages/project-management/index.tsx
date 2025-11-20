import { CloseOutlined } from '@ant-design/icons';
import { Dropdown, Input, InputRef, message, Modal } from 'antd';
import { MouseEvent, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ProjectInfo } from '@/types/app-data';
import classNames from 'classnames';
import { AppStoreContext } from '@/hooks/context';
import { Scene } from '@/service/app-store';
import style from './index.module.less';
import { CloseThin, Feedback, More, Ok, Order } from '@/components/icon';
import NewFileManager from '@/service/new-file-manager';
import { isWeb, relativeTimeFormat } from '@/util';
import { Link, useNavigate } from 'react-router-dom';
import ROUTE_NAMES from '@/enum';
import debounce from 'lodash/debounce';
import { CreateProjectModal } from './components/CreateProjectModal';
import CreateProjectMainBtn from '@/assets/create_project_main_btn.png';
import { NewProjectFormData } from './components/new-project-modal';
import { isDeveloperList } from './isDeveloperList';
import { PageLayout } from '@/components/PageLayout';

export default function ProjectManagement() {
  const [recentProjects, setRecentProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [temporaryProjectName, setTemporaryProjectName] = useState<string>('');
  const [isProjectCreatingOpen, setIsProjectCreatingOpen] = useState<boolean>(false);

  const inputRef = useRef<InputRef>(null);
  const selectedProjectInfoRef = useRef<ProjectInfo>(null);

  const appStore = useContext(AppStoreContext);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentProjects().then();
  }, []);

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
    const projects = await NewFileManager.fetchProjects();
    setRecentProjects(projects);
  }

  async function changeText(e: any) {
    e.stopPropagation();
    if (!selectedProject) {
      return;
    }
    if (!temporaryProjectName) {
      message.error('名字不可为空');
      return;
    }
    if (selectedProject.name.trim() === temporaryProjectName) {
      setIsEditing(false);
      return;
    }
    try {
      await NewFileManager.renameProject(selectedProject, temporaryProjectName);
      await fetchRecentProjects();
    } catch (err: any) {
      message.error(err.toString());
    } finally {
      setIsEditing(false);
    }
  }

  function cancelChangingText(e) {
    setIsEditing(false);
    e.stopPropagation();
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

  async function toggleProjectOpenness() {
    if (selectedProjectInfoRef.current) {
      const projectInfo = selectedProjectInfoRef.current;
      await NewFileManager.toggleProjectOpenness(projectInfo.id, projectInfo.isPublic ? 0 : 1);
      fetchRecentProjects();
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
                {appStore.generateShortKeyDisplayName(Scene.projectMenu, 'openProject')}
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
                {appStore.generateShortKeyDisplayName(Scene.projectMenu, 'rename')}
              </span>
            </div>
          )
        },
        {
          type: 'divider' as unknown as any
        },
        {
          key: '6',
          label: (
            <div className={style.dropDownItem} onClick={toggleProjectOpenness}>
              <span>设为{selectedProject?.isPublic ? '私有' : '公开'}</span>
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
                {appStore.generateShortKeyDisplayName(Scene.projectMenu, 'remove')}
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
    openProject().then();
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
            menu={generateDropDownMenu()}
            overlayClassName={style.dropdownContainer}
            destroyOnHidden
            onOpenChange={(open: boolean, info) => onOpenChange(open, project, info)}
            trigger={['contextMenu']}
          >
            <div className={wrapperClassName} onClick={e => handleClickWrapper(e, project)}>
              <div className={style.projectName}>
                <div className={style.file} />
                {selectedProject?.id === project.id && isEditing ? (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Input
                      maxLength={30}
                      className={style.renamingInput}
                      ref={inputRef}
                      value={temporaryProjectName}
                      onInput={(e: any) => setTemporaryProjectName(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      onPressEnter={changeText}
                    />
                    <div className={style.renamingBtnWrapper}>
                      <Ok className={style.okIcon} onClick={changeText} />
                      <CloseThin className={style.icon} onClick={cancelChangingText} />
                    </div>
                  </div>
                ) : (
                  <span>{project.name} </span>
                )}
              </div>
              <span className={style.editTime}>{relativeTimeFormat(project.mtime)}</span>
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
    await handleOpeningProject(selectedProjectInfoRef.current);
  }

  // 打开一个项目
  async function handleOpeningProject(projectInfo: ProjectInfo) {
    try {
      const url = `${ROUTE_NAMES.PAGE_EDIT}?projectId=${projectInfo.id}`;
      window.open(`/voltron${url}`);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * 重命名项目，展示编辑名称的输入框
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
        </div>
      ),
      icon: null,
      content: (
        <div className={style.deleteProject}>
          <p className={style.deleteLateral}>确认要删除 “{selectedProjectInfoRef.current.name}” 吗？</p>
        </div>
      ),
      onOk() {
        return deleteProject();
      },
      okText: '确认删除',
      okButtonProps: { color: 'danger', danger: true, style: { borderRadius: 8 } },
      closeIcon: <CloseOutlined className={style.modalCloseIcon} />,
      closable: true,
      cancelText: '取消',
      focusTriggerAfterClose: false,
      autoFocusButton: null
    });
  }

  /**
   * 弹出删除项目
   */
  async function deleteProject() {
    const data = selectedProjectInfoRef.current;
    try {
      await NewFileManager.deleteProject(data);
      await Promise.all([fetchRecentProjects()]);
      return Promise.resolve(data);
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  }

  function onOpenChange(open: boolean, data: ProjectInfo, info: { source: string }) {
    if (open) {
      setSelectedProject(data);
      selectedProjectInfoRef.current = data;
    } else {
      // 防止点击菜单项意外的地方关闭菜单以后，快捷键依旧生效
      if (info.source === 'trigger') {
        selectedProjectInfoRef.current = null;
      }
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
        <Dropdown menu={generateDropDownMenu()} overlayClassName={style.dropdownContainer} destroyOnHidden>
          <div
            id="dropdownBtn"
            className={style.dropDownBtn}
            onContextMenu={(e: any) => {
              e.stopPropagation();
              e.preventDefault();
              e.target.click();
            }}
          >
            <More className={style.icon} />
          </div>
        </Dropdown>
      </div>
    );
  }

  const createProject = debounce(async (createProjectPayload: NewProjectFormData) => {
    if (!createProjectPayload.name) {
      message.error('请输入项目名称');
      return;
    }
    try {
      selectedProjectInfoRef.current = await NewFileManager.createProject(createProjectPayload);
      await fetchRecentProjects();
      await NewFileManager.createPage(selectedProjectInfoRef.current.id);
      await openProject();
      closeOpenProjectCreatingModal();
    } catch (err) {
      console.error('error_in_create_project', err);
      message.error(err?.data?.message || err.toString());
    }
  }, 250);

  const handleClickWhiteSpace = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement)?.id === 'wrapper' || (e.target as HTMLElement)?.id === 'main') {
      setSelectedProject(null);
    }
  }, []);

  function openProjectCreatingModal() {
    setIsProjectCreatingOpen(true);
  }

  function closeOpenProjectCreatingModal() {
    setIsProjectCreatingOpen(false);
  }

  return (
    <PageLayout onClick={handleClickWhiteSpace}>
      <div id="main" className={style.main}>
        <div className={style.btnWrapper}>
          <div className={style.left}>
            <img
              className="cursor-pointer"
              src={CreateProjectMainBtn}
              alt="新建"
              width={150}
              onClick={openProjectCreatingModal}
            />
          </div>
          <div className={style.right}>
            <a
              className={style.iconBtn}
              href="https://doc.weixin.qq.com/smartsheet/form/1_wp1hBoEQAAXdlT7CSef8MGfqzK-Af_AQ_49fc95"
              target="_blank"
              rel="noreferrer"
            >
              <Feedback style={{ fontSize: 16 }} />
              <span>问题反馈</span>
            </a>
            {isDeveloperList() && (
              <Link to={ROUTE_NAMES.ADMIN} className={style.iconBtn} target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6.75006 1.47752C7.52356 1.03093 8.47656 1.03093 9.25006 1.47752L13.0236 3.65615C13.7971 4.10273 14.2736 4.92805 14.2736 5.82121V10.1785C14.2736 11.0716 13.7971 11.8969 13.0236 12.3435L9.25006 14.5222C8.47656 14.9687 7.52356 14.9687 6.75006 14.5222L2.97656 12.3435C2.20306 11.8969 1.72656 11.0716 1.72656 10.1785V5.82121C1.72656 4.92805 2.20306 4.10273 2.97656 3.65615L6.75006 1.47752ZM8.75006 2.34354C8.28596 2.07559 7.71416 2.07559 7.25006 2.34354L3.47656 4.52218C3.01246 4.79012 2.72656 5.28532 2.72656 5.82121V10.1785C2.72656 10.7144 3.01246 11.2095 3.47656 11.4775L7.25006 13.6562C7.71416 13.9241 8.28596 13.9241 8.75006 13.6562L12.5236 11.4775C12.9877 11.2095 13.2736 10.7144 13.2736 10.1785V5.82121C13.2736 5.28532 12.9877 4.79012 12.5236 4.52218L8.75006 2.34354Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8 6.5C7.1716 6.5 6.5 7.1716 6.5 8C6.5 8.8284 7.1716 9.5 8 9.5C8.8284 9.5 9.5 8.8284 9.5 8C9.5 7.1716 8.8284 6.5 8 6.5ZM5.5 8C5.5 6.61929 6.61929 5.5 8 5.5C9.3807 5.5 10.5 6.61929 10.5 8C10.5 9.3807 9.3807 10.5 8 10.5C6.61929 10.5 5.5 9.3807 5.5 8Z"
                    fill="currentColor"
                  />
                </svg>
                <span>开发者配置</span>
              </Link>
            )}
          </div>
        </div>
        <h3 className={style.title}>最近项目</h3>
        <div>
          <div className={style.listHeader}>
            <span className={style.projectNameCol}>项目名</span>
            <div className={style.recentEdit} onClick={() => message.warning('暂不支持排序')}>
              <span>最近编辑</span>
              <Order className={style.orderIcon} />
            </div>
          </div>
          <ul className={style.projectListBody}>{renderRecentProjects()}</ul>
        </div>
      </div>
      {isProjectCreatingOpen && <CreateProjectModal onOk={createProject} onCancel={closeOpenProjectCreatingModal} />}
    </PageLayout>
  );
}
