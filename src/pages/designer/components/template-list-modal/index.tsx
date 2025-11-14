import { Button, ConfigProvider, Divider, Dropdown, Input, Modal } from 'antd';
import style from '@/pages/editor/float-template-panel/index.module.less';
import React, { useContext, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { Close, CloseThin, ExpandThin, Menu2, More, Ok, Playlist2, SearchIcon } from '@/components/icon';
import classNames from 'classnames';
import { TemplateInfo } from '@/service/db-store';
import { IFloatTemplatePanelProps } from '@/pages/editor/float-template-panel';
import { AppStoreContext } from '@/hooks/context';
import NewFileManager from '@/service/new-file-manager';
import { Scene } from '@/service/app-store';
import { CloseOutlined } from '@ant-design/icons';

export interface TemplateListModalProps extends IFloatTemplatePanelProps {
  onClose: () => void;
  open: boolean;
}

function TemplateListModal({ open, onClose, onApplyTemplate }: TemplateListModalProps) {
  const appStore = useContext(AppStoreContext);

  const [keyword, setKeyword] = useState<string>('');
  const [listMode, setListMode] = useState<'small' | 'large'>('small');
  const [selectedTemplateInfoForRename, setSelectedTemplateInfoForRename] = useState<TemplateInfo>(null);
  const [templateInfoInPreview, setTemplateInfoInPreview] = useState<TemplateInfo>(null);

  const selectedTemplateInfoRef = useRef<TemplateInfo>(null);
  const templateNameRef = useRef<string>('');

  function closeModal() {
    setTemplateInfoInPreview(null);
    onClose?.();
  }

  function goBackToTemplateList() {
    setTemplateInfoInPreview(null);
  }

  function filterTemplateByKeyword(e: any) {
    const keyword = e.target.value.toLowerCase().trim();
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
          <Input
            classNames={{
              input: style.pageSearch,
              prefix: style.pageSearchPrefix
            }}
            placeholder="搜索页面..."
            addonBefore={<SearchIcon />}
            variant="borderless"
            onPressEnter={filterTemplateByKeyword}
          />
          <div className={style.buttonGroup}>
            <button className={smallBtnClass} onClick={() => toggleListMode('small')}>
              <Playlist2 />
            </button>
            <button className={largeBtnClass} onClick={() => toggleListMode('large')}>
              <Menu2 />
            </button>
          </div>
          <Divider className={style.divider} type="vertical" />
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
    if (!name) {
      setSelectedTemplateInfoForRename(null);
      return;
    }
    await NewFileManager.renameTemplate(selectedTemplateInfoForRename.id, name);
    await fetchTemplateList();
    setSelectedTemplateInfoForRename(null);
  }

  function resetRenaming() {
    templateNameRef.current = '';
    setSelectedTemplateInfoForRename(null);
  }

  function renderTemplatePreview(tplInfo: TemplateInfo) {
    if (!tplInfo) {
      return null;
    }
    const templatePreviewClass = classNames({
      [style.templatePreview]: true,
      [style.smallTemplatePreview]: listMode === 'small',
      [style.largeTemplatePreview]: listMode === 'large'
    });

    return (
      <div key={tplInfo.id} className={templatePreviewClass}>
        {selectedTemplateInfoForRename?.id === tplInfo.id ? (
          <div className={style.renameWrapper}>
            <Input
              className={style.renameInput}
              defaultValue={selectedTemplateInfoForRename.name}
              onInput={(e: any) => (templateNameRef.current = e.target.value.trim())}
              onPressEnter={(e: any) => renameTemplate(e.target.value.trim())}
            />
            <div className={style.renameIconWrapper}>
              <Ok
                className={classNames({ [style.renameIcon]: true, [style.okIcon]: true })}
                onClick={() => renameTemplate(templateNameRef.current)}
              />
              <CloseThin className={style.renameIcon} onClick={resetRenaming} />
            </div>
          </div>
        ) : (
          <div className={style.templateNameWrapper}>
            <h3 className={style.templateName}>{tplInfo.name}</h3>
            {renderDropdown(tplInfo)}
          </div>
        )}

        <img className={style.templateCover} src={tplInfo.coverUrl} alt="图片加载失败" />
        <div className={style.previewBtnGroup}>
          <ConfigProvider
            button={{
              autoInsertSpace: false
            }}
          >
            <Button className={style.previewBtn} onClick={() => previewTemplate(tplInfo)}>
              预览
            </Button>
            <Button
              className={style.previewBtn2}
              type="primary"
              onClick={() => handleClickingTemplate(tplInfo.templateUrl)}
            >
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
        <ConfigProvider
          button={{
            autoInsertSpace: false
          }}
        >
          <Button onClick={closeModal}>取消</Button>
        </ConfigProvider>
        <Button type="primary" onClick={() => handleClickingTemplate(templateInfoInPreview.templateUrl)}>
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
        open={open}
        title={renderModalTitle()}
        closable={false}
        maskClosable={false}
        footer={renderModalFooter}
        width={954}
      >
        {templateInfoInPreview ? (
          <div className={style.previewImageWrapper}>
            <img className={style.previewImage} src={templateInfoInPreview.coverUrl} alt="图片加载失败" />
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

  function handleClickingTemplate(url: string) {
    if (onApplyTemplate) {
      onApplyTemplate(url);
    }
  }

  function handleClickDropdownMenu() {
    console.log('dropdown works');
  }

  function onOpenChange(open: boolean, data: TemplateInfo, info: { source: string }) {
    if (open) {
      selectedTemplateInfoRef.current = data;
    } else {
      if (info.source === 'trigger') {
        // 防止菜单关闭以后，快捷键依旧生效
        selectedTemplateInfoRef.current = null;
      }
    }
  }

  function renderDropdown(data: TemplateInfo) {
    return (
      <Dropdown
        menu={generateDropDownMenu()}
        overlayClassName={style.dropdownContainer}
        destroyOnHidden
        onOpenChange={(open: boolean, info) => onOpenChange(open, data, info)}
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
      await NewFileManager.deleteTemplate(selectedTemplateInfoRef.current.id);
      await fetchTemplateList();
    }
  }

  async function fetchTemplateList() {
    await appStore.fetchTemplates();
  }

  function showDeleteConfirm() {
    Modal.confirm({
      title: <h3 className={style.modalTitle}>删除项目</h3>,
      icon: null,
      content: <p className={style.deleteLateral}>确认要删除 “{selectedTemplateInfoRef.current.name}” 吗？</p>,
      onOk: () => {
        return deleteTemplate();
      },
      okText: '确认删除',
      okButtonProps: { color: 'danger', danger: true, style: { borderRadius: 8 } },
      closeIcon: <CloseOutlined className={style.modalCloseIcon} />,
      closable: true,
      cancelText: '取消',
      focusTriggerAfterClose: false,
      autoFocusButton: null
    });
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
            <div className={style.dropDownItem} onClick={showDeleteConfirm}>
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

  return renderModal();
}

TemplateListModal.displayName = 'TemplateListModal';

export default observer(TemplateListModal);
