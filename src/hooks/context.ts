import React from 'react';
import DSLStore from '@/service/dsl-store';

export const DSLStoreContext = React.createContext<DSLStore>(DSLStore.createInstance());
