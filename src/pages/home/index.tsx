import { useLocation } from 'wouter';

import style from './index.module.less';
import { FileFilled, PlusOutlined, SelectOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Button, Divider, Dropdown } from 'antd';
import { useEffect, useState } from 'react';
import { fetchRecentProjects } from '@/service/file';
import { ProjectInfo } from '@/types/app-data';

export default function Home() {
  const [, setLocation] = useLocation();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentProjects().then(res => {
      setRecentProjects([
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        }
      ]);
    });
  }, []);

  function renderRecentProjects() {
    return recentProjects.map(project => {
      return (
        <li key={project.id}>
          <Dropdown
            className={style.dropDownOverlay}
            dropdownRender={() => dropdownRender(project)}
            trigger={['contextMenu']}
          >
            <div className={style.project}>
              <div className={style.projectName}>
                <FileFilled className={style.projectIcon} />
                <span>{project.name}</span>
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
  function createCopy(data: ProjectInfo) {
    // TODO:
  }

  /**
   * 重命名项目，展示编辑名称的输入框
   * @param data
   */
  function renameProject(data: ProjectInfo) {
    // TODO:
  }

  /**
   * 删除项目
   * @param data
   */
  function deleteProject(data: ProjectInfo) {
    // TODO:
  }

  function dropdownRender(data: ProjectInfo) {
    return (
      <div className={style.dropdownContainer}>
        <div className={style.dropDownItem} onClick={() => openProject(data)}>
          <span>打开</span>
          <span className={style.shortKey}>⌘ O</span>
        </div>
        <Divider style={{ backgroundColor: '#F1F2F3', margin: '4px 0' }} />
        <div className={style.dropDownItem} onClick={() => createCopy(data)}>
          <span>创建副本</span>
          <span className={style.shortKey}>⌘ P</span>
        </div>
        <div className={style.dropDownItem} onClick={() => renameProject(data)}>
          <span>重命名</span>
          <span className={style.shortKey}>⌘ R</span>
        </div>
        <Divider style={{ backgroundColor: '#F1F2F3', margin: '4px 0' }} />
        <div className={style.dropDownItem} onClick={() => deleteProject(data)}>
          <span>删除</span>
          <span className={style.shortKey}>⌘ D</span>
        </div>
      </div>
    );
  }

  function renderActionComponent(data: ProjectInfo) {
    return (
      <Dropdown className={style.dropDownOverlay} dropdownRender={() => dropdownRender(data)} trigger={['click']}>
        <div className={style.dropDownBtn}>...</div>
      </Dropdown>
    );
  }

  function openNewProjectModal() {
    // TODO: 输入项目名称、描述和技术栈
  }

  /**
   * 打开本地的文件夹
   */
  function openLocalProject() {
    // TODO: 移植编辑页面打开项目的功能。如果没有对应的项目，则创建一个新项目，要求幂等。同时要更新项目的编辑时间。
  }

  return (
    <div className={style.main}>
      <div className={style.btnWrapper}>
        <div className={style.left}>
          <Button className={style.newBtn} type="primary" onClick={openNewProjectModal}>
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
  );
}
