import IPageSchema from '@/types/page.schema';
import IComponentSchema from '@/types/component.schema';
import { ReactNode } from 'react';
import { CSSProperties } from 'react';
import IFormConfig from '@/types/form-config';
import { ComponentId } from '@/types';
import ActionType from '@/types/action-type';
import IActionSchema from '@/types/action.schema';
import ComponentFeature from '@/types/component-feature';
import InsertType from '@/types/insert-type';
import IEventSchema from '@/types/event.schema';
import IPropsSchema from '@/types/props.schema';
export type DiffPropsFnResult =
  | { type: 'add' | 'remove' | 'update'; key: string; oldProps?: IPropsSchema; newProps?: IPropsSchema }[]
  | null;

export type FormValue = {
  style: CSSProperties;
  basic: Record<string, any>;
  event: Record<string, any>;
  data: Record<string, any>;
  children: ReactNode;
  // 纯为了避免类型检查错误
  [key: string]: any;
};
export interface TemplateTree {
  children?: TemplateTree[];
  configName: string;
  dependency: string;
  name: string;
}

// 1. 基础状态接口
interface IDSLState {
  id: string;
  currentPageId: string;
  dsl: IPageSchema;
  selectedComponent: IComponentSchema;
  shouldSave: boolean;
  componentsIsRenderedMap: Record<string, boolean>;
  componentsRef: Record<string, React.MutableRefObject<HTMLElement>>;
  hiddenComponentDict: Record<ComponentId, boolean>;
  currentParentNode: IComponentSchema | IPageSchema | null;
}

// 2. Getter 接口
interface IDSLGetters {
  canRedo: boolean;
  canUndo: boolean;
  formConfigOfSelectedComponent: null | IFormConfig;
  isEmpty: boolean;
  valueOfSelectedComponent: Partial<FormValue> | null;
}

// 3. 动作管理接口
interface IActionManagement {
  addAction: (type: ActionType, name: string, desc: string, options: any) => void;
  deleteAction: (id: string) => void;
  updateAction: (id: string, opt: { name?: string; desc?: string; actionType?: ActionType; payload?: any }) => void;
  setAllActions: (actions: IActionSchema[]) => void;
  fetchActionList: () => IActionSchema[];
}

// 4. 组件基础操作接口
interface IComponentBasicOperations {
  createComponent: (
    name: string,
    dependency: string,
    opt?: { customId?: string; feature?: ComponentFeature },
    extProps?: Record<string, any>
  ) => IComponentSchema;
  deleteComponent: (id: ComponentId) => IComponentSchema | null;
  cloneAndInsertComponent: (id: ComponentId, relativeId: ComponentId, insertType: InsertType) => void;
  moveComponent: (parentId: string, childId: string, insertIndex: number | 'start' | 'end') => void;
  renameComponent: (componentId: ComponentId, newName: string) => void;
}

// 5. 组件属性操作接口
interface IComponentPropsOperations {
  updateComponentProps: (
    propsPartial: Record<string, any> | CSSProperties,
    targetComponent?: { id: string } | IComponentSchema
  ) => void;
  addComponentPropsKey: (key: string, value: string) => void;
  deleteComponentPropsKey: (key: string) => void;
  mergeComponentProps: (componentId: string) => void;
  getComponentProps: (id: string) => Record<string, any>;
  batchMergeComponentProps: (componentIds: string[]) => void;
  mergeSingleComponentProps: (componentId: string) => void;
  diffAllComponentProps: () => Record<string, DiffPropsFnResult>;
  diffComponentProps: (componentId: string) => DiffPropsFnResult;
}

// 6. 组件查找接口
interface IComponentQueries {
  fetchComponentInDSL: (id: string) => IComponentSchema | null;
  fetchComponentList: () => IComponentSchema[];
  fetchParentComponentInDSL: (id: string) => IComponentSchema | null;
  fetchAncestors: (id: ComponentId) => IComponentSchema[];
  fetchDescendants: (id: ComponentId) => IComponentSchema[];
  findChildren: (id: ComponentId) => IComponentSchema[];
  findFirstRealComponent: (componentId: ComponentId) => IComponentSchema;
  findNonSlotDescendant: (id: ComponentId) => any;
  findIndex: (componentId: ComponentId) => number;
  findAllParentsIdViaComponentId: (componentId: ComponentId) => IComponentSchema[];
}

