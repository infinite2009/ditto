export type TemplateInfo = { name: string; path: string; category: string; createdTime: number };

export default class DbStore {
  static async fetchTemplates(): Promise<TemplateInfo[]> {
    return await new Promise(resolve => {
      resolve([
        {
          name: '测试模板1',
          path: '/Users/luodongyang/Library/Application Support/com.ditto.dev/templates/GzkmgPXoxRxKv25LfmKDf.dtpl',
          category: '基础',
          createdTime: new Date().getTime()
        },
        {
          name: '测试模板2',
          path: '/Users/luodongyang/Library/Application Support/com.ditto.dev/templates/GzkmgPXoxRxKv25LfmKDf.dtpl',
          category: '基础',
          createdTime: new Date().getTime()
        },
        {
          name: '测试模板3',
          path: '/Users/luodongyang/Library/Application Support/com.ditto.dev/templates/GzkmgPXoxRxKv25LfmKDf.dtpl',
          category: '基础',
          createdTime: new Date().getTime()
        },
        {
          name: '测试模板4',
          path: '/Users/luodongyang/Library/Application Support/com.ditto.dev/templates/nldqMWdh3-KerN18bs2df.dtpl',
          category: '列表页',
          createdTime: new Date().getTime()
        }
      ]);
    });
  }
}
