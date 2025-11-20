import { Divider, Select, Space, Tooltip } from 'antd';
import { DesignMode } from '@/service/editor-store';
import HotkeysManager, { HotkeyAction, HotkeyDict } from '@/service/hotkeys-manager';
import { Annotation, Clean, ExpandDown, ExpandScreen } from '@/components/icon';
import classNames from 'classnames';
import { useCallback, useContext, useState } from 'react';
import { useMount } from 'ahooks';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import { PageActionEvent } from '@/pages/editor/toolbar';
import ZoomSelect from '@/components/zoom-select';
import PageAction from '@/types/page-action';

import styles from './index.module.less';
import { PageWidth } from '@/enum';

export interface CenterToolbarProps {
  onDo?: (e: PageActionEvent) => void;
}

function CenterToolbar({ onDo }: CenterToolbarProps) {
  const editorStore = useContext(EditorStoreContext);

  const [selectIsOpen, setSelectIsOpen] = useState<boolean>(false);
  const [hotkeysConfig, setHotkeysConfig] = useState<HotkeyDict>(null);

  useMount(async () => {
    const hotkeysConfig = await HotkeysManager.fetchHotkeysConfig();
    setHotkeysConfig(hotkeysConfig);
  });

  const generateTooltipTitle = useCallback(
    (action: HotkeyAction) => {
      if (!hotkeysConfig) {
        return '';
      }
      const hotkeyConfig = hotkeysConfig[action];
      return `${hotkeyConfig.title}: ${hotkeyConfig.displayName}`;
    },
    [hotkeysConfig]
  );

  const handleToggleNote = useCallback(() => {
    onDo?.({
      type: PageAction.toggleNote
    });
  }, [onDo]);

  const handleClear = useCallback(() => {
    onDo?.({ type: PageAction.clear });
  }, []);

  const handleExpand = useCallback(() => {
    onDo?.({ type: PageAction.expandCanvas });
  }, [onDo]);

  const onDropdownVisibleChange = useCallback((open: boolean) => {
    setSelectIsOpen(open);
  }, []);

  const handleChangePageSize = useCallback(
    (data: number) => {
      onDo?.({ type: PageAction.changePageSize, payload: { pageWidth: data } });
    },
    [onDo]
  );

  const handleChangeScale = useCallback(
    (data: number) => {
      onDo?.({ type: PageAction.changeScale, payload: { scale: data || 100 } });
    },
    [onDo]
  );

  return (
    <div className={styles.centerToolbar}>
      <Select
        styles={{
          popup: {
            root: { width: 140 }
          }
        }}
        disabled={editorStore.viewMode !== 'design'}
        value={editorStore.pageWidth}
        variant="borderless"
        optionLabelProp="label"
        onOpenChange={onDropdownVisibleChange}
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
        <Select.Option value={PageWidth.auto} label="自适应">
          <Space>
            <span>自适应窗口宽度</span>
          </Space>
        </Select.Option>
        <Select.Option value={PageWidth.windows} label={`${PageWidth.windows}px`}>
          <Space>
            <span>Win</span>
            <span>{PageWidth.windows} px</span>
          </Space>
        </Select.Option>
        <Select.Option value={PageWidth.mac} label={`${PageWidth.mac}px`}>
          <Space>
            <span>Mac</span>
            <span>{PageWidth.mac} px</span>
          </Space>
        </Select.Option>
        <Select.Option value={PageWidth.monitor} label={`${PageWidth.monitor}px`}>
          <Space>
            <span>显示器</span>
            <span>{PageWidth.monitor} px</span>
          </Space>
        </Select.Option>
        <Select.Option value={PageWidth.wechat} label={`${PageWidth.wechat}px`}>
          <Space>
            <span>企微窗口</span>
            <span>{PageWidth.wechat} px</span>
          </Space>
        </Select.Option>
      </Select>
      <Divider className={styles.divider} type="vertical" />
      <ZoomSelect defaultValue={100} onZoom={handleChangeScale} />
      <Divider className={styles.divider} type="vertical" />
      {[DesignMode.edit].includes(editorStore?.mode) && (
        <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.CLEAR_CANVAS)}>
          <Clean className={styles.icon} onClick={handleClear} />
        </Tooltip>
      )}
      {[DesignMode.edit, DesignMode.preview].includes(editorStore?.mode) && (
        <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.TOGGLE_CANVAS_EXPANSION)}>
          <ExpandScreen
            className={classNames({
              [styles.icon]: true,
              [styles.selected]: !editorStore?.leftPanelVisible && !editorStore?.rightPanelVisible
            })}
            onClick={handleExpand}
          />
        </Tooltip>
      )}
      <Tooltip mouseEnterDelay={0.5} title={generateTooltipTitle(HotkeyAction.ANNOTATION)}>
        <Annotation
          className={classNames({
            [styles.icon]: true,
            [styles.selected]: editorStore?.showNote
          })}
          onClick={handleToggleNote}
        />
      </Tooltip>
    </div>
  );
}

CenterToolbar.displayName = 'CenterToolbar';

const Index = observer(CenterToolbar);

export default Index;
