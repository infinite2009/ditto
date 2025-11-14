import React from 'react';
import DSLStore from '@/service/dsl-store';
import EditorStore from '@/service/editor-store';
import AppStore from '@/service/app-store';
import { NavItem } from '@/pages/editor/page-config/NavConfig';
import { MenuItem } from '@/pages/editor/page-config/MenuConfig';
import IframeCommunicationService from '@/service/iframe-communication';

export const DSLStoreContext = React.createContext<DSLStore>(null);

export const EditorStoreContext = React.createContext<EditorStore>(null);

type EditorPageStoreContextType = {
  editorPageMethod: {
    fetchNav: () => Promise<NavItem[]>;
    fetchMenu: () => Promise<MenuItem[]>;
  };
};
export const EditorPageStoreContext = React.createContext<EditorPageStoreContextType>(null);

export const AppStoreContext = React.createContext<AppStore>(null);

export const IframeCommunicationContext = React.createContext<IframeCommunicationService>(null);