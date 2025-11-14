import { create } from 'zustand';

type Store = {
  iframe: HTMLIFrameElement | null;
  pageRoot: HTMLDivElement | null;
  iframeWindow: Window | null;
  iframeDocument: Document | null;
  setIframe: (iframe: HTMLIFrameElement | null) => void;
  setPageRoot: (pageRoot: HTMLDivElement | null) => void;
  setIframeWindow: (iframeWindow: Window | null) => void;
  setIframeDocument: (iframeDocument: Document | null) => void;
  isSwitching: boolean;
  setIsSwitching: (isSwitching: boolean) => void;
};

const useIframeStore = create<Store>((set) => ({
  iframe: null,
  pageRoot: null,
  iframeWindow: null,
  iframeDocument: null,
  isSwitching: false,
  setIsSwitching: (isSwitching) => set(() => ({ isSwitching: isSwitching })),
  setIframe: (iframe) => set(() => ({ iframe })),
  setPageRoot: (pageRoot) => set(() => ({ pageRoot })),
  setIframeWindow: (iframeWindow) => set(() => ({ iframeWindow })),
  setIframeDocument: (iframeDocument) => set(() => ({ iframeDocument })),
}));

export default useIframeStore;