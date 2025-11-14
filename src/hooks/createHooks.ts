import { ComponentId } from '@/types';

export default function createHooks(scriptDict: Record<ComponentId, string>) {
  const result = {};
  Object.entries(scriptDict).forEach(([componentId, script]) => {
    result[componentId] = new Function(script);
  });
  return result;
}