import Database from 'tauri-plugin-sql-api';
import { camelToSnake, snakeToCamel } from '@/util';
import { ProjectInfo } from '@/types/app-data';
import { nanoid } from 'nanoid';
import { appLocalDataDir, join } from '@tauri-apps/api/path';

export type TemplateInfo = {
  id: string;
  name: string;
  path: string;
  coverPath: string;
  category: string;
  createdTime: number;
  updatedTime: number;
};

export default class DbStore {
  private static db;

  static async createModule(data: Record<string, any>) {
    return await DbStore.insertRow('module_info', data);
  }

  static async createPathProjectMapping(data: Record<string, any>) {
    return await DbStore.insertRow('path_project_mapping', data);
  }

  static async createProject(data: { name: string; path: string }) {
    const record = {
      isOpen: 0,
      isActive: 1,
      openedFile: '',
      ...data
    };
    return await DbStore.insertRow('project_info', record);
  }

  static async createTemplate(data: Omit<TemplateInfo, 'id' | 'createdTime' | 'updatedTime'>) {
    return await DbStore.insertRow('template_info', data);
  }

  static async deleteModule(id: string) {
    await DbStore.deleteRow('module_info', id);
  }

  static async deletePathProjectMapping(path: string, projectId: string) {
    await DbStore.db.execute(
      `DELETE FROM path_project_mapping WHERE path = '${path.replace(/\\/g, '\\\\')}' AND project_id = '${projectId}'`
    );
  }

  static async deleteProject(id: string) {
    await DbStore.deleteRow('project_info', id);
  }

  static async deleteTemplate(id: string) {
    await DbStore.deleteRow('template_info', id);
  }

  static async fetchTemplates(): Promise<TemplateInfo[]> {
    return await DbStore.selectTemplates();
  }

  /**
   * 初始化数据库
   */
  static async init() {
    try {
      DbStore.db = await Database.load(`sqlite:${await join(await appLocalDataDir(), 'voltron.db')}`);
      console.log('db 已加载: ', DbStore.db);
      const db = DbStore.db;
      // 创建四张表
      await Promise.all([
        db.execute(
          'CREATE TABLE IF NOT EXISTS template_info (id TEXT NOT NULL, name TEXT, path TEXT, cover_path TEXT, category TEXT, created_time NUMERIC, updated_time NUMERIC, PRIMARY KEY (id))'
        ),
        db.execute(
          'CREATE TABLE IF NOT EXISTS module_info (id TEXT NOT NULL, name TEXT, path TEXT, category TEXT, created_time NUMERIC, updated_time NUMERIC, PRIMARY KEY (id))'
        ),
        db.execute(
          'CREATE TABLE IF NOT EXISTS project_info (id TEXT NOT NULL, name TEXT, path TEXT, opened_file TEXT, is_open INTEGER, is_active INTEGER, created_time NUMERIC, updated_time NUMERIC, PRIMARY KEY (id))'
        ),
        db.execute(
          'CREATE TABLE IF NOT EXISTS path_project_mapping (id TEXT NOT NULL, path TEXT, project_id INTEGER, created_time NUMERIC, updated_time NUMERIC, FOREIGN KEY (project_id) REFERENCES project_info(id), PRIMARY KEY (id))'
        )
      ]);
      // 创建表格
    } catch (err) {
      console.error(err);
    }
  }

  static async selectModules(conditions: Record<string, any> = {}) {
    return await DbStore.selectRows('module_info', conditions);
  }

  static async selectPathProjectMappingList(conditions: Record<string, any> = {}) {
    return await DbStore.selectRows('path_project_mapping', conditions);
  }

