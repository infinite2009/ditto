import { createContext, createElement, useContext } from "react";
import { create, StoreApi, UseBoundStore } from "zustand";
export const createHookStore = <T, P>(
  creator: (set: (value: Partial<T>) => void, get: () => T, props: P) => T
) => {
  const Context = createContext<UseBoundStore<StoreApi<T>> | null>(null);
  const Provider: React.FC<React.PropsWithChildren<{ props: P }>> = ({
    props,
    children,
  }) => {
    const useStore = create<T>((set, get) => creator(set, get, props));
    return createElement(Context.Provider, { value: useStore }, children);
  };
  const useStore: () => UseBoundStore<StoreApi<T>> = () => {
    const store = useContext(Context);
    if (!store) {
      throw new Error("useStore must be used within a Provider");
    }
    return store;
  };

  const createComponent = (fc: React.FC<React.PropsWithChildren>) => {
    const Component: React.FC<React.PropsWithChildren<P>> = (props) => {
      const inner = createElement(fc, null, props.children);
      // console.log("createComponent", props);
      // eslint-disable-next-line react/no-children-prop
      return createElement(Provider, { props, children: null }, inner);
    };
    Component.displayName = `createComponent(${fc.displayName || fc.name})`;
    return Component;
  };

  return [createComponent, useStore] as const;
};
