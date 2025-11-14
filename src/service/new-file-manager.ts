import { PageInfo, ProjectInfo } from '@/types/app-data';
import DbStore from '@/service/db-store';
import { customFetch, isEmpty, isWeb, stringToFile } from '@/util';
import DSLStore from '@/service/dsl-store';
import IPageSchema from '@/types/page.schema';
import {
  getVoltronModuleListAll,
  type GetVoltronPageDetail,
  getVoltronPageDetail,
  postVoltronCommentCreate,
  postVoltronCommentDelete,
  postVoltronCommentList,
  postVoltronCommentUpdate,
  postVoltronCommonBfsUpload,
  postVoltronCommonProxy,
  postVoltronModuleCreate,
  postVoltronPageCreate,
  postVoltronPageDelete,
  postVoltronPageList,
  postVoltronPageUpdate,
  postVoltronProjectCreate,
  postVoltronProjectDelete,
  postVoltronProjectList,
  postVoltronProjectUpdate,
  postVoltronTemplateCreate,
  postVoltronTemplateDelete,
  postVoltronTemplateList,
  postVoltronTemplateUpdate
} from '@/api';
import { NewProjectFormData } from '@/pages/project-management/components/new-project-modal';

export default class NewFileManager {
  private static accessToken: string;

  static async clearSelectedPage(projectId: string) {
    await DbStore.updateProject({
      id: projectId,
      openedPage: ''
    });
  }

  /**
   * 关闭项目
   *
   * @param projectId
   */
  static async closeProject(projectId: string) {
    return await DbStore.updateProject({
      id: projectId,
      isOpen: false,
      isActive: false
    });
  }

  /**
   * 发布评论
   */
  static async createComment(data: {
    comment: string;
    pageId: string;
    componentId: string;
    top: number;
    left: number;
  }) {
    const { comment, pageId, componentId, top, left } = data;
    await postVoltronCommentCreate({
      pageId,
      componentId,
      positionTop: top,
      positionLeft: left,
      content: comment
    });
  }

  static async createPage(projectId: string, dsl?: IPageSchema, pageName?: string) {
    const pageNameInner = pageName || '新建页面';
    const dslStoreService = new DSLStore();
    if (dsl) {
      dslStoreService.initDSL(dsl);
    } else {
      dslStoreService.createEmptyDSL(pageNameInner, '');
    }
    const batchKey = await NewFileManager.uploadDSLFile(JSON.stringify(dslStoreService.dsl));
    if (batchKey) {
      // 创建页面记录
      await postVoltronPageCreate({
        projectId: projectId,
        dslUrlBatchKey: batchKey,
        name: pageNameInner
      });
    }
  }

  /**
   * 创建项目
   *
   * @name string 项目名称
   */
  static async createProject(payload: NewProjectFormData) {
    const { name, repoUrl, branch, componentPath, platform } = payload;
    const { data } = await postVoltronProjectCreate({
      name,
      customCodeRepoSlug: repoUrl,
      customCodeRepoBranch: branch,
      customCodeRepoComponentPath: componentPath,
      projectPlatform: platform
    });
    const project = data;
    if (!isWeb()) {
      await DbStore.createProject({
        id: project.id,
        name: project.name,
        customCodeRepoSlug: repoUrl,
        customCodeRepoBranch: branch,
        customCodeRepoComponentPath: componentPath,
        projectPlatform: platform
      });
    }
    return project;
  }

  /**
   * 测试登录
   */
  // static async testDashboard(): Promise<any> {
  //   return await customFetch('http://uat-ee.bilibili.co/api/gundam-api/dag/do', {
  //     headers: {
  //       'BEE-projectId': '340',
  //       'BEE-dagCode': '19b6af62d000200'
  //     }
  //   });
  // }

  /**
   * 创建模板
   */
  static async createTemplate({
    templatePageName,
    templateBatchKey,
    coverBatchKey,
    projectId
  }: {
    templatePageName: string;
    templateBatchKey: string;
    coverBatchKey: string;
    projectId?: string;
  }) {
    await postVoltronTemplateCreate({
      projectId: projectId,
      name: templatePageName || '新建模版',
      templateUrl: templateBatchKey,
      coverUrl: coverBatchKey
    });
  }