  static async selectProjects(conditions: Record<string, any> = {}) {
    const conditionsCp = { ...conditions };
    if (conditionsCp.isActive === true) {
      conditionsCp.isActive = 1;
    } else if (conditionsCp.isActive === false) {
      conditionsCp.isActive = 0;
    }
    if (conditionsCp.isOpen === true) {
      conditionsCp.isOpen = 1;
    } else if (conditionsCp.isOpen === false) {
      conditionsCp.isOpen = 0;
    }
    const result = await DbStore.selectRows('project_info', conditionsCp);
    // 修改布尔值
    result.forEach(item => {
      item.isOpen = !!item.isOpen;
      item.isActive = !!item.isActive;
    });
    return result;
  }

  static async selectTemplates(conditions: Record<string, any> = {}) {
    return await DbStore.selectRows('template_info', conditions);
  }

  static async updateModule(data: Record<string, any>) {
    return await DbStore.updateRow('module_info', data);
  }

  static async updatePathProjectMapping(data: Record<string, any>) {
    return await DbStore.updateRow('path_project_mapping', data);
  }

  static async updateProject(data: Partial<ProjectInfo>) {
    return await DbStore.updateRow('project_info', data);
  }

  static async updateTemplate(data: Omit<Partial<TemplateInfo>, 'createdTime' | 'updatedTime'>) {
    const cp = { ...data };
    return await DbStore.updateRow('template_info', data);
  }

  private static async deleteRow(tableName: string, id: string) {
    const deleteSql = `DELETE FROM ${tableName} WHERE id = '${id}'`;
    console.log('delete sql: ', deleteSql);
    await DbStore.db.execute(deleteSql);
  }

  /**
   * 工具性质的静态方法，value 要具体调用的函数处理下默认值问题
   * @param tableName
   * @param data
   */
  private static async insertRow<T = any>(tableName: string, data: T) {
    const id = nanoid();
    const keysStr = Object.keys(data)
      .map(key => camelToSnake(key))
      .concat(['created_time', 'updated_time'])
      .concat(['id'])
      .join(', ');
    const dataStr = Object.values(data)
      .map(val => (typeof val === 'string' ? `'${val}'` : val))
      .concat([new Date().getTime(), new Date().getTime()])
      .concat([`'${id}'`])
      .join(', ');

    // 处理其中的路径分隔符
    const insertSql = `INSERT INTO ${tableName} (${keysStr}) VALUES (${dataStr})`.replace(/\\/g, '\\\\');
    await DbStore.db.execute(insertSql);
    const project = (await DbStore.selectRows(tableName, { id }))[0];
    console.log('插入结果：', project);
    return project;
  }

  private static async selectPathProjectMapping(path: string) {
    return await DbStore.db.execute('SELECT * FROM path_project_mapping WHERE path=');
  }

  private static async selectRows(tableName: string, conditions: Record<string, any> = {}) {
    const conditionsStr = Object.entries(conditions)
      .map(([name, value]) => {
        if (typeof value === 'string') {
          return `${camelToSnake(name)}='${value}'`;
        }
        return `${camelToSnake(name)}=${value}`;
      })
      .join(' AND ');

    const selectSql = `SELECT * FROM ${tableName} ${conditionsStr ? `WHERE ${conditionsStr}` : ''}`;
    const result = await DbStore.db.select(selectSql);
    return result.map(item => {
      const newItem = {};
      Object.keys(item).forEach(key => {
        newItem[snakeToCamel(key)] = item[key];
      });
      return newItem;
    });
  }

  private static async updateRow(tableName: string, data: Record<string, any>) {
    const setClause = Object.keys(data)
      .filter(key => key !== 'created_time' && key !== 'updated_time' && key !== 'id')
      .map(key => {
        if (typeof data[key] === 'string') {
          return `${camelToSnake(key)} = '${data[key]}'`;
        }
        return `${camelToSnake(key)} = ${data[key]}`;
      })
      .concat(`updated_time = ${new Date().getTime()}`)
      .join(', ');
    const updateSql = `UPDATE ${tableName} SET ${setClause} WHERE id = '${data.id}'`;
    return await DbStore.db.execute(updateSql);
  }
}
