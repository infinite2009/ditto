/* eslint-disable */
/**
 * DO NOT MODIFY IT BY HAND.
 */
import axios, { type RequestConfig } from './request';

import type {
  GetMetrics,
  PostVoltronCommentCreate,
  PostVoltronCommentDelete,
  GetVoltronCommentDetail,
  PostVoltronCommentList,
  PostVoltronCommentUpdate,
  GetVoltronCommonDeptTree,
  GetVoltronCommonDict,
  PostVoltronCommonEmployeeKeyword,
  PostVoltronCommonProxy,
  PostVoltronCommonProxyMulti,
  GetVoltronCommonUserInfo,
  GetVoltronDeveloperAnalyzeRepositories,
  GetVoltronDeveloperRepositoriesBranches,
  GetVoltronDeveloperRepositoriesTree,
  GetVoltronDeveloperSchemasComponent,
  GetVoltronMaterial,
  PostVoltronMaterial,
  GetVoltronMaterialProp,
  PostVoltronMaterialProp,
  DeleteVoltronMaterialPropById,
  GetVoltronMaterialPropById,
  PatchVoltronMaterialPropById,
  PostVoltronMaterialPropBatchDelete,
  GetVoltronMaterialPropMaterialByMaterialId,
  DeleteVoltronMaterialById,
  GetVoltronMaterialById,
  PatchVoltronMaterialById,
  DeleteVoltronMaterialFullById,
  GetVoltronMaterialFullById,
  DeleteVoltronMaterialPackage,
  GetVoltronMaterialPackage,
  GetVoltronMaterialPackages,
  PatchVoltronMaterialPropsBatch,
  PostVoltronModuleCreate,
  PostVoltronModuleDelete,
  GetVoltronModuleList,
  GetVoltronModuleListAll,
  PostVoltronModuleUpdate,
  GetVoltronNavigationList,
  PostVoltronNavigationUpdate,
  PostVoltronNoteCreate,
  PostVoltronNoteDelete,
  GetVoltronNoteList,
  PostVoltronNoteUpdate,
  PostVoltronPageCreate,
  PostVoltronPageDelete,
  GetVoltronPageDetail,
  PostVoltronPageList,
  PostVoltronPageUpdate,
  PostVoltronPageVersionList,
  PostVoltronProjectCreate,
  PostVoltronProjectDelete,
  GetVoltronProjectDetail,
  PostVoltronProjectList,
  PostVoltronProjectUpdate,
  PostVoltronTemplateCreate,
  PostVoltronTemplateDelete,
  GetVoltronTemplateDetail,
  PostVoltronTemplateList,
  PostVoltronTemplateUpdate,
  GetVoltronUserCurrentUser,
} from './services.types';

const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  fields: K[],
): Omit<T, K> => {
  const shallowCopy = Object.assign({}, obj) as T;
  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i];
    delete shallowCopy[key as keyof T];
  }
  return shallowCopy;
};

