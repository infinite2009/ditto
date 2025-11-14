import { TemplateInfo } from '@/service/db-store';
import { observer } from 'mobx-react';
import { AppStoreContext } from '@/hooks/context';
import React, { useContext, useState } from 'react';
import style from './index.module.less';
import TemplateListModal from '@/pages/designer/components/template-list-modal';

export interface IFloatTemplatePanelProps {
  onApplyTemplate: (path: string) => void;
}

function FloatTemplatePanel({ onApplyTemplate }: IFloatTemplatePanelProps) {
  const appStore = useContext(AppStoreContext);

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  function openModal() {
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
  }

  function convertList(): TemplateInfo[] {
    let convertedList = [];
    appStore.templateList.forEach(item => {
      convertedList = convertedList.concat(item.data);
    });
    return convertedList;
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
        <div className={style.moreTemplateImage} />
        <h3 className={style.moreTemplateTitle} onClick={openModal}>
          更多模板
        </h3>
      </div>
    );
    return <div className={style.templateList}>{tpl}</div>;
  }

  function handleClickingTemplate(url: string) {
    if (onApplyTemplate) {
      onApplyTemplate(url);
    }
  }

  function renderTemplate(templateInfo: TemplateInfo, key: string) {
    const { name, templateUrl, coverUrl } = templateInfo;
    return (
      <div key={key} className={style.template} onClick={() => handleClickingTemplate(templateUrl)}>
        <h3 className={style.templateName}>{name}</h3>
        <img className={style.templateImage} src={coverUrl} alt="图片加载失败" />
      </div>
    );
  }

  return (
    <div className={style.floatTemplatePanel}>
      {renderTemplateList()}
      <TemplateListModal open={modalVisible} onApplyTemplate={onApplyTemplate} onClose={closeModal} />
    </div>
  );
}

FloatTemplatePanel.displayName = 'FloatTemplatePanel';

export default observer(FloatTemplatePanel);
