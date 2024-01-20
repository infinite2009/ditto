import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.module.less';

import { proxyFetch, proxyXHR } from '@/util';

proxyFetch();
proxyXHR();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
