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
  isHome?: boolean;
  selectedProjectId?: string;
  onClose?: (item: ProjectItem) => void;
  onSelect?: (item: ProjectItem) => void;
}

export default function CustomTitleBar({ selectedProjectId, isHome, data, onSelect, onClose }: ICustomTitleBarProps) {
  const [, setLocation] = useLocation();

  function handleClickHome() {
    setLocation('/home');
  }

  const homeClass = classNames({
    [style.home]: true,
    [style.selected]: isHome,
    [style.unselected]: !isHome
  });

  function handleCloseProject(item: ProjectItem) {
    if (onClose) {
      onClose(item);
    }
  }

  function handleClickTab(item: ProjectItem) {
    if (onSelect) {
      onSelect(item);
    }
  }

  function renderTitle() {
    return data?.map(item => {
      const titleWrapperClass = classNames({
        [style.titleWrapper]: true,
        [style.selected]: item.id === selectedProjectId,
        [style.unselected]: item.id !== selectedProjectId
      });
      return (
        <div key={item.id} className={titleWrapperClass} onClick={() => handleClickTab(item)}>
          <div className={style.left}>
            {item.isPreview ? <VideoCameraOutlined className={style.previewIcon} /> : null}
            {item.title}
          </div>
          <CloseOutlined className={style.closeIcon} onClick={() => handleCloseProject(item)} />
        </div>
      );
    });
  }

  return (
    <div data-tauri-drag-region={true} className={style.main}>
      <div className={homeClass}>
        <HomeOutlined className={style.homeIcon} onClick={handleClickHome} />
      </div>
      {renderTitle()}
    </div>
  );
}
