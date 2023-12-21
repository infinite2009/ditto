import { TemplateInfo } from '@/service/db-store';

import style from './index.module.less';
import { useEffect, useState } from 'react';

export interface ITemplatePanelProps {
  onApplyModule: (path: string) => void;
}

export default function ModulePanel({ onApplyModule }: ITemplatePanelProps) {
  const [moduleList, setModuleList] = useState<any[]>([]);

  useEffect(() => {
    fetchModuleData().then();
  }, []);

  async function fetchModuleData() {
    const res = await new Promise(resolve => resolve([]));
    setModuleList(res as any[]);
  }

  function renderModuleList() {
    return <div>敬请期待</div>;
  }

  function handleClickingModule(path: string) {
    if (onApplyModule) {
      onApplyModule(path);
    }
  }

  function renderModule(templateInfo: TemplateInfo, key: string) {
    const { name, path } = templateInfo;
    return (
      <div key={key} className={style.module} onClick={() => handleClickingModule(path)}>
        <div className={style.moduleImage} />
        <h3 className={style.moduleName}>{name}</h3>
      </div>
    );
  }

  return <div className={style.main}>{renderModuleList()}</div>;
}
