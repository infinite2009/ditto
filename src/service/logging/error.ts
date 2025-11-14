import { error } from 'tauri-plugin-log-api';

export default function errorCrossPlatform(str: string) {
  if (window.__TAURI__) {
    return error(str);
  }
  return console.error(str);
}
