import { App } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HotkeysProvider } from 'react-hotkeys-hook';
import IframeCanvas from '@/pages/iframe-canvas';
import { HOTKEY_SCOPE } from '@/enum';

import './style.less';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HotkeysProvider initiallyActiveScopes={[HOTKEY_SCOPE.CANVAS]}>
    <App>
      <IframeCanvas />
    </App>
  </HotkeysProvider>
);
