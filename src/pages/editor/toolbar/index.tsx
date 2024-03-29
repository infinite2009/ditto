import styles from './index.module.less';
import { Divider, Dropdown, message, Radio, Select, Space } from 'antd';
import PageAction from '@/types/page-action';
import React, { useContext, useEffect } from 'react';
import classNames from 'classnames';
import { AppStoreContext, DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import { Scene } from '@/service/app-store';
import {
  Clean,
  Comment,
  Download,
  ExpandScreen,
  ExpandThin,
  More,
  Preview,
  Redo,
  Share,
  Undo
} from '@/components/icon';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import style from '@/pages/editor/float-template-panel/index.module.less';
import { DesignMode } from '@/service/editor-store';

export enum PageWidth {
  wechat = 900,
  windows = 1280,
  mac = 1440,
  monitor = 1920,
  auto = 0
}

export interface PageActionEvent {
  payload?: { [key: string]: any };
  type: PageAction;
}

interface IToolbarProps {
  onDo: (e: PageActionEvent) => void;
  pageWidth?: number;
  projectId: string;
}

const { Option } = Select;

export default observer(({ onDo, pageWidth, projectId }: IToolbarProps) => {
  const dslStore = useContext(DSLStoreContext);
  const appStore = useContext(AppStoreContext);
  const editorStore = useContext(EditorStoreContext);

  useEffect(() => {
    const handlers = {
      downloadCode: handleExportingCode,
      save: handleSave,
      preview: handlePreview,
      toggleDesignAndCode: handleChangeView,
      toggleCanvasExpansion: handleExpand,
      clearCanvas: handleClear,
      // togglePageWidth: ,
      zoomIn,
      zoomOut,
      undo: handleUndo,
      redo: handleRedo
    };

    if (projectId) {
      const contextId = appStore.getContextIdForProject(projectId);
      if (!contextId) {
        // 创建上下文
        appStore.createContext(Scene.editor, { projectId }, handlers);
      } else {
        appStore.registerHandlers(contextId, handlers);
      }
    }
    // 注册快捷键
  }, [
    projectId,
    handleSave,
    handleExportingCode,
    handlePreview,
    handleChangeView,
    handleUndo,
    handleRedo,
    zoomIn,
    zoomOut,
    handleClear,
    handleExpand
  ]);

  function zoomIn() {
    message.success('缩小');
  }

  function zoomOut() {
    message.success('放大');
  }

  function handleUndo() {
    if (onDo) {
      onDo({
        type: PageAction.undo
      });
    }
  }

  function handleRedo() {
    if (onDo) {
      onDo({
        type: PageAction.redo
      });
    }
  }

  function handlePreview() {
    if (onDo) {
      onDo({
        type: PageAction.preview
      });
    }
  }

  function handleShare() {
    message.success('敬请期待').then();
  }

  function handleExportingCode() {
    if (onDo) {
      onDo({
        type: PageAction.exportCode
      });
    }
  }

  function handleClear() {
    if (onDo) {
      onDo({
        type: PageAction.clear
      });
    }
  }

  function handleComment() {
    editorStore.toggleCommentMode();
  }

  function handleExpand() {
    if (onDo) {
      onDo({
        type: PageAction.expandCanvas
      });
    }
  }

  function handleShowLayout() {
    // TODO: 展示布局
  }

  function handleChangeView() {
    if (onDo) {
      onDo({
        type: PageAction.changeView
      });
    }
  }

  function calClassNames(disabled: boolean) {
    return classNames({
      [styles.iconBtn]: true,
      [styles.disabled]: disabled
    });
  }

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

  function handleChangeScale(data: number) {
    if (onDo) {
      onDo({
        type: PageAction.changeScale,
        payload: {
          scale: data
        }
      });
    }
  }

  function calcIconClassNames() {
    return classNames({
      [styles.leftBtnWrapper]: true,
      [styles.disabled]: editorStore.viewMode === 'code'
    });
  }

  function handleSave() {
    if (onDo) {
      onDo({
        type: PageAction.saveFile
      });
    }
  }

  function handleClickingMenu(key: string) {
    switch (key) {
      case 'save':
        handleSave();
        break;
    }
  }

  function generateContextMenus() {
    const { save } = appStore.shortKeyDict[Scene.editor];
    return [
      [
        {
          key: 'save',
          title: save.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'save')]
        }
      ]
    ];
  }

  function handleClickDropdownMenu({ key }: { key: string }) {
    switch (key) {
      case '1':
        editorStore.framework = 'React';
        editorStore.language = 'TypeScript';
        break;
      case '2':
        editorStore.framework = 'React';
        editorStore.language = 'JavaScript';
        break;
      case '3':
        editorStore.framework = 'Vue';
        editorStore.language = 'TypeScript';
        break;
    }
    handleExportingCode();
  }

  function generateDropDownMenu() {
    return {
      items: [
        {
          key: '1',
          label: (
            <div className={style.dropDownItem}>
              <span>React(TypeScript)</span>
              <span className={style.menuShortKey}>
                {appStore.generateShortKeyDisplayName(Scene.editor, 'downloadCode')}
              </span>
            </div>
          )
        },
        {
          key: '2',
          label: (
            <div className={style.dropDownItem}>
              <span>React(JavaScript)</span>
            </div>
          )
        },
        {
          key: '3',
          label: (
            <div className={style.dropDownItem}>
              <span>Vue(TypeScript)</span>
            </div>
          )
        }
      ],
      onClick: handleClickDropdownMenu
    };
  }

  return (
    <div className={styles.main}>
      <div className={calcIconClassNames()}>
        <Divider className={styles.divider} type="vertical" style={{ marginLeft: 0, marginRight: 3 }} />
        <div className={styles.doWrapper}>
          <Undo className={calClassNames(!dslStore.canUndo)} onClick={handleUndo} />
          <Redo className={calClassNames(!dslStore.canRedo)} onClick={handleRedo} />
        </div>
        <Divider className={styles.divider} type="vertical" />
        {/*<DesktopOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('pc')} />*/}
        {/*<TabletOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('tablet')} />*/}
        {/*<MobileOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('phone')} />*/}
        <Select
          disabled={editorStore.viewMode !== 'design'}
          value={pageWidth}
          style={{ width: 100 }}
          bordered={false}
          optionLabelProp="label"
          dropdownStyle={{ width: 140 }}
          onChange={handleChangePageSize}
          suffixIcon={<ExpandThin style={{ pointerEvents: 'none' }} />}
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
        <Select
          disabled={editorStore.viewMode !== 'design'}
          defaultValue={100}
          style={{ width: 100 }}
          bordered={false}
          optionLabelProp="label"
          dropdownStyle={{ width: 140 }}
          onChange={handleChangeScale}
          suffixIcon={<ExpandThin style={{ pointerEvents: 'none' }} />}
        >
          <Option value={50} label="50%">
            <Space>
              <span>调整至</span>
              <span>50%</span>
            </Space>
          </Option>
          <Option value={75} label="75%">
            <Space>
              <span>调整至</span>
              <span>75%</span>
            </Space>
          </Option>
          <Option value={100} label="100%">
            <Space>
              <span>调整至</span>
              <span>100%</span>
            </Space>
          </Option>
          <Option value={125} label="125%">
            <Space>
              <span>调整至</span>
              <span>125%</span>
            </Space>
          </Option>
          <Option value={150} label="150%">
            <Space>
              <span>调整至</span>
              <span>150%</span>
            </Space>
          </Option>
          <Option value={175} label="175%">
            <Space>
              <span>调整至</span>
              <span>175%</span>
            </Space>
          </Option>
          <Option value={200} label="200%">
            <Space>
              <span>调整至</span>
              <span>200%</span>
            </Space>
          </Option>
        </Select>
        <Divider className={styles.divider} type="vertical" />
        <Comment
          className={classNames({
            [styles.iconBtn]: true,
            [styles.selected]: editorStore?.mode === DesignMode.comment
          })}
          onClick={handleComment}
        />
        <Clean className={styles.iconBtn} onClick={handleClear} />
        <ExpandScreen
          className={classNames({
            [styles.iconBtn]: true,
            [styles.selected]: !editorStore?.leftPanelVisible && !editorStore?.rightPanelVisible
          })}
          onClick={handleExpand}
        />
        {/*<LayoutOutlined className={styles.iconBtn} style={{ marginLeft: 'auto' }} onClick={handleShowLayout} />*/}
        <Divider className={styles.divider} type="vertical" style={{ marginLeft: 'auto', borderColor: '#F1F2F3' }} />
      </div>
      <div className={styles.rightBtnWrapper}>
        <Dropdown
          menu={generateDropDownMenu()}
          overlayClassName={styles.dropdownContainer}
          destroyPopupOnHide
          // onOpenChange={(open: boolean) => onOpenChange(open, data)}
          trigger={['hover']}
        >
          <Download className={styles.iconBtn} />
        </Dropdown>
        <Preview className={styles.iconBtn} onClick={handlePreview} />
        <Share className={styles.iconBtn} onClick={handleShare} />
        <ComponentContextMenu trigger={['click']} onClick={handleClickingMenu} items={generateContextMenus()}>
          <More className={styles.iconBtn} />
        </ComponentContextMenu>
        <Radio.Group
          options={[
            { label: '设计', value: 'design' },
            { label: '源码', value: 'code' }
          ]}
          onChange={handleChangeView}
          value={editorStore.viewMode}
          optionType="button"
          buttonStyle="solid"
          size="small"
        />
      </div>
    </div>
  );
});