/**
 * 接口名称：/metrics
 *
 * @description 接口路径：/metrics
 * @description 接口分组：default
 * @author openapi
 * @time 创建时间：2025-04-01 11:41:40
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getMetrics = (config: RequestConfig = {}) =>
  axios.get<GetMetrics.Res>('/metrics', {
    ...config,
  });

/**
 * 接口名称：新增评论
 *
 * @description 接口路径：/ditto/comment/create
 * @description 接口分组：评论模块 comment
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronCommentCreate = (
  params: PostVoltronCommentCreate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronCommentCreate.Res>(
    '/ditto/comment/create',
    params,
    config,
  );

/**
 * 接口名称：删除评论
 *
 * @description 接口路径：/ditto/comment/delete
 * @description 接口分组：评论模块 comment
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronCommentDelete = (
  params: PostVoltronCommentDelete.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronCommentDelete.Res>(
    '/ditto/comment/delete',
    params,
    config,
  );

/**
 * 接口名称：获取评论详情
 *
 * @description 接口路径：/ditto/comment/detail
 * @description 接口分组：评论模块 comment
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronCommentDetail = (
  params: GetVoltronCommentDetail.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronCommentDetail.Res>('/ditto/comment/detail', {
    params,
    ...config,
  });

/**
 * 接口名称：获取评论列表
 *
 * @description 接口路径：/ditto/comment/list
 * @description 接口分组：评论模块 comment
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronCommentList = (
  params: PostVoltronCommentList.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronCommentList.Res>(
    '/ditto/comment/list',
    params,
    config,
  );

/**
 * 接口名称：编辑评论
 *
 * @description 接口路径：/ditto/comment/update
 * @description 接口分组：评论模块 comment
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronCommentUpdate = (
  params: PostVoltronCommentUpdate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronCommentUpdate.Res>(
    '/ditto/comment/update',
    params,
    config,
  );

/**
 * 接口名称：获取完整部门树
 *
 * @description 接口路径：/ditto/common/dept/tree
 * @description 接口分组：通用模块 common
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronCommonDeptTree = (
  params: GetVoltronCommonDeptTree.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronCommonDeptTree.Res>('/ditto/common/dept/tree', {
    params,
    ...config,
  });

/**
 * 接口名称：获取码值
 *
 * @description 接口路径：/ditto/common/dict
 * @description 接口分组：通用模块 common
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronCommonDict = (config: RequestConfig = {}) =>
  axios.get<GetVoltronCommonDict.Res>('/ditto/common/dict', {
    ...config,
  });

/**
 * 接口名称：根据昵称或者域账号查询用户信息
 *
 * @description 接口路径：/ditto/common/employee/keyword
 * @description 接口分组：通用模块 common
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronCommonEmployeeKeyword = (
  params: PostVoltronCommonEmployeeKeyword.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronCommonEmployeeKeyword.Res>(
    '/ditto/common/employee/keyword',
    params,
    config,
  );

/**
 * 接口名称：接口转发
 *
 * @description 接口路径：/ditto/common/proxy
 * @description 接口分组：通用模块 common
 * @author openapi
 * @time 创建时间：2024-12-02 16:15:56
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronCommonProxy = (
  params: PostVoltronCommonProxy.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronCommonProxy.Res>(
    '/ditto/common/proxy',
    params,
    config,
  );

/**
 * 接口名称：接口转发
 *
 * @description 接口路径：/ditto/common/proxy-multi
 * @description 接口分组：通用模块 common
 * @author openapi
 * @time 创建时间：2024-12-02 16:15:56
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronCommonProxyMulti = (
  params: PostVoltronCommonProxyMulti.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronCommonProxyMulti.Res>(
    '/ditto/common/proxy-multi',
    params,
    config,
  );

/**
 * 接口名称：登录人信息
 *
 * @description 接口路径：/ditto/common/userInfo
 * @description 接口分组：通用模块 common
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronCommonUserInfo = (config: RequestConfig = {}) =>
  axios.get<GetVoltronCommonUserInfo.Res>('/ditto/common/userInfo', {
    ...config,
  });

/**
 * 接口名称：/ditto/developer/analyze-repositories
 *
 * @description 接口路径：/ditto/developer/analyze-repositories
 * @description 接口分组：开发者模块 developer
 * @author openapi
 * @time 创建时间：2025-05-13 20:58:50
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronDeveloperAnalyzeRepositories = (
  params: GetVoltronDeveloperAnalyzeRepositories.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronDeveloperAnalyzeRepositories.Res>(
    '/ditto/developer/analyze-repositories',
    {
      params,
      ...config,
    },
  );

/**
 * 接口名称：/ditto/developer/repositories-branches
 *
 * @description 接口路径：/ditto/developer/repositories-branches
 * @description 接口分组：开发者模块 developer
 * @author openapi
 * @time 创建时间：2025-05-13 20:58:49
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronDeveloperRepositoriesBranches = (
  params: GetVoltronDeveloperRepositoriesBranches.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronDeveloperRepositoriesBranches.Res>(
    '/ditto/developer/repositories-branches',
    {
      params,
      ...config,
    },
  );

/**
 * 接口名称：/ditto/developer/repositories-tree
 *
 * @description 接口路径：/ditto/developer/repositories-tree
 * @description 接口分组：开发者模块 developer
 * @author openapi
 * @time 创建时间：2025-05-13 20:58:49
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronDeveloperRepositoriesTree = (
  params: GetVoltronDeveloperRepositoriesTree.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronDeveloperRepositoriesTree.Res>(
    '/ditto/developer/repositories-tree',
    {
      params,
      ...config,
    },
  );

/**
 * 接口名称：/ditto/developer/schemas/component
 *
 * @description 接口路径：/ditto/developer/schemas/component
 * @description 接口分组：开发者模块 developer
 * @author openapi
 * @time 创建时间：2025-05-13 20:58:50
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronDeveloperSchemasComponent = (
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronDeveloperSchemasComponent.Res>(
    '/ditto/developer/schemas/component',
    {
      ...config,
    },
  );

/**
 * 接口名称：分页查询物料组件
 *
 * @description 接口路径：/ditto/material
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-17 15:58:23
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronMaterial = (
  params: GetVoltronMaterial.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronMaterial.Res>('/ditto/material', {
    params,
    ...config,
  });

/**
 * 接口名称：创建物料组件
 *
 * @description 接口路径：/ditto/material
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-17 15:58:23
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronMaterial = (
  params: PostVoltronMaterial.Req,
  config: RequestConfig = {},
) => axios.post<PostVoltronMaterial.Res>('/ditto/material', params, config);

/**
 * 接口名称：获取所有物料组件属性
 *
 * @description 接口路径：/ditto/material-prop
 * @description 接口分组：物料组件属性
 * @author openapi
 * @time 创建时间：2025-05-29 14:55:57
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronMaterialProp = (config: RequestConfig = {}) =>
  axios.get<GetVoltronMaterialProp.Res>('/ditto/material-prop', {
    ...config,
  });

/**
 * 接口名称：创建物料组件属性
 *
 * @description 接口路径：/ditto/material-prop
 * @description 接口分组：物料组件属性
 * @author openapi
 * @time 创建时间：2025-05-29 14:55:57
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronMaterialProp = (
  params: PostVoltronMaterialProp.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronMaterialProp.Res>(
    '/ditto/material-prop',
    params,
    config,
  );

/**
 * 接口名称：删除物料组件属性
 *
 * @description 接口路径：/ditto/material-prop/{id}
 * @description 接口分组：物料组件属性
 * @author openapi
 * @time 创建时间：2025-05-29 14:55:58
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const deleteVoltronMaterialPropById = (
  params: DeleteVoltronMaterialPropById.Req,
  config: RequestConfig = {},
) =>
  axios.delete<DeleteVoltronMaterialPropById.Res>(
    `/ditto/material-prop/${params.id}`,
    {
      ...config,
    },
  );

/**
 * 接口名称：根据ID获取物料组件属性
 *
 * @description 接口路径：/ditto/material-prop/{id}
 * @description 接口分组：物料组件属性
 * @author openapi
 * @time 创建时间：2025-05-29 14:55:58
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronMaterialPropById = (
  params: GetVoltronMaterialPropById.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronMaterialPropById.Res>(
    `/ditto/material-prop/${params.id}`,
    {
      ...config,
    },
  );

/**
 * 接口名称：更新物料组件属性
 *
 * @description 接口路径：/ditto/material-prop/{id}
 * @description 接口分组：物料组件属性
 * @author openapi
 * @time 创建时间：2025-05-29 14:55:58
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const patchVoltronMaterialPropById = (
  params: PatchVoltronMaterialPropById.Req,
  config: RequestConfig = {},
) =>
  axios.patch<PatchVoltronMaterialPropById.Res>(
    `/ditto/material-prop/${params.id}`,
    omit(params, ['id']),
    config,
  );

/**
 * 接口名称：批量删除物料组件属性
 *
 * @description 接口路径：/ditto/material-prop/batch-delete
 * @description 接口分组：物料组件属性
 * @author openapi
 * @time 创建时间：2025-05-29 15:11:23
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.01
 */
