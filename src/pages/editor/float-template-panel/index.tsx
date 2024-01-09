import { TemplateInfo } from '@/service/db-store';
import { observer } from 'mobx-react';
import { AppStoreContext } from '@/hooks/context';
import { useContext, useState } from 'react';
import { Button, ConfigProvider, Divider, Input, Modal } from 'antd';
import style from './index.module.less';
import { Close, ExpandThin } from '@/components/icon';
import { convertFileSrc } from '@tauri-apps/api/tauri';

export interface IFloatTemplatePanelProps {
  onApplyTemplate: (path: string) => void;
}

export default observer(function FloatTemplatePanel({ onApplyTemplate }: IFloatTemplatePanelProps) {
  const appStore = useContext(AppStoreContext);

  const [keyword, setKeyword] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [templateInfoInPreview, setTemplateInfoInPreview] = useState<TemplateInfo>(null);

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
          <div className={style.templateNameWrapper}>
            <ExpandThin className={style.backIcon} onClick={goBackToTemplateList} />
            <h3 className={style.modalTitle}>{templateInfoInPreview.name}</h3>
          </div>
          <Close className={style.closeIcon} onClick={closeModal} />
        </div>
      );
    }
    return (
      <div className={style.modalTitleWrapper}>
        <h3 className={style.modalTitle}>模板库</h3>
        <div className={style.buttonWrapper}>
          <Input.Search onSearch={filterTemplateByKeyword} />
          <div className={style.buttonGroup}>
            <Button>1</Button>
            <Button>2</Button>
          </div>
          <Divider type="vertical" />
          <Close className={style.closeIcon} onClick={closeModal} />
        </div>
      </div>
    );
  }

  function previewTemplate(tplInfo: TemplateInfo) {
    setTemplateInfoInPreview(tplInfo);
  }

  function renderTemplatePreview(tplInfo: TemplateInfo) {
    return (
      <div className={style.templatePreview}>
        <h3 className={style.templateName}>{tplInfo.name}</h3>
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

  function renderPreview() {
    return (
      <Modal>
        <div> template preview works!</div>
      </Modal>
    );
  }

  return (
    <div className={style.main}>
      {renderTemplateList()}
      {renderModal()}
    </div>
  );
});
