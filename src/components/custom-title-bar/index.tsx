import { CloseOutlined, HomeOutlined, VideoCameraOutlined } from '@ant-design/icons';
import style from './index.module.less';
import { useLocation } from 'wouter';
import classNames from 'classnames';

interface ProjectItem {
  id: string;
  title: string;
  isPreview?: boolean;
}

export interface ICustomTitleBarProps {
  data?: ProjectItem[];
  selectedProjectId?: string;
  onClose?: (project: string) => Promise<void>;
  onSelect?: (projectId: string | null) => Promise<void>;
}

export default function CustomTitleBar({ selectedProjectId, data, onSelect, onClose }: ICustomTitleBarProps) {
  const [location, setLocation] = useLocation();

  function handleClickHome() {
    if (location !== '/home') {
      setLocation('/home');
    }
  }

  const homeClass = classNames({
    [style.home]: true,
    [style.selected]: location === '/home',
    [style.unselected]: !(location === '/home')
  });

  async function handleCloseProject(e: any, projectItem: ProjectItem) {
    e.stopPropagation();
    if (onClose) {
      await onClose(projectItem.id);
      console.log('onClose');
    }
    console.log('onClose out');
    if (projectItem.id !== selectedProjectId) {
      return;
    }
    if (data?.length) {
      const l = data.length;
      // 如果右侧有打开的项目，选择右边第一个，如果没有，选择左侧最后一个
      const index = data.findIndex(item => projectItem.id === item.id);
      if (index > -1) {
        let nextSelectedId;
        if (index < l - 1) {
          nextSelectedId = data[index + 1].id;
        } else if (index > 0) {
          nextSelectedId = data[index - 1].id;
        } else {
          nextSelectedId = null;
        }
        if (nextSelectedId === null) {
          setLocation('/home');
          return;
        }
        if (onSelect) {
          onSelect(nextSelectedId);
        }
      }
    }
  }

  function handleClickTab(item: ProjectItem) {
    if (onSelect) {
      onSelect(item.id);
    }
  }

  function renderTitle() {
    return data?.map(item => {
      const titleWrapperClass = classNames({
        [style.titleWrapper]: true,
        [style.selected]: item.id === selectedProjectId && location !== '/home',
        [style.unselected]: item.id !== selectedProjectId || location === '/home'
      });
      return (
        <div key={item.id} className={titleWrapperClass} onClick={() => handleClickTab(item)}>
          <div className={style.left}>
            {item.isPreview ? <VideoCameraOutlined className={style.previewIcon} /> : null}
            {item.title}
          </div>
          <CloseOutlined className={style.closeIcon} onClick={(e: any) => handleCloseProject(e, item)} />
        </div>
      );
    });
  }

  return (
    <div data-tauri-drag-region={true} className={style.main}>
      <div className={homeClass} onClick={handleClickHome}>
        <HomeOutlined className={style.homeIcon} />
      </div>
      {renderTitle()}
    </div>
  );
}