// 7. 组件状态管理接口
interface IComponentStateManagement {
  selectComponent: (componentId: ComponentId) => void;
  unselectComponent: () => void;
  resetSelectedComponent: () => void;
  hideComponent: (id: ComponentId) => void;
  showComponent: (id: ComponentId) => void;
  isHidden: (id: ComponentId) => boolean;
  setHiddenComponentDict: (componentDict: Record<ComponentId, boolean>) => void;
}

// 8. 组件关系判断接口
interface IComponentRelationChecks {
  isDescendant: (source: string, target: string) => boolean;
  isDraggable: (componentId: ComponentId) => boolean;
  isInBlackBox: (id: ComponentId) => boolean;
  isInLayer: (id: ComponentId) => boolean;
  isLayerShown: () => boolean;
  isPageRoot: (id: ComponentId) => boolean;
  isIgnoreFeatureComponent: (component: IComponentSchema) => boolean;
}

// 9. 撤销重做接口
interface IUndoRedoOperations {
  undo: () => void;
  redo: () => void;
}

// 10. DSL 操作接口
interface IDSLOperations {
  initDSL: (dsl?: IPageSchema) => void;
  setDSL: (dsl: IPageSchema) => void;
  overrideDSL: (dsl?: IPageSchema) => void;
  clearPage: () => void;
  createEmptyDSL: (name: string, desc?: string) => void;
  filterDSLByComponentId: (componentId: string, options: { deep: boolean }) => Partial<IPageSchema>;
}

// 11. 事件管理接口
interface IEventManagement {
  fetchEventList: (componentId: ComponentId) => IEventSchema[];
  setEventsForComponent: (id: ComponentId, eventList: IEventSchema[]) => void;
}

// 12. 表格操作接口
interface ITableOperations {
  insertColumnForTable: (
    column: { configName: string; dependency: string },
    tableComponentId: string,
    columnIndex?: number,
    callback?: () => void
  ) => void;
  deleteColumnForTable: (tableId: string, columnIndex: number, callback?: () => void) => void;
  insertRowForTable: (
    columns: { configName: string; dependency: string }[],
    tableComponentId: string,
    callback: () => void
  ) => void;
}

// 13. 工具方法接口
interface IUtilityOperations {
  forceUpdateComponent: (componentId?: string) => void;
  getComponentKey: (componentId: string) => string;
  resetComponentsRef: () => void;
  clearComponentsIsRenderedMap: () => void;
  setComponentsIsRenderedMap: (componentId: string) => void;
  setComponentsRef: (componentId: string, componentRef: React.MutableRefObject<HTMLElement>) => void;
  setCurrentPageId: (pageId: string) => void;
  setShouldSave: (val: boolean) => void;
}

// 14. 危险操作接口
interface IDangerousOperations {
  dangerousCloneAndInsertComponent: (
    id: ComponentId,
    relativeId: ComponentId,
    insertType: InsertType,
    dsl?: IPageSchema
  ) => void;
  dangerousDeleteComponent: (id: ComponentId, callback?: () => void) => IComponentSchema | null;
  dangerousInsertComponent: (
    parentId: string,
    name: string,
    dependency: string,
    insertIndex?: number,
    opt?: { customId?: string; feature?: ComponentFeature },
    callback?: () => void
  ) => void;
  dangerousMultiDeleteComponent: (ids: ComponentId[], callback?: () => void) => IComponentSchema[] | null;
  dangerousUpdateComponentProps: (
    propsPartial: Record<string, any> | CSSProperties,
    targetComponent?: { id: string } | IComponentSchema
  ) => void;
}

// 完整的 Store 接口
export type IDSLStore = IDSLState &
  IDSLGetters &
  IActionManagement &
  IComponentBasicOperations &
  IComponentPropsOperations &
  IComponentQueries &
  IComponentStateManagement &
  IComponentRelationChecks &
  IUndoRedoOperations &
  IDSLOperations &
  IEventManagement &
  ITableOperations &
  IUtilityOperations &
  IDangerousOperations;