export const postVoltronMaterialPropBatchDelete = (
  params: PostVoltronMaterialPropBatchDelete.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronMaterialPropBatchDelete.Res>(
    '/ditto/material-prop/batch-delete',
    params,
    config,
  );

/**
 * 接口名称：获取物料组件的所有属性
 *
 * @description 接口路径：/ditto/material-prop/material/{materialId}
 * @description 接口分组：物料组件属性
 * @author openapi
 * @time 创建时间：2025-05-29 14:55:58
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronMaterialPropMaterialByMaterialId = (
  params: GetVoltronMaterialPropMaterialByMaterialId.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronMaterialPropMaterialByMaterialId.Res>(
    `/ditto/material-prop/material/${params.materialId}`,
    {
      ...config,
    },
  );

/**
 * 接口名称：删除物料组件
 *
 * @description 接口路径：/ditto/material/{id}
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-17 15:58:23
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const deleteVoltronMaterialById = (
  params: DeleteVoltronMaterialById.Req,
  config: RequestConfig = {},
) =>
  axios.delete<DeleteVoltronMaterialById.Res>(
    `/ditto/material/${params.id}`,
    {
      ...config,
    },
  );

/**
 * 接口名称：根据ID获取物料组件
 *
 * @description 接口路径：/ditto/material/{id}
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-17 15:58:23
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronMaterialById = (
  params: GetVoltronMaterialById.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronMaterialById.Res>(`/ditto/material/${params.id}`, {
    ...config,
  });

/**
 * 接口名称：更新物料组件
 *
 * @description 接口路径：/ditto/material/{id}
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-17 15:58:23
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const patchVoltronMaterialById = (
  params: PatchVoltronMaterialById.Req,
  config: RequestConfig = {},
) =>
  axios.patch<PatchVoltronMaterialById.Res>(
    `/ditto/material/${params.id}`,
    omit(params, ['id']),
    config,
  );

/**
 * 接口名称：删除物料组件及其属性
 *
 * @description 接口路径：/ditto/material/{id}/full
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-21 07:56:29
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const deleteVoltronMaterialFullById = (
  params: DeleteVoltronMaterialFullById.Req,
  config: RequestConfig = {},
) =>
  axios.delete<DeleteVoltronMaterialFullById.Res>(
    `/ditto/material/${params.id}/full`,
    {
      ...config,
    },
  );

/**
 * 接口名称：获取物料组件详情（包含属性）
 *
 * @description 接口路径：/ditto/material/{id}/full
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-21 07:56:29
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronMaterialFullById = (
  params: GetVoltronMaterialFullById.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronMaterialFullById.Res>(
    `/ditto/material/${params.id}/full`,
    {
      ...config,
    },
  );

/**
 * 接口名称：根据包名删除物料组件及其属性
 *
 * @description 接口路径：/ditto/material/package
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-21 07:56:29
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const deleteVoltronMaterialPackage = (
  params: DeleteVoltronMaterialPackage.Req,
  config: RequestConfig = {},
) =>
  axios.delete<DeleteVoltronMaterialPackage.Res>('/ditto/material/package', {
    params,
    ...config,
  });

/**
 * 接口名称：根据包名查询物料组件及其属性
 *
 * @description 接口路径：/ditto/material/package
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-21 07:58:05
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronMaterialPackage = (
  params: GetVoltronMaterialPackage.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronMaterialPackage.Res>('/ditto/material/package', {
    params,
    ...config,
  });

/**
 * 接口名称：获取所有物料组件包名
 *
 * @description 接口路径：/ditto/material/packages
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-17 15:58:23
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronMaterialPackages = (config: RequestConfig = {}) =>
  axios.get<GetVoltronMaterialPackages.Res>('/ditto/material/packages', {
    ...config,
  });

/**
 * 接口名称：批量更新物料组件属性
 *
 * @description 接口路径：/ditto/material/props/batch
 * @description 接口分组：物料组件
 * @author openapi
 * @time 创建时间：2025-05-21 07:56:29
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const patchVoltronMaterialPropsBatch = (
  params: PatchVoltronMaterialPropsBatch.Req,
  config: RequestConfig = {},
) =>
  axios.patch<PatchVoltronMaterialPropsBatch.Res>(
    '/ditto/material/props/batch',
    params,
    config,
  );

/**
 * 接口名称：创建模块
 *
 * @description 接口路径：/ditto/module/create
 * @description 接口分组：模块 module
 * @author openapi
 * @time 创建时间：2025-03-24 16:57:26
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronModuleCreate = (
  params: PostVoltronModuleCreate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronModuleCreate.Res>(
    '/ditto/module/create',
    params,
    config,
  );

/**
 * 接口名称：删除模块
 *
 * @description 接口路径：/ditto/module/delete
 * @description 接口分组：模块 module
 * @author openapi
 * @time 创建时间：2025-03-24 16:57:26
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronModuleDelete = (
  params: PostVoltronModuleDelete.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronModuleDelete.Res>(
    '/ditto/module/delete',
    params,
    config,
  );

/**
 * 接口名称：获取模块列表
 *
 * @description 接口路径：/ditto/module/list
 * @description 接口分组：模块 module
 * @author openapi
 * @time 创建时间：2025-03-24 16:57:26
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronModuleList = (
  params: GetVoltronModuleList.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronModuleList.Res>('/ditto/module/list', {
    params,
    ...config,
  });

/**
 * 接口名称：获取所有模块列表
 *
 * @description 接口路径：/ditto/module/list-all
 * @description 接口分组：模块 module
 * @author openapi
 * @time 创建时间：2025-03-24 17:40:30
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronModuleListAll = (
  params: GetVoltronModuleListAll.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronModuleListAll.Res>('/ditto/module/list-all', {
    params,
    ...config,
  });

/**
 * 接口名称：更新模块
 *
 * @description 接口路径：/ditto/module/update
 * @description 接口分组：模块 module
 * @author openapi
 * @time 创建时间：2025-03-24 16:57:26
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronModuleUpdate = (
  params: PostVoltronModuleUpdate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronModuleUpdate.Res>(
    '/ditto/module/update',
    params,
    config,
  );

/**
 * 接口名称：获取顶部导航列表
 *
 * @description 接口路径：/ditto/navigation/list
 * @description 接口分组：顶部导航模块 navigation
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronNavigationList = (
  params: GetVoltronNavigationList.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronNavigationList.Res>('/ditto/navigation/list', {
    params,
    ...config,
  });

/**
 * 接口名称：更新顶部导航
 *
 * @description 接口路径：/ditto/navigation/update
 * @description 接口分组：顶部导航模块 navigation
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronNavigationUpdate = (
  params: PostVoltronNavigationUpdate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronNavigationUpdate.Res>(
    '/ditto/navigation/update',
    params,
    config,
  );

/**
 * 接口名称：创建批注
 *
 * @description 接口路径：/ditto/note/create
 * @description 接口分组：批注模块 note
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronNoteCreate = (
  params: PostVoltronNoteCreate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronNoteCreate.Res>('/ditto/note/create', params, config);

/**
 * 接口名称：删除批注
 *
 * @description 接口路径：/ditto/note/delete
 * @description 接口分组：批注模块 note
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronNoteDelete = (
  params: PostVoltronNoteDelete.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronNoteDelete.Res>('/ditto/note/delete', params, config);

/**
 * 接口名称：获取批注列表
 *
 * @description 接口路径：/ditto/note/list
 * @description 接口分组：批注模块 note
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronNoteList = (
  params: GetVoltronNoteList.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronNoteList.Res>('/ditto/note/list', {
    params,
    ...config,
  });

/**
 * 接口名称：更新批注
 *
 * @description 接口路径：/ditto/note/update
 * @description 接口分组：批注模块 note
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronNoteUpdate = (
  params: PostVoltronNoteUpdate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronNoteUpdate.Res>('/ditto/note/update', params, config);

/**
 * 接口名称：创建页面
 *
 * @description 接口路径：/ditto/page/create
 * @description 接口分组：页面模块 page
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronPageCreate = (
  params: PostVoltronPageCreate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronPageCreate.Res>('/ditto/page/create', params, config);

/**
 * 接口名称：删除页面
 *
 * @description 接口路径：/ditto/page/delete
 * @description 接口分组：页面模块 page
 * 
 * @author openapi
 * @time 创建时间：2024-11-21 20:31:50
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronPageDelete = (
  params: PostVoltronPageDelete.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronPageDelete.Res>('/ditto/page/delete', params, config);

/**
 * 接口名称：获取页面详情
 *
 * @description 接口路径：/ditto/page/detail
 * @description 接口分组：页面模块 page
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronPageDetail = (
  params: GetVoltronPageDetail.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronPageDetail.Res>('/ditto/page/detail', {
    params,
    ...config,
  });

/**
 * 接口名称：获取页面列表
 *
 * @description 接口路径：/ditto/page/list
 * @description 接口分组：页面模块 page
 * @author openapi
 * @time 创建时间：2024-11-21 20:31:50
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronPageList = (
  params: PostVoltronPageList.Req,
  config: RequestConfig = {},
) => axios.post<PostVoltronPageList.Res>('/ditto/page/list', params, config);

/**
 * 接口名称：更新页面
 *
 * @description 接口路径：/ditto/page/update
 * @description 接口分组：页面模块 page
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronPageUpdate = (
  params: PostVoltronPageUpdate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronPageUpdate.Res>('/ditto/page/update', params, config);

/**
 * 接口名称：获取页面版本列表
 *
 * @description 接口路径：/ditto/page/version/list
 * @description 接口分组：页面模块 page
 * @author openapi
 * @time 创建时间：2024-11-26 15:09:56
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronPageVersionList = (
  params: PostVoltronPageVersionList.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronPageVersionList.Res>(
    '/ditto/page/version/list',
    params,
    config,
  );

/**
 * 接口名称：创建项目
 *
 * @description 接口路径：/ditto/project/create
 * @description 接口分组：项目模块 project
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronProjectCreate = (
  params: PostVoltronProjectCreate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronProjectCreate.Res>(
    '/ditto/project/create',
    params,
    config,
  );

/**
 * 接口名称：删除项目
 *
 * @description 接口路径：/ditto/project/delete
 * @description 接口分组：项目模块 project
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronProjectDelete = (
  params: PostVoltronProjectDelete.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronProjectDelete.Res>(
    '/ditto/project/delete',
    params,
    config,
  );

/**
 * 接口名称：获取项目详情
 *
 * @description 接口路径：/ditto/project/detail
 * @description 接口分组：项目模块 project
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronProjectDetail = (
  params: GetVoltronProjectDetail.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronProjectDetail.Res>('/ditto/project/detail', {
    params,
    ...config,
  });

/**
 * 接口名称：获取项目列表
 *
 * @description 接口路径：/ditto/project/list
 * @description 接口分组：项目模块 project
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronProjectList = (
  params: PostVoltronProjectList.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronProjectList.Res>(
    '/ditto/project/list',
    params,
    config,
  );

/**
 * 接口名称：编辑项目
 *
 * @description 接口路径：/ditto/project/update
 * @description 接口分组：项目模块 project
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronProjectUpdate = (
  params: PostVoltronProjectUpdate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronProjectUpdate.Res>(
    '/ditto/project/update',
    params,
    config,
  );

/**
 * 接口名称：创建模板
 *
 * @description 接口路径：/ditto/template/create
 * @description 接口分组：模板模块 template
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronTemplateCreate = (
  params: { coverUrl: string; name: string; projectId: string; templateUrl: string },
  config: RequestConfig = {}
) =>
  axios.post<PostVoltronTemplateCreate.Res>(
    '/ditto/template/create',
    params,
    config,
  );

/**
 * 接口名称：删除模板
 *
 * @description 接口路径：/ditto/template/delete
 * @description 接口分组：模板模块 template
 * @author openapi
 * @time 创建时间：2024-11-21 20:31:50
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronTemplateDelete = (
  params: PostVoltronTemplateDelete.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronTemplateDelete.Res>(
    '/ditto/template/delete',
    params,
    config,
  );

/**
 * 接口名称：获取模板详情
 *
 * @description 接口路径：/ditto/template/detail
 * @description 接口分组：模板模块 template
 * @author openapi
 * @time 创建时间：2024-11-21 16:01:59
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronTemplateDetail = (
  params: GetVoltronTemplateDetail.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronTemplateDetail.Res>('/ditto/template/detail', {
    params,
    ...config,
  });

/**
 * 接口名称：获取模板列表
 *
 * @description 接口路径：/ditto/template/list
 * @description 接口分组：模板模块 template
 * @author openapi
 * @time 创建时间：2024-11-21 20:31:50
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronTemplateList = (
  params: PostVoltronTemplateList.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronTemplateList.Res>(
    '/ditto/template/list',
    params,
    config,
  );

/**
 * 接口名称：编辑模板
 *
 * @description 接口路径：/ditto/template/update
 * @description 接口分组：模板模块 template
 * @author openapi
 * @time 创建时间：2024-11-21 20:31:50
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const postVoltronTemplateUpdate = (
  params: PostVoltronTemplateUpdate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronTemplateUpdate.Res>(
    '/ditto/template/update',
    params,
    config,
  );

/**
 * 接口名称：获取当前用户信息
 *
 * @description 接口路径：/ditto/user/current-user
 * @description 接口分组：用户
 * @author openapi
 * @time 创建时间：2025-05-29 14:55:58
 * @time 更新时间：2025-05-29 15:11:23
 * @version v20250529.05
 */
export const getVoltronUserCurrentUser = (config: RequestConfig = {}) =>
  axios.get<GetVoltronUserCurrentUser.Res>('/ditto/user/current-user', {
    ...config,
  });
