import { Dropdown, Popconfirm, Radio, Tooltip } from 'antd';
import { Download, Info, Notation, Preview, Share } from '@/components/icon';
import HotkeysManager, { HotkeyAction } from '@/service/hotkeys-manager';
import React, { useContext, useState } from 'react';
import style from '@/pages/editor/float-template-panel/index.module.less';
import { useMount } from 'ahooks';
import PageAction from '@/types/page-action';
import { PageActionEvent } from '@/pages/editor/toolbar';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';

import styles from './index.module.less';
import classnames from 'classnames';

interface IToolbarProps {
  onDo: (e: PageActionEvent) => void;
  pageWidth?: number;
  projectId: string;
}

function RightToolbar({ onDo }: IToolbarProps) {
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);

  const [hotkeysConfig, setHotkeysConfig] = useState<any>(null);

  function generateTooltipTitle(action: HotkeyAction) {
    if (!hotkeysConfig) {
      return '';
    }
    const hotkeyConfig = hotkeysConfig[action];
    return `${hotkeyConfig.title}: ${hotkeyConfig.displayName}`;
  }

  useMount(async () => {
    const hotkeysConfig = await HotkeysManager.fetchHotkeysConfig();
    setHotkeysConfig(hotkeysConfig);
  });

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

  function handlePreview() {
    if (onDo) {
      onDo({
        type: PageAction.preview
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

  function renderNotation() {
    const diffs = dslStore.diffAllComponentProps();
    const iconTpl = <Notation className={classnames({ [styles.icon]: true, [styles.hasNotation]: !!diffs })} />;
    if (diffs) {
      return (
        <Popconfirm
          rootClassName={styles.componentUpdateRoot}
          trigger="click"
          arrow={false}
          title={<p className={styles.componentUpdateTitle}>组件更新</p>}
          icon={null}
          description={<p className={styles.componentUpdateDescription}>当前页面有组件更新，请及时更新</p>}
          placement="bottomLeft"
          okText="立即更新"
          cancelText="取消"
          onConfirm={() => {
            dslStore.batchMergeComponentProps();
          }}
        >
          {iconTpl}
        </Popconfirm>
      );
    }
    return iconTpl;
  }

  return (
    <div className={styles.rightToolbar}>
      {renderNotation()}
      <Dropdown
        menu={generateHotkeyList()}
        overlayClassName={styles.dropdownContainer}
        destroyOnHidden
        trigger={['hover']}
      >
        <Info className={styles.icon} />
      </Dropdown>
      <Dropdown
        menu={generateDropDownMenu()}
        overlayClassName={styles.dropdownContainer}
        destroyOnHidden
        trigger={['hover']}
      >
        <Download className={styles.icon} />
      </Dropdown>
      <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.PREVIEW)}>
        <Preview className={styles.icon} onClick={handlePreview} />
      </Tooltip>
      <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.SHARE)}>
        <Share className={styles.icon} onClick={handleShare} />
      </Tooltip>
      <Radio.Group
        className={styles.buttonGroup}
        options={[
          { label: '设计', value: 'design' },
          { label: '源码', value: 'code' }
        ]}
        onChange={handleChangeView}
        value={editorStore.viewMode}
        optionType="button"
        buttonStyle="solid"
        size="small"
        style={{ width: 82 }}
      />
    </div>
  );
}

RightToolbar.displayName = 'RightToolbar';

export default observer(RightToolbar);
