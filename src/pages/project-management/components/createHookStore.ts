import { createContext, createElement, useContext } from 'react';
import { create, StoreApi, UseBoundStore } from 'zustand';

export const createHookStore = <T, P>(creator: (set: (value: Partial<T>) => void, get: () => T, props: P) => T) => {
  const Context = createContext<UseBoundStore<StoreApi<T>>>(null);
  const Provider = ({ children, props }: { children: React.ReactNode; props: P }) => {
    const useStore = create<T>((set, get) => creator(set, get, props));
    return createElement(Context.Provider, { value: useStore }, children);
  };
  const useStore: () => UseBoundStore<StoreApi<T>> = () => {
    return useContext(Context);
  };
  return [Provider, useStore] as const;
};
