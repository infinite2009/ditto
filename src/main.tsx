import React from 'react';
import ReactDOM from 'react-dom/client';
import { proxyFetch, proxyXHR } from '@/util';
import App from './App';

import './styles.module.less';

proxyFetch();
proxyXHR();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
