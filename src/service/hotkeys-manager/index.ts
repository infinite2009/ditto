/**
 * @file 快捷键管理器
 * @author luodongyang<luodongyang@bilibili.com>
 * 这一套成员命名有点不准确，最开始没想清楚概念之间的关系
 */
import { getPlatform } from '@/util';
import { Platform } from '@tauri-apps/api/os';
import { HotkeysEvent } from 'react-hotkeys-hook/packages/react-hotkeys-hook/dist/types';

export enum HotkeyAction {
  ZOOM_REVERT = 'revert',
  CLEAR_CANVAS = 'clearCanvas',
  SELECT_ALL = 'selectAll',
  CANCEL = 'cancel',
  CUT = 'cut',
  COPY = 'copy',
  PASTE = 'paste',
  SAVE = 'save',
  UNDO = 'undo',
  REDO = 'redo',
  RENAME = 'rename',
  // 切换批注
  ANNOTATION = 'annotation',
  // 宽屏展示
  TOGGLE_CANVAS_EXPANSION = 'toggleCanvasExpansion',
  // 预览
  PREVIEW = 'preview',
  // 分享
  SHARE = 'share',
  // 切换设计/代码视图
  TOGGLE_DESIGN_AND_CODE = 'toggleDesignAndCode',
  // 下载代码
  DOWNLOAD_CODE = 'downloadCode',
  // 导出模板 or 模块，取决于用户当时选中的是普通组件还是页面根组件
  EXPORT = 'export',
  // 按下快捷键时，拖动组件进行复制插入
  COPY_INSERT = 'copy_insert',
  // 增加宽度
  WIDEN = 'widen',
  // 减少宽度
  NARROW = 'narrow',
  // 增加高度
  HEIGHTEN = 'heighten',
  // 减少高度
  SHRINK = 'shrink',
  // 填充父组件
  FILL = 'fill',
  // 包裹子组件
  HUG = 'hug',
  // 增加垂直 padding
  PADDING_VERTICAL_UP = 'paddingUp',
  // 减少垂直 padding
  PADDING_VERTICAL_DOWN = 'paddingDown',
  // 增加水平 padding
  PADDING_HORIZONTAL_UP = 'paddingLeft',
  // 减少水平 padding
  PADDING_HORIZONTAL_DOWN = 'paddingRight',
  // 增加 gap
  GAP_UP = 'gapUp',
  // 减少 gap
  GAP_DOWN = 'gapDown',
  // 增加行 gap
  ROW_GAP_UP = 'marginUp',
  // 减少行 gap
  ROW_GAP_DOWN = 'marginDown',
  // 增加列 gap
  COLUMN_GAP_UP = 'columnGapUp',
  // 减少列 gap
  COLUMN_GAP_DOWN = 'columnGapDown',
  // 增加字体大小
  TEXT_SIZE_UP = 'textSizeUp',
  // 减少字体大小
  TEXT_SIZE_DOWN = 'textSizeDown',
  // 增加行高
  LINE_HEIGHT_UP = 'lineHeightUp',
  // 减少行高
  LINE_HEIGHT_DOWN = 'lineHeightDown',
  // 切换字体加粗
  TOGGLE_TEXT_BOLD = 'textBold',
  // 增加斜体
  TOGGLE_TEXT_ITALIC = 'fontStyleItalic',
  // 增加字体下划线
  TOGGLE_TEXT_UNDERLINE = 'textUnderline',
  MULTIPLE_SELECT = 'multiSelect',
  PREV_SIBLING = 'previousSibling',
  NEXT_SIBLING = 'nextSibling',
  SELECT_ANCESTOR = 'previousAncestor',
  SELECT_CHILD = 'selectChild',
  OPEN_SETTING = 'openSetting',
  DELETE = 'delete',
  REMOVE = 'remove',
  TOGGLE_HIDE = 'toggleHide',
  ZOOM_IN = 'zoomIn',
  ZOOM_OUT = 'zoomOut'
}

export type Hotkey = {
  key: string;
  modifiers: string[];
  title: string;
  scope: 'code' | 'component' | 'designer' | 'global';
  hotkey?: string;
  displayName?: string;
};
export type HotkeyDict = { [key in HotkeyAction]?: Hotkey };

export default class HotkeysManager {
  static hotkeysConfigCache: HotkeyDict | null | undefined = undefined;
  static platform: Platform | 'unknown' = undefined;

  static fetchHotkey(action: HotkeyAction) {
    if (HotkeysManager.platform) {
      return HotkeysManager.hotkeysConfigCache?.[action] || null;
    }
    return null;
  }

