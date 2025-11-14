import { cloneDeep, isEqual } from "lodash";
import { DependencyList, useEffect, useRef } from "react";

const useDeepEffect = (callback: React.EffectCallback, dependencies: DependencyList) => {
  const prevDependencies = useRef<DependencyList>();

  if (!isEqual(dependencies, prevDependencies.current)) {
    prevDependencies.current = cloneDeep(dependencies);
  }

  useEffect(callback, [prevDependencies.current]);
};

export default useDeepEffect;