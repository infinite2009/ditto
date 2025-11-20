import styles from './index.module.less';
import { Button, Divider, Dropdown, Popover, Radio, Select, Space, Tag, Tooltip } from 'antd';
import PageAction from '@/types/page-action';
import { useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { AppStoreContext, DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import { Scene, sceneMap } from '@/service/app-store';
import {
  Clean,
  Download,
  ExpandDown,
  ExpandScreen,
  InfoFilled,
  More,
  Note,
  Preview,
  Redo,
  Share,
  Undo
} from '@/components/icon';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import style from '@/pages/editor/float-template-panel/index.module.less';
import { DesignMode } from '@/service/editor-store';
import ZoomSelect from '@/components/zoom-select';
import { DiffPropsFnResult } from '@/service/dsl-store';
import HotkeysManager, { HotkeyAction } from '@/service/hotkeys-manager';
import { useMount } from 'ahooks';
import { PageWidth } from '@/enum';

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

const Index = ({ onDo, pageWidth, projectId }: IToolbarProps) => {
  const dslStore = useContext(DSLStoreContext);
  const appStore = useContext(AppStoreContext);
  const editorStore = useContext(EditorStoreContext);

  const [diffs, setDiffs] = useState<Record<string, DiffPropsFnResult>>();
  const [selectIsOpen, setSelectIsOpen] = useState<boolean>(false);
  const [hotkeysConfig, setHotkeysConfig] = useState<any>(null);
  useMount(async () => {
    const hotkeysConfig = await HotkeysManager.fetchHotkeysConfig();
    setHotkeysConfig(hotkeysConfig);
  });

  useEffect(() => {
    let handlers = {};
    // 编辑态支持以下快捷键
    if (editorStore.mode === DesignMode.edit) {
      handlers = {
        downloadCode: handleExportingCode,
        save: handleSave,
        preview: handlePreview,
        toggleDesignAndCode: handleChangeView,
        toggleCanvasExpansion: handleExpand,
        clearCanvas: handleClear,
        undo: handleUndo,
        redo: handleRedo
      };
    }
    // 评论态支持以下快捷键
    if (editorStore.mode === DesignMode.comment) {
      handlers = {
        preview: handlePreview, // 新tab打开预览页
        toggleDesignAndCode: handleChangeView, // 设计/源码切换
        toggleCanvasExpansion: handleExpand // 当前页切换预览模式
      };
    }
    // 预览态支持以下快捷键
    if (editorStore.mode === DesignMode.preview) {
      handlers = {
        preview: handlePreview, // 新tab打开预览页
        toggleDesignAndCode: handleChangeView, // 设计/源码切换
        toggleCanvasExpansion: handleExpand // 当前页切换预览模式
      };
    }

    // 注册相应模式下的快捷键
    appStore.registerHandlers(sceneMap[editorStore.mode], handlers);
  }, [
    editorStore.mode,
    projectId,
    handleSave,
    handleExportingCode,
    handlePreview,
    handleChangeView,
    handleUndo,
    handleRedo,
    handleClear,
    handleExpand
  ]);

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
    if (onDo) {
      onDo({
        type: PageAction.SHARE
      });
    }
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

  function handleExpand() {
    if (onDo) {
      onDo({
        type: PageAction.expandCanvas
      });
    }
  }

  function handleToggleNote() {
    if (onDo) {
      onDo({
        type: PageAction.toggleNote
      });
    }
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

  function onDropdownVisibleChange(open: boolean) {
    setSelectIsOpen(open);
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

  function handleCopyComponentSource() {
    if (onDo) {
      onDo({
        type: PageAction.copyComponentSource
      });
    }
  }
  function handleCopyFullSource() {
    if (onDo) {
      onDo({
        type: PageAction.copyFullSource
      });
    }
  }
  function handleCopyCustomSource() {
    if (onDo) {
      onDo({
        type: PageAction.copyCustomSource
      });
    }
  }

  function handleClickingMenu(key: string) {
    switch (key) {
      case 'save':
        handleSave();
        break;
      case 'copyComponentSource':
        handleCopyComponentSource();
        break;
      case 'copyFullSource':
        handleCopyFullSource();
        break;
      case 'copyCustomSource':
        handleCopyCustomSource();
        break;
      case 'editDSL':
        handleEditDSL();
        break;
      case 'rollbackDSL':
        handleRollbackDSL();
        break;
      default:
        break;
    }
  }

  function handleEditDSL() {
    if (onDo) {
      onDo({
        type: PageAction.editDSL
      });
    }
  }

  function handleRollbackDSL() {
    if (onDo) {
      onDo({
        type: PageAction.rollbackDSL
      });
    }
  }

  function generateContextMenus() {
    const { save, editDSL, rollbackDSL, copySource, copyFullSource, copyComponentSource, copyCustomSource } =
      appStore.shortKeyDict[Scene.editor];
    return [
      [
        {
          key: 'save',
          title: save.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'save')]
        },
        // {
        //   type: 'divider',
        // },
        {
          key: 'copySource',
          title: copySource.functionName,
          children: [
            {
              key: 'copyFullSource',
              title: copyFullSource.functionName,
              shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'copyFullSource')]
            },
            {
              key: 'copyComponentSource',
              title: copyComponentSource.functionName,
              shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'copyComponentSource')]
            },
            {
              key: 'copyCustomSource',
              title: copyCustomSource.functionName,
              shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'copyCustomSource')]
            }
          ]
        },
        {
          key: 'editDSL',
          title: editDSL.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'editDSL')]
        },
        {
          key: 'rollbackDSL',
          title: rollbackDSL.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'rollbackDSL')]
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

  function generateHotkeyList() {
    if (!hotkeysConfig) {
      return null;
    }
    // 由于目前快捷键实现不完整，所以只能先硬编码，等完全实现后，改为从配置获取
    const hotkeysInfoList = [
      HotkeyAction.SAVE,
      HotkeyAction.UNDO,
      HotkeyAction.REDO,
      HotkeyAction.PREVIEW,
      HotkeyAction.TOGGLE_DESIGN_AND_CODE,
      HotkeyAction.TOGGLE_CANVAS_EXPANSION,
      HotkeyAction.CLEAR_CANVAS,
      HotkeyAction.COPY,
      HotkeyAction.CUT,
      HotkeyAction.PASTE,
      HotkeyAction.REMOVE,
      HotkeyAction.SHARE
    ];

    const items = hotkeysInfoList.map(action => {
      return {
        key: action,
        label: (
          <div className={style.dropDownItem}>
            <span>{hotkeysConfig[action].title}</span>
            <span className={style.menuShortKey}>{hotkeysConfig[action].displayName}</span>
          </div>
        )
      };
    });
    return {
      items
    };
  }

  function generateDropDownMenu() {
    return {
      items: [
        {
          key: '1',
          label: (
            <div className={style.dropDownItem}>
              <span>React(TypeScript)</span>
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

  useEffect(() => {
    const allDiffs = dslStore.diffAllComponentProps();
    setDiffs(allDiffs);
  }, [dslStore?.dsl]);

  function generateTooltipTitle(action: HotkeyAction) {
    if (!hotkeysConfig) {
      return '';
    }
    const hotkeyConfig = hotkeysConfig[action];
    return `${hotkeyConfig.title}: ${hotkeyConfig.displayName}`;
  }

  return (
    <div className={styles.toolbar}>
      <div className={calcIconClassNames()}>
        <Divider className={styles.divider} type="vertical" style={{ marginLeft: 0, marginRight: 3 }} />
        {[DesignMode.edit].includes(editorStore?.mode) && (
          <>
            <Undo className={calClassNames(!dslStore.canUndo)} onClick={handleUndo} />
            <Redo className={calClassNames(!dslStore.canRedo)} onClick={handleRedo} />
            <Divider className={styles.divider} type="vertical" />
          </>
        )}
        <div className={styles.screenSizeSelector}>
          <Select
            disabled={editorStore.viewMode !== 'design'}
            value={pageWidth}
            variant="borderless"
            optionLabelProp="label"
            onOpenChange={onDropdownVisibleChange}
            styles={{
              popup: {
                root: { width: 140 }
              }
            }}
            onChange={handleChangePageSize}
            suffixIcon={
              <ExpandDown
                style={{
                  color: '#9499A0',
                  pointerEvents: 'none',
                  transform: selectIsOpen ? 'rotate(180deg)' : undefined,
                  transition: 'transform .3s ease-in-out'
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
        <ZoomSelect defaultValue={100} onZoom={handleChangeScale} />
        <Divider className={styles.divider} type="vertical" />
        {/*{[DesignMode.edit, DesignMode.comment].includes(editorStore?.mode) && (*/}
        {/*  <div className={styles.commentWithNotification}>*/}
        {/*    <Comment*/}
        {/*      className={classNames({*/}
        {/*        [styles.iconBtn]: true,*/}
        {/*        [styles.selected]: editorStore?.mode === DesignMode.comment*/}
        {/*      })}*/}
        {/*      onClick={handleComment}*/}
        {/*    />*/}
        {/*    {renderNoticeDot()}*/}
        {/*  </div>*/}
        {/*)}*/}
        {[DesignMode.edit].includes(editorStore?.mode) && (
          <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.CLEAR_CANVAS)}>
            <Clean className={styles.iconBtn} onClick={handleClear} />
          </Tooltip>
        )}
        {[DesignMode.edit, DesignMode.preview].includes(editorStore?.mode) && (
          <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.TOGGLE_CANVAS_EXPANSION)}>
            <ExpandScreen
              className={classNames({
                [styles.iconBtn]: true,
                [styles.selected]: !editorStore?.leftPanelVisible && !editorStore?.rightPanelVisible
              })}
              onClick={handleExpand}
            />
          </Tooltip>
        )}
        <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.ANNOTATION)}>
          <Note
            className={classNames({
              [styles.iconBtn]: true,
              [styles.selected]: editorStore?.showNote
            })}
            onClick={handleToggleNote}
          />
        </Tooltip>
        {/*<LayoutOutlined className={styles.iconBtn} style={{ marginLeft: 'auto' }} onClick={handleShowLayout} />*/}
        <Divider className={styles.divider} type="vertical" style={{ marginLeft: 'auto', borderColor: '#F1F2F3' }} />
      </div>
      {diffs && (
        <Space>
          当前页面有
          <Popover
            title={
              <>
                {Object.keys(diffs).map(id => (
                  <Tag
                    style={{ cursor: 'pointer' }}
                    key={id}
                    onClick={() => {
                      dslStore.selectComponent(id);
                    }}
                  >
                    {id}
                  </Tag>
                ))}
              </>
            }
          >
            <span
              style={{
                color: '#00AEEC',
                fontWeight: 500,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              {Object.keys(diffs).length}
            </span>
          </Popover>
          个组件待更新
          <Button
            size="small"
            type="primary"
            onClick={() => {
              dslStore.batchMergeComponentProps();
              setDiffs(null);
            }}
          >
            一键更新
          </Button>
        </Space>
      )}
      <div className={styles.rightBtnWrapper}>
        <Dropdown
          menu={generateHotkeyList()}
          overlayClassName={styles.dropdownContainer}
          destroyOnHidden
          trigger={['hover']}
        >
          <InfoFilled className={styles.iconBtn} />
        </Dropdown>
        <Dropdown
          menu={generateDropDownMenu()}
          overlayClassName={styles.dropdownContainer}
          destroyOnHidden
          trigger={['hover']}
        >
          <Download className={styles.iconBtn} />
        </Dropdown>
        <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.PREVIEW)}>
          <Preview className={styles.iconBtn} onClick={handlePreview} />
        </Tooltip>
        <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.SHARE)}>
          <Share className={styles.iconBtn} onClick={handleShare} />
        </Tooltip>
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
};

Index.displayName = 'Toolbar';

const Toolbar = observer(Index);

export default Toolbar;
