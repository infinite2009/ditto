import ProjectManagement from '@/pages/project-management';
import Preview from '@/pages/preview';
import ROUTE_NAMES, { HOTKEY_SCOPE } from '@/enum';
import IframeCanvas from '@/pages/iframe-canvas';
import Designer from '@/pages/designer';
import AdminPage from '@/pages/admin';
import TestCode from '@/pages/test-code';
import Editor from '@/pages/editor';

const routes = [
  {
    path: ROUTE_NAMES.PROJECT_MANAGEMENT,
    name: '项目管理',
    element: ProjectManagement,
    hotkeyScopes: [HOTKEY_SCOPE.PROJECT_MANAGEMENT]
  },
  {
    path: ROUTE_NAMES.PAGE_EDIT,
    name: '页面编辑',
    element: Designer,
    hotkeyScopes: [HOTKEY_SCOPE.EDITOR]
    // children: [
    //   {
    //     path: RouteNames.iframeDnd,
    //     name: '跨iframe拖拽',
    //     element: IframeContent,
    //   },
    // ]
  },
  {
    path: ROUTE_NAMES.PAGE_DESIGN,
    name: '页面设计',
    element: Editor,
    hotkeyScopes: [HOTKEY_SCOPE.EDITOR]
  },
  {
    path: ROUTE_NAMES.IFRAME_DND,
    name: '跨iframe拖拽',
    element: IframeCanvas,
    hotkeyScopes: [HOTKEY_SCOPE.CANVAS]
  },
  {
    path: ROUTE_NAMES.PAGE_PREVIEW,
    name: '预览',
    element: Preview,
    hotkeyScopes: [HOTKEY_SCOPE.PREVIEW]
  },
  {
    path: ROUTE_NAMES.ADMIN,
    name: '开发者配置',
    element: AdminPage,
    hotkeyScopes: [HOTKEY_SCOPE.ADMIN]
  },
  {
    path: ROUTE_NAMES.TEST_CODE,
    name: '测试代码',
    element: TestCode,
    hotkeyScopes: []
  }
];

export default routes;
