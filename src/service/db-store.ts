import Database from 'tauri-plugin-sql-api';

export type TemplateInfo = { name: string; path: string; category: string; createdTime: number };

export default class DbStore {
  /**
   * 初始化数据库
   */
  static async init() {
    const tableCreationSql = 'CREATE TABLE template (name TEXT, category TEXT, createdTime NUMERIC, path TEXT)';
    try {
      const db = await Database.load('sqlite:ditto.db');
      console.log('db 已加载: ', db);
    } catch (err) {
      console.error(err);
    }
  }

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
