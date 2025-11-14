import { message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { checkUpdate, installUpdate, onUpdaterEvent, UpdateManifest } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import { error } from 'tauri-plugin-log-api';

enum ModalState {
  updateLoading,
  versionInfo,
  relaunch,
  close
}

export function UpdateModal() {
  const [open, setOpen] = useState<boolean>(false);
  const [modalState, setModalState] = useState<ModalState>(ModalState.close);
  const [manifest, setManifest] = useState<UpdateManifest>(null);

  useEffect(() => {
    console.log('更新检测中...');
    let unlisten = () => {};
    onUpdaterEvent(({ error, status }) => {
      console.log('更新中出现错误：', error);
      console.log('更新状态：', status);
    }).then(callback => (unlisten = callback));
    checkUpdate().then(({ shouldUpdate, manifest }) => {
      if (shouldUpdate) {
        openModal();
        showVersionInfo();
        setManifest(manifest);
      }
    });
    return unlisten;
  }, []);

  function openModal() {
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  async function updateAndRelaunch() {
    console.log('开始下载更新文件...');
    showUpdateLoading();
    try {
      await installUpdate();
      showRelaunch();
    } catch (err) {
      message.error('更新失败').then();
      error('更新失败：', err.toString()).then();
      closeModal();
    }

    try {
      await relaunch();
    } catch (err) {
      message.error('重启失败：', err.toString()).then();
      error('重启失败：', err.toString()).then();
    } finally {
      closeModal();
    }
  }

  function showVersionInfo() {
    setModalState(ModalState.versionInfo);
  }

  function showUpdateLoading() {
    setModalState(ModalState.updateLoading);
  }

  function showRelaunch() {
    setModalState(ModalState.relaunch);
  }

  function renderContent() {
    let versionDetail = null;
    if (manifest?.body) {
      const detailObj = JSON.parse(manifest.body).changeLog;
      versionDetail = (
        <div>
          {detailObj.features.length ? (
            <>
              <div>功能：</div>
              <div>
                {detailObj.features.map((item: string) => {
                  return <span>{item}</span>;
                })}
              </div>
            </>
          ) : null}
          {detailObj.fix.length ? (
            <>
              <div>修复：</div>
              <div>
                {detailObj.fix.map((item: string) => {
                  return <span>{item}</span>;
                })}
              </div>
            </>
          ) : null}
        </div>
      );
    }
    switch (modalState) {
      case ModalState.versionInfo:
        return (
          <div>
            <div>更新版本：{manifest?.version}</div>
            <div>版本发布日期：{manifest?.date}</div>
            <div>{versionDetail}</div>
          </div>
        );
      case ModalState.updateLoading:
        return <div>更新中，请稍候...</div>;
      case ModalState.relaunch:
        return <div>重启中...</div>;
      default:
        return null;
    }
  }

  return (
    <Modal
      open={open}
      maskClosable={false}
      title={null}
      footer={modalState !== ModalState.versionInfo ? null : undefined}
      onOk={updateAndRelaunch}
      onCancel={closeModal}
      okText="更新并重新启动"
      cancelText="跳过此版本"
    >
      {renderContent()}
    </Modal>
  );
}
