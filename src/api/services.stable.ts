/* eslint-disable */
/**
 * DO NOT MODIFY IT BY HAND.
 */
import axios, { type RequestConfig } from './request';

import type {
  GetVoltronMenuList,
  PostVoltronMenuUpdate,
  PostVoltronCommonBfsUpload,
} from './services.stable.types';

/**
 * 接口名称：获取左侧菜单列表
 *
 * @description 接口路径：/ditto/menu/list
 * @description 接口分组：左侧菜单模块 menu
 * @time 创建时间：2024-11-21 20:31:50
 * @time 更新时间：2024-11-21 20:44:39
 * @version v20241121.03
 */
export const getVoltronMenuList = (
  params: GetVoltronMenuList.Req,
  config: RequestConfig = {},
) =>
  axios.get<GetVoltronMenuList.Res>('/ditto/menu/list', {
    params,
    ...config,
  });

/**
 * 接口名称：更新左侧菜单
 *
 * @description 接口路径：/ditto/menu/update
 * @description 接口分组：左侧菜单模块 menu
 * @author openapi
 * @time 创建时间：2024-11-21 20:31:50
 * @time 更新时间：2024-11-22 15:46:44
 * @version v20241122.01
 */
export const postVoltronMenuUpdate = (
  params: PostVoltronMenuUpdate.Req,
  config: RequestConfig = {},
) =>
  axios.post<PostVoltronMenuUpdate.Res>('/ditto/menu/update', params, config);


  /**
 * 接口名称：BFS文件上传
 *
 * @description 接口路径：/ditto/common/bfs/upload
 * @description 接口分组：通用模块 common
 * @time 创建时间：2024-12-02 16:15:56
 * @time 更新时间：2024-12-02 16:32:19
 * @version v20241202.07
 */
export const postVoltronCommonBfsUpload = (
  params: PostVoltronCommonBfsUpload.Req,
  config: RequestConfig = {},
) =>
  axios.postForm<PostVoltronCommonBfsUpload.Res>(
    '/ditto/common/bfs/upload',
    params,
    config,
  );