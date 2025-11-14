import { nanoid } from 'nanoid';

export interface MessagePayload {
  payload: Record<string, any>;
  type: string;
}

export enum IframeCommunicationServiceType {
  EXECUTE_DSL_STORE_METHOD = 'executeDSLStoreMethod',
  EXECUTE_EDITOR_STORE_METHOD = 'executeEditorStoreMethod',
  SAVE_FAVORITE = 'saveFavorite'
}

class IframeCommunicationService {
  // 静态属性，用来存储唯一的实例
  private static instance: IframeCommunicationService | null = null;
  public iframeWindow: Window;
  // 存储回调函数
  private callbacks: { [messageId: number]: (data: any) => void } = {};
  private iframeHandlers: ((data: Record<string, any>) => void)[] = [];
  // 用于生成唯一的消息 ID
  private messageId = 0;
  private parentWindow: Window;
  // fix: 重发管道，如果发送消息时，对方没有handler，等对方注册 handler 了，再发送
  private replayQueue = [];
  private windowHandlers: ((data: Record<string, any>) => void)[] = [];

  // 私有构造函数，避免外部直接实例化
  private constructor(iframeWindow: Window, parentWindow: Window) {
    this.iframeWindow = iframeWindow;
    this.parentWindow = parentWindow;
    this.initializeEventListeners();
  }

  // 获取单例实例
  public static getInstance(iframeWindow: Window, parentWindow: Window): IframeCommunicationService {
    if (!window.top['iframeCommunicationService']) {
      // 无论是父页面还是 iframe，谁先调用，都会生成这个实例，确保共用单例
      window.top['iframeCommunicationService'] = new IframeCommunicationService(iframeWindow, parentWindow);
      window.top['iframeCommunicationService'].id = nanoid();
    } else if (window.top['iframeCommunicationService'].iframeWindow !== iframeWindow) {
      // fix: 如果 iframe 被重新加载，则需要更新
      window.top['iframeCommunicationService'].setIframeWindow(iframeWindow);
      // fix: 清除之前 iframe handler
      window.top['iframeCommunicationService'].iframeHandlers = [];
      // fix: 清空重放队列
      window.top['iframeCommunicationService'].replayQueue = [];
    }
    // 如果一方页面已经创建过实例了，赋值自己的实例
    IframeCommunicationService.instance = window.top['iframeCommunicationService'];
    return IframeCommunicationService.instance;
  }

  addIframeHandler(handler: (data) => void) {
    this.iframeHandlers.push(handler);
    while (this.replayQueue.length) {
      const { messageId, message } = this.replayQueue.shift();
      this.iframeHandlers.forEach(fn => {
        fn(message);
      });
      if (this.callbacks[messageId]) {
        this.callbacks[messageId](message); // 调用对应的回调函数
        delete this.callbacks[messageId]; // 消息处理后删除回调
      }
    }
  }

  addWindowHandler(handler: (data) => void) {
    this.windowHandlers.push(handler);
  }

  public destroyIframe() {
    this.iframeWindow?.removeEventListener('message', this.handleMessageFromIframe);
    this.iframeHandlers = [];
  }

  // 销毁事件监听器
  public destroyWindow(): void {
    this.parentWindow.removeEventListener('message', this.handleMessageFromParent);
    this.windowHandlers = [];
    // 清除单例实例
    IframeCommunicationService.instance = null;
  }

  removeIframeHandler(handler) {
    const index = this.iframeHandlers.findIndex(fn => fn === handler);
    if (index > -1) {
      this.iframeHandlers.slice(index, 1);
    }
  }

  removeWindowHandler(handler) {
    const index = this.windowHandlers.findIndex(fn => handler === fn);
    if (index > -1) {
      this.windowHandlers.splice(index, 1);
    }
  }

  // 向 iframe 页面发送消息，并指定回调
  public sendMessageToIframe(message: MessagePayload, callback?: (response: any) => void): void {
    const messageId = this.generateMessageId();
    if (callback) {
      this.callbacks[messageId] = callback;
    }
    // 发送消息时包含唯一的 messageId
    if (this.iframeWindow.location.origin === 'null' || this.iframeWindow.location.origin === null) {
      return;
    }
    if (this.iframeHandlers.length) {
      this.iframeWindow?.postMessage({ messageId, data: message, from: 'voltron' }, this.iframeWindow.location.origin);
    } else {
      this.replayQueue.push({
        messageId,
        message
      });
    }
  }

  // 向父页面发送消息，并指定回调
  public sendMessageToParent(message: MessagePayload, callback?: (response: any) => void): void {
    const messageId = this.generateMessageId();
    this.callbacks[messageId] = callback;
    // 发送消息时包含唯一的 messageId
    this.parentWindow.postMessage({ messageId, data: message, from: 'voltron' }, this.parentWindow.location.origin);
  }

  public setIframeWindow(window: Window) {
    this.iframeWindow = window;
    this.iframeWindow.addEventListener('message', this.handleMessageFromParent.bind(this));
  }

  // 生成唯一的消息 ID
  private generateMessageId(): number {
    return ++this.messageId; // 每次增加，保证唯一性
  }

  // 处理从 iframe 页面发送来的消息
  private handleMessageFromIframe(event: MessageEvent): void {
    // 这里可以加入更强的安全性校验（比如验证来源等）
    if (event.origin !== this.iframeWindow.location.origin) {
      return; // 忽略不信任的消息来源
    }
    const { messageId, data, from } = event.data;
    // 有可能是某些插件发来的信息，它不会有 from 这个标识，或者 from 不是 voltron，直接忽略
    if (from !== 'voltron') {
      return;
    }

    if (this.windowHandlers) {
      this.windowHandlers.forEach(fn => fn(data));
    }

    if (this.callbacks[messageId]) {
      this.callbacks[messageId](data); // 调用对应的回调函数
      delete this.callbacks[messageId]; // 消息处理后删除回调
    }
  }

  // 处理从父页面发送来的消息
  private handleMessageFromParent(event: MessageEvent): void {
    // 这里可以加入更强的安全性校验（比如验证来源等）
    if (event.origin !== this.parentWindow.location.origin) {
      return; // 忽略不信任的消息来源
    }

    const { messageId, data } = event.data;

    if (this.iframeHandlers.length) {
      this.iframeHandlers.forEach(fn => fn(data));
    }

    if (this.callbacks[messageId]) {
      this.callbacks[messageId](data); // 调用对应的回调函数
      delete this.callbacks[messageId]; // 消息处理后删除回调
    }
  }

  // 初始化父窗口和 iframe 的消息监听
  private initializeEventListeners(): void {
    // 监听父页面发来的消息
    this.parentWindow.addEventListener('message', this.handleMessageFromIframe.bind(this));

    // 监听 iframe 发来的消息
    this.iframeWindow?.addEventListener('message', this.handleMessageFromParent.bind(this));
  }
}

export default IframeCommunicationService;