  static async deactivateLocalProject() {
    const activeProject = await NewFileManager.fetchActiveProject();
    if (activeProject) {
      await DbStore.updateProject({
        id: activeProject.id,
        isActive: false
      });
    }
  }

  /**
   * 删除评论
   *
   * @param id
   */
  static async deleteComment(id: string) {
    await postVoltronCommentDelete({
      commentId: id
    });
  }

  /**
   * 删除页面
   */
  static async deletePage(pageId: string) {
    await postVoltronPageDelete({
      pageId
    });
  }

  /**
   * 删除项目
   *
   * @param project
   */
  static async deleteProject(project: ProjectInfo): Promise<void> {
    await postVoltronProjectDelete({
      projectId: project.id
    });
    if (!isWeb()) {
      await DbStore.deleteProject(project.id);
      await this.closeProject(project.id);
    }
  }

  /**
   * 删除模板
   */
  static async deleteTemplate(id: string) {
    await postVoltronTemplateDelete({
      templateId: id
    });
  }

  static async fetchActiveProject(): Promise<ProjectInfo> {
    if (isWeb()) {
      return null;
    }
    const result = await DbStore.selectProjects({ isActive: true });
    if (result.length) {
      return result[0];
    }
    return null;
  }

  /**
   * 查询评论列表
   *
   * @param pageId
   */
  static async fetchCommentList(pageId: string) {
    const { data } = await postVoltronCommentList({
      pageId
    });
    return data ?? [];
  }

  static async fetchDSL(dslURL: string) {
    const dslRes = await postVoltronCommonProxy({
      url: dslURL,
      headers: { 'X-CSRF': undefined }
    });
    return dslRes.data;
  }

  static async fetchDSLByPageId(pageId: string) {
    const pageData = await NewFileManager.fetchPageDetail(pageId);
    if (pageData.dslUrl) {
      return {
        dsl: await NewFileManager.fetchDSL(pageData.dslUrl),
        data: pageData
      };
    }
    return {
      data: pageData
    };
  }

  static async fetchDSLFragmentList(name?: string) {
    const { data } = await getVoltronModuleListAll({ name });
    return data.list || [];
  }

  /**
   * 从 akali 获取接口定义
   *
   * @param appId
   */
  static async fetchInterfacesByAppId(appId: string) {
    if (isWeb()) {
      const res = await postVoltronCommonProxy({
        url: `https://cloud.bilibili.co/akaling/openapi/v1/iface/list/inApp?appid=${appId}`,
        method: 'GET'
      });
      return res.data.items || [];
    }
    const res = await customFetch<{ items: any[] }>(
      `https://cloud.bilibili.co/akaling/openapi/v1/iface/list/inApp?appid=${appId}`,
      {
        method: 'GET'
      }
    );
    return res.data.items || [];
  }

  /**
   * 从 akali 获取当前接口的定义详情
   *
   * @param interfaceId
   */
  static async fetchInterfacesDetail(interfaceId: string) {
    const res = await customFetch<{
      contract: {
        respBodyJson: {
          respBodyJson: {
            properties: {
              data: any;
            };
          };
        };
      };
    }>(`https://cloud.bilibili.co/akaling/v1/iface/${interfaceId}`, {
      method: 'GET'
    });
    return res.data.contract.respBodyJson.respBodyJson.properties.data;
  }

  static async fetchLocalProject(projectId: string) {
    const projects = await DbStore.selectProjects({ id: projectId });
    if (!projects.length) {
      return null;
    }
    return projects[0];
  }

  static async fetchOpenedProjects() {
    // TODO: need implementation
    if (isWeb()) {
      return [];
    }
    const projects = await DbStore.selectProjects();
    return projects.filter((item: ProjectInfo) => item.isOpen);
  }

