import { useEffect, useState } from 'react';
import DbStore, { TemplateInfo } from '@/service/db-store';

import style from './index.module.less';

export interface ITemplatePanelProps {
  onApplyTemplate: (path: string) => void;
}

export default function TemplatePanel({ onApplyTemplate }: ITemplatePanelProps) {
  const [tplList, setTplList] = useState<{ category: string; data: TemplateInfo[] }[]>([]);
  useEffect(() => {
    fetchTemplateData().then();
  }, []);

  /**
   * 获取模板的数据
   */
  async function fetchTemplateData() {
    const res = await DbStore.fetchTemplates();
    if (!res.length) {
      setTplList([]);
    } else {
      const dataTmp: Record<string, { category: string; data: TemplateInfo[] }> = {};
      res.forEach(item => {
        if (!dataTmp[item.category]) {
          dataTmp[item.category] = {
            category: item.category,
            data: []
          };
        }
        dataTmp[item.category].data.push(item);
      });
      setTplList(Object.values(dataTmp));
    }
  }

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
