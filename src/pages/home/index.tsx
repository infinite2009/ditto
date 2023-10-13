import { useLocation } from 'wouter';

import { FileFilled, PlusOutlined, SelectOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Dropdown, Input, InputRef, message, Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import fileManager from '@/service/file';
import { ProjectInfo } from '@/types/app-data';
import classNames from 'classnames';
import style from './index.module.less';

export default function Home() {
  const [, setLocation] = useLocation();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [temporaryProjectName, setTemporaryProjectName] = useState<string>('');

  const inputRef = useRef<InputRef>(null);
  const deleteFolder = useRef<boolean>(false);

  useEffect(() => {
    fetchRecentProjects();
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
    const res = await fileManager.fetchRecentProjects();
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

  function generateDropDownMenu(data: ProjectInfo) {
    return {
      items: [
        {
          key: '1',
          label: (
            <div className={style.dropDownItem} onClick={() => openProject(data)}>
              <span>打开</span>
              <span className={style.shortKey}>⌘ O</span>
            </div>
          )
        },
        {
          type: 'divider'
        },
        {
          key: '2',
          label: (
            <div className={style.dropDownItem} onClick={() => createCopy(data)}>
              <span>创建副本</span>
              <span className={style.shortKey}>⌘ P</span>
            </div>
          )
        },
        {
          key: '3',
          label: (
            <div className={style.dropDownItem} onClick={() => handleClickRenameBtn(data)}>
              <span>重命名</span>
              <span className={style.shortKey}>⌘ R</span>
            </div>
          )
        },
        {
          type: 'divider' as unknown as any
        },
        {
          key: '4',
          label: (
            <div className={style.dropDownItem} onClick={() => openProjectDeletingModal(data)}>
              <span>删除</span>
              <span className={style.shortKey}>⌘ D</span>
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
    openProject(data);
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
                    onInput={(e: any) => setTemporaryProjectName(e.target.value.trim())}
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

  function openProject(data: ProjectInfo) {
    setLocation(`/edit/${data.id}`);
  }

  /**
   * 创建项目副本
   */
  async function createCopy(data: ProjectInfo) {
    const projectCp = await fileManager.copyProject(data);
    if (!projectCp) {
      message.error('创建副本失败，请重试');
      return;
    }
    await fetchRecentProjects();
  }

  /**
   * 重命名项目，展示编辑名称的输入框
   * @param data
   */
  function handleClickRenameBtn(data: ProjectInfo) {
    setTemporaryProjectName(data.name);
    setIsEditing(true);
  }

  function openProjectDeletingModal(data: ProjectInfo) {
    Modal.confirm({
      title: `是否删除 ${selectedProject?.name}`,
      icon: null,
      content: (
        <div className={style.deleteProject}>
          <Checkbox onChange={e => (deleteFolder.current = e.target.checked)}>删除后文件将被移至系统废纸篓</Checkbox>
        </div>
      ),
      onOk() {
        return deleteProject(data);
      },
      okText: '删除',
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
    openProject(project);
  }

  /**
   * 打开本地的文件夹
   */
  async function openLocalProject() {
    const project = await fileManager.openProject();
    if (!project) {
      return;
    }
    openProject(project);
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
            </Button>
            <Button className={style.openBtn} onClick={openLocalProject}>
              <SelectOutlined />
              打开
            </Button>
          </div>
          <div className={style.right}>
            <PlusOutlined className={style.feedbackIcon} />
            <span className={style.feedbackTitle}>问题反馈</span>
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