  static async fetchPageDetail(pageId: string) {
    const { data } = await getVoltronPageDetail({
      pageId
    });
    const pageData: GetVoltronPageDetail.Res & {
      dslUrl?: string;
    } = data;
    if (pageData.dslUrlBatchKey) {
      const url = await this.fetchUrl(pageData.dslUrlBatchKey);
      if (url) {
        pageData.dslUrl = url;
      }
    }
    return pageData;
  }

  /**
   * 查询当前项目下的所有页面
   *
   * 这个改动目前还是半成品，之后会
   */
  static async fetchPages(projectId: string): Promise<PageInfo[]> {
    // 查询这个项目所有的页面
    const { data } = await postVoltronPageList({
      projectId
    });
    const list = data.map(i => ({
      ...i,
      id: i.pageId
    }));
    return isEmpty(list) ? [] : list;
  }

  /**
   * 查询项目列表
   */
  static async fetchProjects(): Promise<ProjectInfo[]> {
    return postVoltronProjectList({}).then(({ data }) => {
      return data ?? [];
    });
  }

  /**
   * 查询所有模板
   */

  static async fetchTemplateList() {
    const { data } = await postVoltronTemplateList({});
    const templateList = data;
    for (const item of templateList) {
      if (item.templateUrl) {
        item.templateUrl = await NewFileManager.fetchUrl(item.templateUrl);
      }
      if (item.coverUrl) {
        item.coverUrl = await NewFileManager.fetchUrl(item.coverUrl);
      }
    }
    return templateList;
  }

