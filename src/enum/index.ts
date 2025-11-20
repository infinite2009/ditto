enum ROUTE_NAMES {
  PROJECT_MANAGEMENT = '/',
  PAGE_EDIT = '/page-edit',
  PAGE_PREVIEW = '/page-preview',
  IFRAME_DND = '/page-edit/iframe-dnd',
  PAGE_DESIGN = '/page-design',
  ADMIN = '/admin',
  TEST_CODE = '/test-code'
}

export default ROUTE_NAMES;

export enum UrlType {
  EXTERNAL_LINK,
  INTERNAL_LINK
}

export enum HOTKEY_SCOPE {
  CANVAS = 'CANVAS',
  GLOBAL = 'GLOBAL',
  EDITOR = 'EDITOR',
  PROJECT_MANAGEMENT = 'PROJECT_MANAGEMENT',
  PREVIEW = 'PREVIEW',
  ADMIN = 'ADMIN'
}

export enum PageWidth {
  wechat = 900,
  windows = 1280,
  mac = 1440,
  monitor = 1920,
  auto = 0
}