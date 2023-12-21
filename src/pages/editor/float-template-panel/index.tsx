import { useTemplateData } from '@/hooks';
import style from './index.module.less';
import { TemplateInfo } from '@/service/db-store';

export interface IFloatTemplatePanelProps {
  onApplyTemplate: (path: string) => void;
}

export default function FloatTemplatePanel({ onApplyTemplate }: IFloatTemplatePanelProps) {
  const tplList = useTemplateData();

  function renderTemplateList() {
    let convertedList = [];
    tplList.forEach(item => {
      convertedList = convertedList.concat(item.data);
    });
    console.log('convertedList: ', convertedList);
    const tpl = convertedList.map((tpl, index) => {
      return renderTemplate(tpl, index.toString());
    });
    tpl.push(
      <div className={style.moreTemplate}>
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
}
