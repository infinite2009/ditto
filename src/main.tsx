import React from 'react';
import ReactDOM from 'react-dom/client';
import { info } from '@/service/logging';
import { isWeb, proxyFetch, proxyXHR } from '@/util';
import { appWindow } from '@tauri-apps/api/window';
import { TauriEvent } from '@tauri-apps/api/event';
import App from './App';
import './styles.css';
import { loader } from '@monaco-editor/react';

info('main.tsx: 应用 UI 部分已启动');
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

import './styles.less';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};
loader.config({ monaco });
// proxyConsole();
proxyFetch();
proxyXHR();
if (!isWeb()) {
  appWindow
    .listen(TauriEvent.WINDOW_CLOSE_REQUESTED, () => {
      info('main.tsx: 正在关闭应用...');
    })
    .then();
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
