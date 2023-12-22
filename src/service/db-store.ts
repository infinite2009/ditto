import Database from 'tauri-plugin-sql-api';
import { camelToSnake } from '@/util';
import { ProjectInfo } from '@/types/app-data';

export type TemplateInfo = { name: string; path: string; category: string; createdTime: number };

export default class DbStore {
  private static db;
  /**
   * 初始化数据库
   */
  static async init() {
    try {
      DbStore.db = await Database.load('sqlite:ditto.db');
      console.log('db 已加载: ', DbStore.db);
      const db = DbStore.db;
      // 创建四张表
      await Promise.all([
        db.execute(
          'CREATE TABLE IF NOT EXISTS template_info (id INTEGER PRIMARY KEY, name TEXT, path TEXT, category TEXT, created_time NUMERIC, updated_time NUMERIC)'
        ),
        db.execute(
          'CREATE TABLE IF NOT EXISTS module_info (id INTEGER PRIMARY KEY, name TEXT, path TEXT, category TEXT, created_time NUMERIC, updated_time NUMERIC)'
        ),
        db.execute(
          'CREATE TABLE IF NOT EXISTS project_info (id INTEGER PRIMARY KEY, name TEXT, path TEXT, opened_file TEXT, is_open INTEGER, is_active INTEGER, created_time NUMERIC, updated_time NUMERIC)'
        ),
        db.execute(
          'CREATE TABLE IF NOT EXISTS path_project_mapping (id INTEGER PRIMARY KEY, path TEXT, project_id INTEGER, created_time NUMERIC, updated_time NUMERIC, FOREIGN KEY (project_id) REFERENCES project_info(id))'
        )
      ]);
      // 创建表格
    } catch (err) {
      console.error(err);
    }
  }

  static async createProject(data: { name: string; path: string }) {
    const record = {
      ...data,
      isOpen: 0,
      isActive: 1,
      openedFile: ''
    };
    debugger;
    return await DbStore.insertRow('project_info', record);
  }

  static async updateProject(data: Omit<ProjectInfo, 'createdTime' | 'updatedTime'>) {
    return await DbStore.updateRow('project_info', data);
  }

  static async deleteProject(id: number) {
    await DbStore.deleteRow('project_info', id);
  }

  static async selectProjects() {
    return await DbStore.selectRows('project_info');
  }

  static async createTemplate(data: Omit<TemplateInfo, 'id' | 'createdTime' | 'updatedTime'>) {
    return await DbStore.insertRow('template_info', data);
  }

  static async deleteTemplate(id: number) {
    await DbStore.deleteRow('template_info', id);
  }

  static async updateTemplate(data: Omit<TemplateInfo, 'createdTime' | 'updatedTime'>) {
    const cp = { ...data };
    return await DbStore.updateRow('template_info', data);
  }

  static async selectTemplates() {
    return await DbStore.selectRows('template_info');
  }

  static async createModule(data: Record<string, any>) {
    return await DbStore.insertRow('module_info', data);
  }

  static async deleteModule(id: number) {
    await DbStore.deleteRow('module_info', id);
  }

  static async updateModule(data: Record<string, any>) {
    return await DbStore.updateRow('module_info', data);
  }

  static async selectModules() {
    return await DbStore.selectRows('module_info');
  }

  static async createPathProjectMapping(data: Record<string, any>) {
    return await DbStore.insertRow('path_project_mapping', data);
  }

  static async deletePathProjectMapping(id: number) {
    await DbStore.deleteRow('path_project_mapping', id);
  }
  static async updatePathProjectMapping(data: Record<string, any>) {
    return await DbStore.updateRow('path_project_mapping', data);
  }

  static async selectPathProjectMappingList() {
    return await DbStore.selectRows('path_project_mapping');
  }

  /**
   * 工具性质的静态方法，value 要具体调用的函数处理下默认值问题
   * @param tableName
   * @param data
   */
  private static async insertRow<T = any>(tableName: string, data: T) {
    debugger;
    const keysStr = Object.keys(data)
      .map(key => camelToSnake(key))
      .join(', ');
    const dataStr = Object.values(data)
      .map(val => (typeof val === 'string' ? `'${val}'` : val))
      .join(', ');
    const insertSql = `INSERT INTO ${tableName} (${keysStr}) VALUES (${dataStr})`;
    console.log('insert sql: ', insertSql);
    return await DbStore.db.execute(insertSql);
  }

  private static async updateRow(tableName: string, data: Record<string, any>) {
    const setClause = Object.keys(data)
      .filter(key => key !== 'created_time' && key !== 'updated_time')
      .map(key => `${camelToSnake(key)} = ${data[key]}`)
      .concat(`updated_time = ${new Date().getTime()}`)
      .join(', ');
    const updateSql = `UPDATE ${tableName} SET ${setClause} WHERE id = ${data.id}`;
    return await DbStore.db.execute(updateSql);
  }

  private static async deleteRow(tableName: string, id: number) {
    const deleteSql = `DELETE FROM ${tableName} WHERE id = ${id}`;
    await DbStore.db.execute(deleteSql);
  }

  private static async selectRows(tableName: string, id: number = undefined) {
    const selectSql = `SELECT * FROM ${tableName} ${id ? `WHERE id=${id}` : ''}`;
    return await DbStore.db.execute(selectSql);
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
