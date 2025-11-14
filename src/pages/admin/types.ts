/**
 * 物料组件数据传输对象
 */
export interface MaterialDTO {
  /** 物料组件调用名 */
  callingName: string;
  /** 物料组件类别 */
  categories: string;
  /** 物料组件配置名 */
  configName: string;
  /** 物料组件封面URL */
  coverUrl: string;
  /** 物料组件中文名称 */
  displayName: string;
  /** 物料组件特性描述 */
  feature?: string;
  /** 物料组件ID */
  id: string;
  /** 物料组件导入名 */
  importName: string;
  /** 是否为隐藏组件：1-是，0-否 */
  isHidden?: number;
  /** 是否为图层组件：1-是，0-否 */
  isLayer?: number;
  /** 物料组件搜索关键字 */
  keywords: string;
  /** 是否不需要生成导入语句：1-是，0-否 */
  needImport?: number;
  /** 所属物料组件库包名 */
  package: string;
  /** 是否为黑盒组件：1-是，0-否 */
  // isBlackBox?: number;
  /** 物料组件属性列表 */
  props: MaterialPropsDTO[];
}

/**
 * 物料组件属性数据传输对象
 */
export interface MaterialPropsDTO {
  /** 属性类别 */
  category: string;
  /** 默认值 */
  defaultValue?: string;
  /** 属性中文名称 */
  displayName?: string;
  id?: string;
  /** 是否显示该字段：1-是，0-否 */
  isVisible?: number;
  /** 属性英文名称 */
  propName: string;
  /** 初始值 */
  propValue?: string;
  /** 模板属性路径正则表达式 */
  templateKeyPathsReg?: string;
  /** 值来源 */
  valueSource: string;
  /** 数据类型 */
  valueType: string;
}

interface PaginationDTO<T> {
  list: T[];
  pageNum: number;
  pageSize: number;
  pages: number;
  size: number;
  total: number;
}

export type PaginationMaterialDTO = PaginationDTO<MaterialDTO>;

/**
 * 管理页面状态管理接口
 */
export interface AdminPageStore {
  /** 当前修改物料ID */
  currentModifyMaterialId: string | null;
  /** 当前修改物料属性ID */
  currentModifyMaterialPropsId: string | null;
  /** 是否处于加载状态 */
  loading: boolean;
  /** 物料数据列表 */
  material: MaterialDTO[];
  /** 物料表格当前页码 */
  materialTableCurrentPage: number;
  /** 物料表格每页显示数量 */
  materialTablePageSize: number;
  /** 物料表格数据总数 */
  materialTableTotal: number;
  /** 更新通知 */
  notify: () => void;
  /** 搜索关键词 */
  searchKeyword: string;
  /** 搜索结果总数 */
  searchResultCount: number;
  /** 设置当前修改物料ID */
  setCurrentModifyMaterialId: (id: string | null) => void;
  /** 设置当前修改物料属性ID */
  setCurrentModifyMaterialPropsId: (id: string | null) => void;
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void;
  /** 设置物料数据和总数 */
  setMaterialData: (material: MaterialDTO[], total: number) => void;
  /** 设置物料表格当前页码 */
  setMaterialTableCurrentPage: (currentPage: number) => void;
  /** 设置物料表格每页显示数量 */
  setMaterialTablePageSize: (pageSize: number) => void;
  /** 设置搜索关键词 */
  setSearchKeyword: (keyword: string) => void;
  /** 设置搜索结果总数 */
  setSearchResultCount: (count: number) => void;
  /** 设置是否显示创建物料弹窗 */
  setShowCreateModal: (show: boolean) => void;
  /** 是否显示创建物料弹窗 */
  showCreateModal: boolean;
}

export type StringValue<T> = {
  [K in keyof T]?: string;
};

export type FormField<T> = {
  /** 获取字段值 */
  get(): T;
  /** 获取字段错误 */
  getError(): string | null;
  /** 设置字段值 */
  set(value: T): void;
  /** 设置字段错误 */
  setError(error: string): void;
  /** 重置字段错误 */
  resetError(): void;
};

export type FormModel<F extends object> = {
  [K in keyof F]: FormField<F[K] | any>;
};

export type FormModelValues<F extends FormModel<any>> = {
  [K in keyof F]: F[K] extends FormField<infer T> ? T : never;
};

export type CreateMaterialFormData = Omit<MaterialDTO, 'id'>;

export type KeyOfMaterialDTOVisible = keyof Omit<MaterialDTO, 'id' | 'props'>;

export type KeyOfMaterialPropsDTOVisible = keyof Omit<MaterialPropsDTO, 'id'>;

export type MaterialFormModal = FormModel<Omit<MaterialDTO, 'id' | 'props'>> & {
  props: FormModel<MaterialPropsDTO>[];
};
