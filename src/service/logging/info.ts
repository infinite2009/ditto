import { info } from 'tauri-plugin-log-api';

export default function infoCrossPlatform(str: string) {
  if (window.__TAURI__) {
    return info(str);
  }
  return console.log(str);
}
