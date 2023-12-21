import { useEffect, useState } from 'react';
import DbStore, { TemplateInfo } from '@/service/db-store';

export function useTemplateData() {
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
  return tplList;
}