  static async fetchHotkeysConfig(): Promise<HotkeyDict> {
    if (HotkeysManager.hotkeysConfigCache) {
      return Promise.resolve(HotkeysManager.hotkeysConfigCache);
    }
    const darwinDict: HotkeyDict = {
      [HotkeyAction.ZOOM_IN]: { key: 'minus', modifiers: ['meta'], title: '缩小', scope: 'global'},
      [HotkeyAction.ZOOM_OUT]: { key: 'equal', modifiers: ['meta'], title: '放大', scope: 'global'},
      [HotkeyAction.ZOOM_REVERT]: { key: '0', modifiers: ['meta'], title: '放大', scope: 'global'},
      [HotkeyAction.RENAME]: { key: 'r', modifiers: ['meta'], title: '重命名', scope: 'global' },
      [HotkeyAction.ANNOTATION]: {  key: 'a', modifiers: ['alt', 'meta'], title: '切换批注模式', scope: 'global'},
      [HotkeyAction.CLEAR_CANVAS]: { key: 'c', modifiers: ['alt', 'meta'], title: '清空画布', scope: 'component' },
      [HotkeyAction.CANCEL]: { key: 'escape', modifiers: [], title: '取消', scope: 'global' },
      [HotkeyAction.COPY]: { key: 'c', modifiers: ['meta'], title: '复制', scope: 'global' },
      [HotkeyAction.CUT]: { key: 'x', modifiers: ['meta'], title: '剪切', scope: 'global' },
      [HotkeyAction.SAVE]: { key: 's', modifiers: ['meta'], title: '保存', scope: 'global' },
      [HotkeyAction.PASTE]: { key: 'v', modifiers: ['meta'], title: '粘贴', scope: 'global' },
      [HotkeyAction.UNDO]: { key: 'z', modifiers: ['meta'], title: '撤销', scope: 'global' },
      [HotkeyAction.REDO]: { key: 'z', modifiers: ['meta', 'shift'], title: '重做', scope: 'global' },
      [HotkeyAction.TOGGLE_CANVAS_EXPANSION]: {
        key: 'e',
        modifiers: ['meta'],
        title: '宽屏展示',
        scope: 'global'
      },
      [HotkeyAction.PREVIEW]: { key: 'p', modifiers: ['alt', 'meta'], title: '预览', scope: 'global' },
      [HotkeyAction.SHARE]: { key: 's', modifiers: ['alt', 'meta'], title: '分享', scope: 'global' },
      [HotkeyAction.TOGGLE_DESIGN_AND_CODE]: {
        key: 'd',
        modifiers: ['meta'],
        title: '切换设计/代码视图',
        scope: 'global'
      },
      // 对于这种同一个快捷键，在不同上下文语义不一样的情况，需要在调用侧进行title覆盖，例如选中页面是“导出为模板”，选中组件是“导出为模块”
      [HotkeyAction.EXPORT]: { key: 'e', modifiers: ['alt', 'meta'], title: '导出', scope: 'component' },
      [HotkeyAction.SELECT_ALL]: { key: 'a', modifiers: ['meta'], title: '全选', scope: 'component' },
      [HotkeyAction.MULTIPLE_SELECT]: { key: 'left', modifiers: ['meta'], title: '多选', scope: 'component' },
      [HotkeyAction.PREV_SIBLING]: { key: 'arrowleft', modifiers: ['meta'], title: '前一个', scope: 'component' },
      [HotkeyAction.NEXT_SIBLING]: { key: 'arrowright', modifiers: ['meta'], title: '下一个', scope: 'component' },
      [HotkeyAction.SELECT_ANCESTOR]: {
        key: 'arrowup',
        modifiers: ['meta'],
        title: '选择祖先组件',
        scope: 'component'
      },
      [HotkeyAction.SELECT_CHILD]: { key: 'arrowdown', modifiers: ['meta'], title: '选择子组件', scope: 'component' },
      [HotkeyAction.DELETE]: { key: 'delete', modifiers: [], title: '删除', scope: 'global' },
      [HotkeyAction.REMOVE]: { key: 'backspace', modifiers: [], title: '删除', scope: 'global' },
      [HotkeyAction.COPY_INSERT]: { key: 'left', modifiers: ['alt'], title: '复制插入', scope: 'component' },
      [HotkeyAction.HEIGHTEN]: { key: 'arrowup', modifiers: ['alt'], title: '增加高度', scope: 'component' },
      [HotkeyAction.SHRINK]: { key: 'arrowdown', modifiers: ['alt'], title: '降低高度', scope: 'component' },
      [HotkeyAction.NARROW]: { key: 'arrowleft', modifiers: ['alt'], title: '缩小宽度', scope: 'component' },
      [HotkeyAction.WIDEN]: { key: 'arrowright', modifiers: ['alt'], title: '增大宽度', scope: 'component' },
      [HotkeyAction.FILL]: { key: 'f', modifiers: ['meta'], title: '填充', scope: 'component' },
      [HotkeyAction.HUG]: { key: 'h', modifiers: ['meta'], title: '收缩', scope: 'component' },
      [HotkeyAction.TOGGLE_TEXT_BOLD]: { key: 'b', modifiers: ['meta'], title: '文字加粗', scope: 'component' },
      [HotkeyAction.GAP_DOWN]: { key: '-', modifiers: ['alt'], title: '减小间隙', scope: 'component' },
      [HotkeyAction.GAP_UP]: { key: '+', modifiers: ['alt'], title: '增大间隙', scope: 'component' },
      [HotkeyAction.PADDING_VERTICAL_UP]: {
        key: 'arrowup',
        modifiers: ['alt', 'shift'],
        title: '增加垂直内间距',
        scope: 'component'
      },
      [HotkeyAction.PADDING_VERTICAL_DOWN]: {
        key: 'arrowdown',
        modifiers: ['alt', 'shift'],
        title: '降低垂直内间距',
        scope: 'component'
      },
      [HotkeyAction.PADDING_HORIZONTAL_DOWN]: {
        key: 'arrowleft',
        modifiers: ['alt', 'shift'],
        title: '减少水平内间距',
        scope: 'component'
      },
      [HotkeyAction.PADDING_HORIZONTAL_UP]: {
        key: 'arrowright',
        modifiers: ['alt', 'shift'],
        title: '增加水平内间距',
        scope: 'component'
      },
      [HotkeyAction.TOGGLE_HIDE]: {
        key: 'h',
        modifiers: ['meta'],
        title: '切换显示/隐藏',
        scope: 'component',
      }
    };

    const platform = await getPlatform();
    if (platform === 'darwin') {
      HotkeysManager.hotkeysConfigCache = darwinDict;
    } else {
      // 转化 mac 系统的快捷键为 window 系统的快捷键，方便在 window 系统上使用
      const winDict = {};
      Object.entries(darwinDict).forEach(([key, val]) => {
        const keyForWin = HotkeysManager.transferMacHotkeyToWin(key);
        winDict[keyForWin] = val;
      });
      HotkeysManager.hotkeysConfigCache = winDict;
    }
    // 计算快捷键的 hotkey（用于监听），以及 displayName（用于展示名称）
    Object.keys(HotkeysManager.hotkeysConfigCache).forEach((key: HotkeyAction) => {
      HotkeysManager.hotkeysConfigCache[key].hotkey = HotkeysManager.generateHotkeysForListener(HotkeysManager.hotkeysConfigCache[key]);
      HotkeysManager.hotkeysConfigCache[key].displayName = HotkeysManager.generateHotkeyDisplayName(HotkeysManager.hotkeysConfigCache[key]);
    });
    return HotkeysManager.hotkeysConfigCache;
  }

