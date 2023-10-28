import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.module.less';
import { isMac } from '@/util';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  (await isMac()) ? (
    <App />
  ) : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);
