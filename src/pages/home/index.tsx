import { useLocation } from 'wouter';

import style from './index.module.less';
import { FileFilled, PlusOutlined, SelectOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
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
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
        {
          id: '1',
          name: '测试项目',
          lastModified: new Date().getTime(),
          type: 'react',
          path: ''
        },
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
        <li key={project.id} className={style.project}>
          <div className={style.projectName}>
            <FileFilled className={style.projectIcon} />
            <span>{project.name}</span>
          </div>
          <span className={style.editTime}>12分钟前</span>
          <div className={style.action}>{renderActionComponent(project)}</div>
        </li>
      );
    });
  }

  function handleButtonClick() {}

  function renderActionComponent(data: ProjectInfo) {
    const menuProps = [
      {
        label: <span>打开</span>,
        key: '1'
      },
      {
        label: (
          <div className={style.dropDownItem}>
            <span>创建副本</span>
            <span className={style.shortKey}>Q</span>
          </div>
        ),
        key: '2'
      }
    ];
    return (
      <Dropdown menu={{ items: menuProps, onClick: handleButtonClick }} trigger={['click']}>
        <div>...</div>
      </Dropdown>
    );
  }

  return (
    <div className={style.main}>
      <div className={style.btnWrapper}>
        <div className={style.left}>
          <Button className={style.newBtn} type="primary">
            <PlusOutlined className={style.btnIcon} />
            新建
          </Button>
          <Button className={style.openBtn}>
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
