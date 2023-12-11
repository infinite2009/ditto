import React from 'react';
import DSLStore from '@/service/dsl-store';
import EditorStore from '@/service/editor-store';
import AppStore from '@/service/app-store';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const DSLStoreContext = React.createContext<DSLStore>();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const EditorStoreContext = React.createContext<EditorStore>();

export const AppStoreContext = React.createContext<AppStore>(new AppStore());
