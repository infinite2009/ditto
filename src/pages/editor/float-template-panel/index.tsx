import { TemplateInfo } from '@/service/db-store';
import { observer } from 'mobx-react';
import { AppStoreContext } from '@/hooks/context';
import { useContext, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import style from './index.module.less';

export interface IFloatTemplatePanelProps {
  onApplyTemplate: (path: string) => void;
}

export default observer(function FloatTemplatePanel({ onApplyTemplate }: IFloatTemplatePanelProps) {
  const appStore = useContext(AppStoreContext);

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  function openModal() {
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
  }

  function renderModalTitle() {
    return (
      <div className={style.modalTitleWrapper}>
        <span>模板库</span>
        <div>
          <Input />
          <div>
            <Button>1</Button>
            <Button>2</Button>
          </div>
        </div>
      </div>
    );
  }

  function renderModal() {
    return (
      <Modal open={modalVisible} title={renderModalTitle()}>
        <div className={style.modalContent}></div>
      </Modal>
    );
  }

  function renderTemplateList() {
    let convertedList = [];
    appStore.templateList.forEach(item => {
      convertedList = convertedList.concat(item.data);
    });
    const tpl = convertedList
      .filter((_, index) => index < 3)
      .map((tpl, index) => {
        return renderTemplate(tpl, index.toString());
      });
    tpl.push(
      <div className={style.moreTemplate} key={tpl.length} onClick={openModal}>
        <h3 className={style.moreTemplateTitle}>更多模板</h3>
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
    const { name, path } = templateInfo;
    return (
      <div key={key} className={style.template} onClick={() => handleClickingTemplate(path)}>
        <h3 className={style.templateName}>{name}</h3>
        <div className={style.templateImage} />
      </div>
    );
  }

  return <div className={style.main}>{renderTemplateList()}</div>;
});
