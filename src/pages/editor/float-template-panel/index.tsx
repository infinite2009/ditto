import DbStore, { TemplateInfo } from '@/service/db-store';
import { observer } from 'mobx-react';
import { AppStoreContext } from '@/hooks/context';
import React, { useContext, useRef, useState } from 'react';
import { Button, ConfigProvider, Divider, Dropdown, Input, Modal } from 'antd';
import style from './index.module.less';
import { Close, ExpandThin, Menu2, More, Playlist2 } from '@/components/icon';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import classNames from 'classnames';
import { Scene } from '@/service/app-store';

export interface IFloatTemplatePanelProps {
  onApplyTemplate: (path: string) => void;
}

export default observer(function FloatTemplatePanel({ onApplyTemplate }: IFloatTemplatePanelProps) {
  const appStore = useContext(AppStoreContext);

  const [keyword, setKeyword] = useState<string>('');
  const [listMode, setListMode] = useState<'small' | 'large'>('small');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedTemplateInfoForRename, setSelectedTemplateInfoForRename] = useState<TemplateInfo>(null);
  const [templateInfoInPreview, setTemplateInfoInPreview] = useState<TemplateInfo>(null);

  const selectedTemplateInfoRef = useRef<TemplateInfo>(null);

  function openModal() {
    setModalVisible(true);
  }

  function closeModal() {
    setTemplateInfoInPreview(null);
    setModalVisible(false);
  }

  function goBackToTemplateList() {
    setTemplateInfoInPreview(null);
  }

  function filterTemplateByKeyword(value: string) {
    const keyword = value.toLowerCase().trim();
    setKeyword(keyword);
  }

  function renderModalTitle() {
    if (templateInfoInPreview) {
      return (
        <div className={style.modalTitleWrapper}>
          <div className={style.templateNameWrapperInPreview}>
            <ExpandThin className={style.backIcon} onClick={goBackToTemplateList} />
            <h3 className={style.modalTitle}>{templateInfoInPreview.name}</h3>
          </div>
          <Close className={style.closeIcon} onClick={closeModal} />
        </div>
      );
    }

    const smallBtnClass = classNames({
      [style.btn]: true,
      [style.selected]: listMode === 'small'
    });

    const largeBtnClass = classNames({
      [style.btn]: true,
      [style.selected]: listMode === 'large'
    });

    return (
      <div className={style.modalTitleWrapper}>
        <h3 className={style.modalTitle}>模板库</h3>
        <div className={style.buttonWrapper}>
          <Input.Search onSearch={filterTemplateByKeyword} />
          <div className={style.buttonGroup}>
            <button className={smallBtnClass} onClick={() => toggleListMode('small')}>
              <Playlist2 />
            </button>
            <button className={largeBtnClass} onClick={() => toggleListMode('large')}>
              <Menu2 />
            </button>
          </div>
          <Divider type="vertical" />
          <Close className={style.closeIcon} onClick={closeModal} />
        </div>
      </div>
    );
  }

  function toggleListMode(mode: 'small' | 'large') {
    setListMode(mode);
  }

  function previewTemplate(tplInfo: TemplateInfo) {
    setTemplateInfoInPreview(tplInfo);
  }

  async function renameTemplate(name: string) {
    await appStore.renameTemplate(selectedTemplateInfoForRename.id, name);
    await appStore.fetchTemplates();
    setSelectedTemplateInfoForRename(null);
  }

  function renderTemplatePreview(tplInfo: TemplateInfo) {
    const templatePreviewClass = classNames({
      [style.templatePreview]: true,
      [style.smallTemplatePreview]: listMode === 'small',
      [style.largeTemplatePreview]: listMode === 'large'
    });

    return (
      <div className={templatePreviewClass}>
        <div className={style.templateNameWrapper}>
          {selectedTemplateInfoForRename ? (
            <Input
              defaultValue={selectedTemplateInfoForRename.name}
              onPressEnter={e => renameTemplate(e.target.value.trim())}
              onBlur={e => renameTemplate(e.target.value.trim())}
            />
          ) : (
            <h3 className={style.templateName}>{tplInfo.name}</h3>
          )}
          {renderDropdown(tplInfo)}
        </div>
        <img className={style.templateCover} src={convertFileSrc(tplInfo.coverPath)} alt="图片加载失败" />
        <div className={style.previewBtnGroup}>
          <ConfigProvider autoInsertSpaceInButton={false}>
            <Button className={style.previewBtn} onClick={() => previewTemplate(tplInfo)}>
              预览
            </Button>
            <Button className={style.previewBtn2} type="primary" onClick={() => handleClickingTemplate(tplInfo.path)}>
              使用
            </Button>
          </ConfigProvider>
        </div>
      </div>
    );
  }

  function renderModalFooter() {
    if (!templateInfoInPreview) {
      return null;
    }
    return (
      <div className={style.modalFooter}>
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button onClick={closeModal}>取消</Button>
        </ConfigProvider>
        <Button type="primary" onClick={() => handleClickingTemplate(templateInfoInPreview.path)}>
          使用此模板
        </Button>
      </div>
    );
  }

  function renderModal() {
    const convertedList = convertList();
    const tpl = convertedList.map(item => {
      return renderTemplatePreview(item);
    });

    return (
      <Modal
        classNames={{
          header: style.modalHeader,
          footer: style.modalFooterWrapper
        }}
        wrapClassName={style.modalWrapper}
        open={modalVisible}
        title={renderModalTitle()}
        closable={false}
        maskClosable={false}
        footer={renderModalFooter}
        width={954}
      >
        {templateInfoInPreview ? (
          <div className={style.previewImageWrapper}>
            <img
              className={style.previewImage}
              src={convertFileSrc(templateInfoInPreview.coverPath)}
              alt="图片加载失败"
            />
          </div>
        ) : (
          <div className={style.modalContent}>{tpl}</div>
        )}
      </Modal>
    );
  }

  function convertList(): TemplateInfo[] {
    let convertedList = [];
    appStore.templateList.forEach(item => {
      convertedList = convertedList.concat(item.data);
    });
    if (!keyword) {
      return convertedList;
    }
    return convertedList.filter(item => {
      return item.name.toLowerCase().indexOf(keyword) > -1;
    });
  }

  function renderTemplateList() {
    const convertedList = convertList();
    const tpl = convertedList
      .filter((_, index) => index < 3)
      .map((tpl, index) => {
        return renderTemplate(tpl, index.toString());
      });
    tpl.push(
      <div className={style.moreTemplate} key={tpl.length} onClick={openModal}>
        <h3 className={style.moreTemplateTitle} onClick={openModal}>
          更多模板
        </h3>
        <div className={style.moreTemplateImage} />
      </div>
    );
    return <div className={style.templateList}>{tpl}</div>;
  }

  function handleClickingTemplate(path: string) {
    if (onApplyTemplate) {
      onApplyTemplate(path);
    }
  }

  function renderTemplate(templateInfo: TemplateInfo, key: string) {
    const { name, path, coverPath } = templateInfo;
    return (
      <div key={key} className={style.template} onClick={() => handleClickingTemplate(path)}>
        <h3 className={style.templateName}>{name}</h3>
        <img className={style.templateImage} src={convertFileSrc(coverPath)} alt="图片加载失败" />
      </div>
    );
  }

  function handleClickDropdownMenu() {
    console.log('dropdown works');
  }

  function onOpenChange(open: boolean, data: TemplateInfo) {
    if (open) {
      selectedTemplateInfoRef.current = data;
    } else {
      // 防止菜单关闭以后，快捷键依旧生效
      selectedTemplateInfoRef.current = null;
    }
  }

  function renderDropdown(data: TemplateInfo) {
    return (
      <Dropdown
        menu={generateDropDownMenu()}
        overlayClassName={style.dropdownContainer}
        destroyPopupOnHide
        onOpenChange={(open: boolean) => onOpenChange(open, data)}
        trigger={['click']}
      >
        <More
          id="dropdownBtn"
          className={style.dropDownBtn}
          onContextMenu={(e: any) => {
            e.stopPropagation();
            e.preventDefault();
            e.target.click();
          }}
        />
      </Dropdown>
    );
  }

  function selectTemplate() {
    if (selectedTemplateInfoRef.current) {
      setSelectedTemplateInfoForRename(selectedTemplateInfoRef.current);
    }
  }

  async function deleteTemplate() {
    if (selectedTemplateInfoRef.current) {
      await DbStore.deleteTemplate(selectedTemplateInfoRef.current.id);
      await fetchTemplateData();
    }
  }

  async function fetchTemplateData() {
    await appStore.fetchTemplates();
  }

  function generateDropDownMenu() {
    return {
      items: [
        {
          key: '1',
          label: (
            <div className={style.dropDownItem} onClick={selectTemplate}>
              <span>重命名</span>
              <span className={style.menuShortKey}>
                {appStore.generateShortKeyDisplayName(Scene.templateManagement, 'renameTemplate')}
              </span>
            </div>
          )
        },
        {
          key: '2',
          label: (
            <div className={style.dropDownItem} onClick={deleteTemplate}>
              <span>删除</span>
              <span className={style.menuShortKey}>
                {appStore.generateShortKeyDisplayName(Scene.templateManagement, 'deleteTemplate')}
              </span>
            </div>
          )
        }
      ],
      onClick: handleClickDropdownMenu
    };
  }

  return (
    <div className={style.main}>
      {renderTemplateList()}
      {renderModal()}
    </div>
  );
});
