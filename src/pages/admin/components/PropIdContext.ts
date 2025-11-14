import { createContext, useContext } from 'react';

export const PropIdContext = createContext<string>('');

export const useCurrentPropId = () => useContext(PropIdContext);