  static async fetchUrl(batchKey: string) {
    const token = await NewFileManager.fetchToken();
    if (!token) {
      return null;
    }
    const prefix = process.env.NODE_ENV === 'prod' ? '' : 'uat-';
    const url = `https://${prefix}eeapi.bilibili.co/open-api/nas/record/intranet`;
    const res = await customFetch(url, {
      method: 'GET',
      headers: {
        'BEE-AppAccessToken': token
      },
      params: {
        bucketName: 'QX_FS',
        batchKey: batchKey
      }
    } as unknown as RequestInit);
    if (res.data?.data?.[0]) {
      return res.data?.data[0].fileUrl.replace(/http:\/\//, 'https://');
    }
  }

  /**
   * 页面重命名
   */
  static async renamePage(pageId: string, newName: string) {
    return NewFileManager.updatePage(pageId, { name: newName });
  }

  /**
   * 重命名项目
   *
   * @param project
   * @param newName
   */
  static async renameProject(project: ProjectInfo, newName: string) {
    await postVoltronProjectUpdate({
      name: newName,
      projectId: project.id
    });
    if (!isWeb()) {
      await DbStore.updateProject({
        id: project.id,
        name: newName
      });
    }
  }

  /**
   * 重命名模板
   */
  static async renameTemplate(id: string, newName: string) {
    await postVoltronTemplateUpdate({
      templateId: id,
      name: newName
    });
  }

  static async savePageDSLFile(pageId: string, dsl: IPageSchema) {
    const batchKey = await NewFileManager.uploadDSLFile(JSON.stringify(dsl));
    if (batchKey) {
      await NewFileManager.updatePage(pageId, { batchKey });
    }
  }

  /**
   * 打开项目，并将之设置为活动项目，同步本地项目信息
   *
   * @param projectInfo
   */
  static async synchronizeLocalProject(projectInfo: ProjectInfo) {
    if (!projectInfo) {
      console.error('非法项目：', projectInfo);
      return;
    }
    // 关闭其他的项目
    const projects = await DbStore.selectProjects({ isActive: true });
    if (projects.length) {
      const project = projects[0];
      await DbStore.updateProject({ id: project.id, isActive: false });
    }
    const openedProjects = await DbStore.selectProjects({ id: projectInfo.id });
    if (!openedProjects.length) {
      // 如果项目不存在，说明是第一次打开，创建一个新的记录
      return await DbStore.createProject({
        name: projectInfo.name,
        id: projectInfo.id
      });
    } else {
      return await DbStore.updateProject({
        id: projectInfo.id,
        isOpen: true,
        isActive: true
      });
    }
  }

  static async toggleProjectOpenness(id: string, isPublic: 0 | 1) {
    await postVoltronProjectUpdate({
      projectId: id,
      isPublic
    });
  }

  /**
   * 更新评论
   *
   * @param data
   */
  static async updateComment(data: {
    id: string;
    content?: string;
    resolved?: boolean;
    position_top?: number;
    position_left?: number;
  }) {
    await postVoltronCommentUpdate({
      commentId: data.id,
      ...data
    });
  }

  static async updatePage(pageId: string, data: { name?: string; batchKey?: string; showMenu?: number }) {
    await postVoltronPageUpdate({
      pageId,
      name: data.name,
      dslUrlBatchKey: data.batchKey,
      showMenu: data.showMenu
    });
  }

  static async uploadDSLFile(data: string) {
    const token = await NewFileManager.fetchToken();
    if (!token) {
      return;
    }
    const prefix = process.env.NODE_ENV === 'prod' ? '' : 'uat-';
    const url = `https://${prefix}eeapi.bilibili.co/open-api/nas/newUpload`;
    const file = stringToFile(data, 'index.json', 'application/json');
    const res = await customFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'BEE-AppAccessToken': token
      },
      body: {
        bucketName: 'QX_FS',
        storageType: '1',
        file
      }
    } as unknown as RequestInit);
    return res.data.data;
  }

  static async uploadDSLFragment({
    data,
    name,
    coverUrl = '',
    category = 0
  }: {
    data: string;
    name: string;
    coverUrl?: string;
    category?: number;
  }) {
    const batchKey = await NewFileManager.uploadDSLFile(data);
    if (batchKey) {
      await postVoltronModuleCreate({
        name,
        url: batchKey,
        coverUrl,
        category
      });
    }
  }

  static async uploadImage(file: File): Promise<string> {
    const token = await NewFileManager.fetchToken();
    if (!token) {
      return;
    }
    const prefix = process.env.NODE_ENV === 'prod' ? '' : 'uat-';
    const url = `https://${prefix}eeapi.bilibili.co/open-api/nas/newUpload`;
    const res = await customFetch(url, {
      method: 'POST',
      headers: {
        'BEE-AppAccessToken': token,
        'Content-Type': 'multipart/form-data'
      },
      body: {
        bucketName: 'QX_FS',
        storageType: '1',
        file
      }
    } as unknown as RequestInit);
    return res.data.data;
  }

  static async uploadImageToBfs(file: File): Promise<string> {
    const { data } = await postVoltronCommonBfsUpload({
      file
    });
    return data;
  }

  private static async fetchToken() {
    if (NewFileManager.accessToken) {
      return Promise.resolve(NewFileManager.accessToken);
    }
    const prefix = process.env.NODE_ENV === 'prod' ? '' : 'uat-';
    const url = `https://${prefix}eeapi.bilibili.co/open-api/auth/open/appAccessToken`;
    const appId =
      process.env.NODE_ENV === 'prod' ? 'b4fa0c8154834b4abde64f449dcd6091' : 'c0d8c5e8a08c4e4d8a1c0ab4ef4fb47a';
    const appSecret =
      process.env.NODE_ENV === 'prod'
        ? 'CwZ5M8jAzX0_lP2oLYqyCvb4I5aV-CQ7CyRF2Jiei-w='
        : 'YcmqLl4AgzqcuIJ-qjVXK7eZpul8pnVG0U9MlJW-QL0=';
    const res = await customFetch(url, {
      method: 'POST',
      body: {
        appId,
        appSecret
      }
    } as unknown as RequestInit);
    if (res.data?.data) {
      NewFileManager.accessToken = res.data.data.token;
      setTimeout(() => {
        // accessToken 的有效期是 7200 秒，冗余 200 秒，7000秒之后就删除
        NewFileManager.accessToken = null;
      }, 7000 * 1000);
      return NewFileManager.accessToken;
    }
    console.error('获取上传 token 失败');
    return null;
  }
}

export interface CreateProjectPayload {
  name: string;
  repo: string;
  repoPath: string;
}
