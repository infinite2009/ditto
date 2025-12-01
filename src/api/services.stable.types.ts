/* eslint-disable */
/**
 * DO NOT MODIFY IT BY HAND.
 */

/**
 * 类型名称：获取左侧菜单列表
 *
 * @description 接口路径：/ditto/menu/list
 * @description 接口分组：左侧菜单模块 menu
 * @time 创建时间：2024-11-21 20:31:50
 * @time 更新时间：2024-11-21 20:44:39
 * @version v20241121.03
 */
export namespace GetVoltronMenuList {
  /**
   * res
   */
  export type Res = ResItem[];

  export interface Req {
    orderField?: string;
    order?: string;
    /**
     * 项目ID
     */
    projectId: string;
  }
  export interface ResItem {
    /**
     * children
     */
    children?: ResItem[];
    creator?: string;
    ctime?: string;
    id?: number;
    isDeleted?: number;
    isLeaf?: number;
    isRoot?: number;
    mtime?: string;
    name?: string;
    order?: number;
    parentId?: number;
    projectId?: string;
    updater?: string;
    url?: string;
    urlType?: number;
  }
}

/**
 * 类型名称：更新左侧菜单
 *
 * @description 接口路径：/ditto/menu/update
 * @description 接口分组：左侧菜单模块 menu
 * @author openapi
 * @time 创建时间：2024-11-21 20:31:50
 * @time 更新时间：2024-11-22 15:46:44
 * @version v20241122.01
 */
export namespace PostVoltronMenuUpdate {
  export type MenusItem = {
    /**
     * children
     */
    children?: MenusItem[];
    id?: number | string;
    name?: string;
    parentId?: number | string;
    projectId?: string;
    url?: string;
    urlType?: number;
  };
  export type Res = boolean;

  export interface Req {
    /**
     * 菜单数据
     */
    menus: MenusItem[];
    /**
     * 项目ID
     */
    projectId: string;
  }
}

/**
 * 类型名称：BFS文件上传
 *
 * @description 接口路径：/ditto/common/bfs/upload
 * @description 接口分组：通用模块 common
 * @time 创建时间：2024-12-02 16:15:56
 * @time 更新时间：2024-12-02 16:32:19
 * @version v20241202.07
 */
export namespace PostVoltronCommonBfsUpload {
  export type Res = string;

  export interface Req {
    file: File;
  }
}