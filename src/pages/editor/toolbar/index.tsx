import styles from './index.module.less';
import { Divider, Radio, Select, Space } from 'antd';
import PageAction from '@/types/page-action';
import React, { useContext, useState } from 'react';
import {
  ClearOutlined,
  DownloadOutlined,
  ExpandOutlined,
  LayoutOutlined,
  RedoOutlined,
  SaveOutlined,
  UndoOutlined,
  YoutubeOutlined
} from '@ant-design/icons';
import classNames from 'classnames';
import { DSLStoreContext } from '@/hooks/context';
import { observer } from 'mobx-react';
import { RadioChangeEvent } from 'antd/es/radio/interface';

export interface PageActionEvent {
  type: PageAction;
  payload?: { [key: string]: any };
}

interface IToolbarProps {
  onDo: (e: PageActionEvent) => void;
}

const { Option } = Select;

export default observer(({ onDo }: IToolbarProps) => {
  const dslStore = useContext(DSLStoreContext);

  const [view, setView] = useState<'code' | 'design'>('design');

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

  function handleExportingCode() {
    if (onDo) {
      onDo({
        type: PageAction.exportCode
      });
    }
  }

  function handleCreatingNewPage() {
    if (onDo) {
      onDo({
        type: PageAction.createPage
      });
    }
  }

  function handleOpenProject() {
    if (onDo) {
      onDo({
        type: PageAction.openProject
      });
    }
  }

  function handleSavingFile() {
    if (onDo) {
      onDo({
        type: PageAction.saveFile
      });
    }
  }

  function handleTogglePlatform(platform: 'pc' | 'tablet' | 'phone') {
    if (onDo) {
      onDo({
        type: PageAction.changePlatform
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

  function handleShowLayout() {
    // TODO: 展示布局
  }

  function handleChangeView({ target: { value } }: RadioChangeEvent) {
    if (onDo) {
      onDo({
        type: PageAction.changeView,
        payload: {
          showDesign: value === 'design'
        }
      });
    }
    setView(value);
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
          size: data
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
      [styles.disabled]: view === 'code'
    });
  }

  function handleSave() {
    if (onDo) {
      onDo({
        type: PageAction.saveFile
      });
    }
  }

  return (
    <div className={styles.main}>
      <div className={calcIconClassNames()}>
        <Divider type="vertical" style={{ marginLeft: 0, borderColor: '#F1F2F3' }} />
        <UndoOutlined className={calClassNames(!dslStore.canUndo)} onClick={handleUndo} />
        <RedoOutlined className={calClassNames(!dslStore.canRedo)} onClick={handleRedo} />
        <Divider className={styles.divider} type="vertical" />
        {/*<DesktopOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('pc')} />*/}
        {/*<TabletOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('tablet')} />*/}
        {/*<MobileOutlined className={styles.iconBtn} onClick={() => handleTogglePlatform('phone')} />*/}
        <Select
          disabled={view !== 'design'}
          value={1280}
          style={{ width: 100 }}
          bordered={false}
          optionLabelProp="label"
          dropdownStyle={{ width: 140 }}
          onChange={handleChangePageSize}
        >
          <Option value={900} label="900px">
            <Space>
              <span>企微窗口</span>
              <span>900 px</span>
            </Space>
          </Option>
          <Option value={1280} label="1280px">
            <Space>
              <span>Win</span>
              <span>1280 px</span>
            </Space>
          </Option>
          <Option value={1440} label="1440px">
            <Space>
              <span>Mac</span>
              <span>1440 px</span>
            </Space>
          </Option>
          <Option value={1920} label="1920px">
            <Space>
              <span>显示器</span>
              <span>1920 px</span>
            </Space>
          </Option>
        </Select>
        <Select
          disabled={view !== 'design'}
          defaultValue={1}
          style={{ width: 100 }}
          bordered={false}
          optionLabelProp="label"
          dropdownStyle={{ width: 140 }}
          onChange={handleChangeScale}
        >
          <Option value={0.5} label="50%">
            <Space>
              <span>调整至</span>
              <span>50%</span>
            </Space>
          </Option>
          <Option value={1} label="100%">
            <Space>
              <span>调整至</span>
              <span>100%</span>
            </Space>
          </Option>
          <Option value={2} label="200%">
            <Space>
              <span>调整至</span>
              <span>200%</span>
            </Space>
          </Option>
        </Select>
        <Divider className={styles.divider} type="vertical" />
        <ClearOutlined className={styles.iconBtn} onClick={handleClear} />
        <ExpandOutlined className={styles.iconBtn} onClick={handleExpand} />
        <LayoutOutlined className={styles.iconBtn} style={{ marginLeft: 'auto' }} onClick={handleShowLayout} />
        <Divider type="vertical" style={{ marginRight: 0, borderColor: '#F1F2F3' }} />
      </div>
      <div className={styles.rightBtnWrapper}>
        <SaveOutlined className={styles.iconBtn} onClick={handleSave} />
        <DownloadOutlined className={styles.iconBtn} onClick={handleExportingCode} />
        <YoutubeOutlined className={styles.iconBtn} onClick={handlePreview} />
        <Radio.Group
          options={[
            { label: '设计', value: 'design' },
            { label: '源码', value: 'code' }
          ]}
          onChange={handleChangeView}
          defaultValue="design"
          optionType="button"
          buttonStyle="solid"
        />
      </div>
    </div>
  );
});
