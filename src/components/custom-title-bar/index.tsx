import { CloseOutlined, HomeOutlined, VideoCameraOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import style from './index.module.less';

interface ProjectItem {
  id: string;
  isPreview?: boolean;
  title: string;
}

export interface ICustomTitleBarProps {
  data?: ProjectItem[];
  onClose?: (project: string) => Promise<void>;
  onSelect?: (projectId: string) => Promise<void>;
  selectedProjectId?: string;
}

export default function CustomTitleBar({ selectedProjectId, data, onSelect, onClose }: ICustomTitleBarProps) {
  function handleClickHome() {
    if (onSelect) {
      onSelect('');
    }
  }

  const homeClass = classNames({
    [style.home]: true,
    [style.selected]: !selectedProjectId,
    [style.unselected]: !!selectedProjectId
  });

  async function handleCloseProject(e: any, projectItem: ProjectItem) {
    e.stopPropagation();
    if (onClose) {
      await onClose(projectItem.id);
    }
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
          nextSelectedId = '';
        }
        if (nextSelectedId === '') {
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
        [style.selected]: item.id === selectedProjectId,
        [style.unselected]: item.id !== selectedProjectId
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
