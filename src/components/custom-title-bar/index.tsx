import { Button } from 'antd';
import { appWindow } from '@tauri-apps/api/window';

export default function CustomTitleBar() {
  function handleMaximize() {
    appWindow.maximize();
  }

  function handleMinimize() {
    appWindow.minimize();
  }

  function handleClose() {
    appWindow.close();
  }
  return (
    <div data-tauri-drag-region>
      <Button onClick={handleMaximize}>最大化</Button>
      <Button onClick={handleMinimize}>最小化</Button>
      <Button onClick={handleClose}>关闭</Button>
    </div>
  );
}
