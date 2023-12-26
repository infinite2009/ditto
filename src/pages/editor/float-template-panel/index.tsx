import { TemplateInfo } from '@/service/db-store';
import { observer } from 'mobx-react';
import style from './index.module.less';
import { AppStoreContext } from '@/hooks/context';
import { useContext } from 'react';

export interface IFloatTemplatePanelProps {
  onApplyTemplate: (path: string) => void;
}

export default observer(function FloatTemplatePanel({ onApplyTemplate }: IFloatTemplatePanelProps) {
  const appStore = useContext(AppStoreContext);

  function renderTemplateList() {
    let convertedList = [];
    appStore.templateList.forEach(item => {
      convertedList = convertedList.concat(item.data);
    });
    console.log('convertedList: ', convertedList);
    const tpl = convertedList.map((tpl, index) => {
      return renderTemplate(tpl, index.toString());
    });
    tpl.push(
      <div className={style.moreTemplate} key={tpl.length}>
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