  static generateHotkey(hotkeysEvent: HotkeysEvent) {
    const result = [];
    const { keys, alt, ctrl, meta, shift } = hotkeysEvent;
    if (alt) {
      result.push('alt');
    }
    if (ctrl) {
      result.push('ctrl');
    }
    if (meta) {
      result.push('meta');
    }
    if (shift) {
      result.push('shift');
    }
    result.push(keys[0]);
    return result.join('+');
  }

  static generateHotkeyDisplayName(hotkey: Hotkey) {
    const win32ModifierDict = {
      ctrl: 'Ctrl',
      alt: 'Alt',
      shift: 'Shift',
      meta: 'Win',
      backspace: '←'
    };
    const darwinModifierDict = {
      ctrl: '⌃',
      alt: '⌥',
      shift: '⇧',
      meta: '⌘',
      backspace: '⌫'
    };
    const modifierDict = HotkeysManager.platform === 'darwin' ? darwinModifierDict : win32ModifierDict;

    const result = [];
    const { key, modifiers } = hotkey;
    if (modifiers.includes('alt')) {
      result.push(modifierDict.alt);
    }
    if (modifiers.includes('ctrl')) {
      result.push(modifierDict.ctrl);
    }
    if (modifiers.includes('meta')) {
      result.push(modifierDict.meta);
    }
    if (modifiers.includes('shift')) {
      result.push(modifierDict.shift);
    }
    if (key === 'backspace') {
      result.push(modifierDict.backspace);
    } else {
      result.push(key.toUpperCase());
    }
    return result.join('+');
  }

  static generateHotkeyDisplayNameByAction(action: HotkeyAction): string {
    const hotkey = HotkeysManager.fetchHotkey(action);
    return HotkeysManager.generateHotkeyDisplayName(hotkey);
  }

  static generateHotkeysForListener(hotkey: Hotkey) {
    const result = [];
    const { key, modifiers } = hotkey;
    if (modifiers.includes('alt')) {
      result.push('alt');
    }
    if (modifiers.includes('ctrl')) {
      result.push('ctrl');
    }
    if (modifiers.includes('meta')) {
      result.push('meta');
    }
    if (modifiers.includes('shift')) {
      result.push('shift');
    }
    result.push(key);
    return result.join('+');
  }

  static generateHotkeysForListenerByAction(action: HotkeyAction) {
    return HotkeysManager.fetchHotkey(action);
  }

  static async init() {
    HotkeysManager.platform = await getPlatform();
    await HotkeysManager.fetchHotkeysConfig();
  }

  static transferMacHotkeyToWin(hotkey: string) {
    return hotkey.replace('meta', 'ctrl');
  }
}
