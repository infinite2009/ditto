import { TemplateInfo } from '@/service/db-store';

import style from './index.module.less';
import { useTemplateData } from '@/hooks';

export interface ITemplatePanelProps {
  onApplyTemplate: (path: string) => void;
}

export default function TemplatePanel({ onApplyTemplate }: ITemplatePanelProps) {
  const tplList = useTemplateData();

  function renderTemplateList() {
    return tplList.map(item => {
      return (
        <div key={item.category}>
          <h3 className={style.categoryTitle}>{item.category}</h3>
          <div className={style.templateList}>
            {item.data.map((tpl, index) => {
              return renderTemplate(tpl, index.toString());
            })}
          </div>
        </div>
      );
    });
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
        <div className={style.templateImage} />
        <h3 className={style.templateName}>{name}</h3>
      </div>
    );
  }

  return <div className={style.main}>{renderTemplateList()}</div>;
}
