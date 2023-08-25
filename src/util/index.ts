import { nanoid } from 'nanoid';
import componentConfig from '@/data/component-dict';

export function toUpperCase(str: string): string  {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function typeOf(value: any): string {
  const typeStr = Object.prototype.toString.call(value);
  const match = typeStr.match(/\[object (.+)\]/);
  if (match?.length) {
    return match[1].toLowerCase();
  }
  throw new Error(`unknown type: ${typeStr}`);
}

export function generateId() {
  return nanoid();
}

export function fetchComponentConfig(name: string, dependency: string) {
  return componentConfig[dependency][name];
}