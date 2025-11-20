import styles from './index.module.less';
import { Button, Divider, Dropdown, message, Select, Space } from 'antd';
import PageAction from '@/types/page-action';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import { Desktop } from '@/components/icon';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown } from '@/components/icon';
import CopyToClipboard from 'react-copy-to-clipboard';

export enum PageWidth {
  wechat = 900,
  windows = 1280,
  mac = 1440,
  monitor = 1920,
  auto = 0
}

interface MenuItem {
  children?: MenuItem[];
  icon?: React.ReactNode;
  key: string;
  label?: React.ReactNode;
}

export interface PageActionEvent {
  payload?: { [key: string]: any };
  type: PageAction;
}

interface IToolbarProps {
  onDo: (e: PageActionEvent) => void;
  openFile?: (pageId: string) => void;
  pageWidth?: number;
  projectId: string;
  showTab?: boolean;
}

const { Option } = Select;

export default observer(({ onDo, pageWidth, showTab, openFile }: IToolbarProps) => {
  const editorStore = useContext(EditorStoreContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectIsOpen, setSelectIsOpen] = useState<boolean>(false);
  const [curSelectedPage, setCurSelectedPage] = useState<{ name?: string }>({});
  const [dropdownOpen, setDropdownOpen] = useState(undefined);

  const dataWithIcon = useMemo(() => {
    if (editorStore.pageList?.length) {
      const recursiveMap = (data: any[]) => {
        return data.map(item => {
          const converted: MenuItem = {
            key: item.id
          };
          if (item.children) {
            converted.children = recursiveMap(item.children);
          }
          converted.icon = <Desktop className={styles.fileIcon} />;
          converted.label = (
            <div className={styles.nodeTitle}>
              <span className={styles.ell}>{item.name}123</span>
            </div>
          );
          return converted;
        });
      };

      return recursiveMap(editorStore.pageList);
    }
    return [];
  }, [editorStore.pageList]);

  function handleChangePageSize(data: number) {
    if (onDo) {
      onDo({
        type: PageAction.changePageSize,
        payload: {
          pageWidth: data
        }
      });
    }
  }

  function onDropdownVisibleChange(open: boolean) {
    setSelectIsOpen(open);
  }

  /**
   * 更改页面
   */
  function handleChangePageId(options) {
    const { key } = options;
    const openedProjectId = searchParams.get('projectId');
    if (key && editorStore?.pageList?.find(p => p.id === key)) {
      editorStore.setSelectedPageId(openedProjectId, key);
      openFile(key);
    }
    searchParams.set('pageId', key);
    setSearchParams(searchParams);
  }

  useEffect(() => {
    const page = editorStore.pageList?.find(p => p.id === editorStore.selectedPageId) || editorStore.pageList[0] || {};
    setCurSelectedPage(page);
  }, [editorStore.pageList, editorStore.selectedPageId]);

  useEffect(() => {
    // 隐藏tab时，将dropDown关闭。但又不想受控它，所以宏任务再置为undefined
    setDropdownOpen(false);
    setTimeout(() => {
      setDropdownOpen(undefined);
    }, 0);
  }, [showTab]);

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftBtnWrapper}>
        <div className={styles.space}></div>
      </div>
      <div className={styles.rightBtnWrapper}>
        {/* 页面切换 */}
        {!!dataWithIcon?.length && (
          <div className={styles.pageNameContainer}>
            <Dropdown
              open={dropdownOpen}
              menu={{
                items: dataWithIcon,
                selectedKeys: [editorStore.selectedPageId],
                onClick: handleChangePageId
              }}
              trigger={['click']}
            >
              <div className={styles.pageNameContent} onClick={e => e.preventDefault()}>
                <div className={styles.pageNameTextContent}>
                  <span
                    className={classNames({
                      [styles.ell]: true,
                      [styles.pageNameText]: true
                    })}
                  >
                    {curSelectedPage?.name}
                  </span>
                  <ArrowExpandLine className={styles.expandIcon} />
                </div>
              </div>
            </Dropdown>
          </div>
        )}
        <Divider className={styles.divider} type="vertical" />

        {/* 屏幕尺寸 */}
        <div className={styles.screenSizeSelector}>
          <Select
            disabled={editorStore.viewMode !== 'design'}
            value={pageWidth}
            variant="borderless"
            optionLabelProp="label"
            styles={ { popup: { root: { width: 140 }}}}
            onOpenChange={onDropdownVisibleChange}
            onChange={handleChangePageSize}
            suffixIcon={
              <ArrowDown
                style={{
                  pointerEvents: 'none',
                  fontSize: '12px',
                  color: selectIsOpen ? '#0000003f' : '#000000e0',
                  transform: selectIsOpen ? 'scaleY(-1)' : undefined,
                  transition: 'all .2s ease-in-out'
                }}
              />
            }
          >
            <Option value={PageWidth.auto} label="自适应">
              <Space>
                <span>自适应窗口宽度</span>
              </Space>
            </Option>
            <Option value={PageWidth.windows} label={`${PageWidth.windows}px`}>
              <Space>
                <span>Win</span>
                <span>{PageWidth.windows} px</span>
              </Space>
            </Option>
            <Option value={PageWidth.mac} label={`${PageWidth.mac}px`}>
              <Space>
                <span>Mac</span>
                <span>{PageWidth.mac} px</span>
              </Space>
            </Option>
            <Option value={PageWidth.monitor} label={`${PageWidth.monitor}px`}>
              <Space>
                <span>显示器</span>
                <span>{PageWidth.monitor} px</span>
              </Space>
            </Option>
            <Option value={PageWidth.wechat} label={`${PageWidth.wechat}px`}>
              <Space>
                <span>企微窗口</span>
                <span>{PageWidth.wechat} px</span>
              </Space>
            </Option>
          </Select>
        </div>
        <Divider className={styles.divider} type="vertical" />

        {/* TODO 全屏完善 */}
        {/* <ArrowExpandMirrorDoubleLine className={styles.expandIcon} onClick={handleButtonClick} />
        <ArrowCollapseMirrorDoubleLine className={styles.expandIcon} onClick={handleFullScreenClose} /> */}
        <CopyToClipboard text={window.location.href}>
          <Button
            className={styles.ml8}
            type="primary"
            onClick={() => message.success('链接已复制')}
            size="small"
            autoInsertSpace={false}
          >
            分享
          </Button>
        </CopyToClipboard>
      </div>
    </div>
  );
});
