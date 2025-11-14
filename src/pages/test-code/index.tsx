import React from 'react';
import { Button, Drawer, Input, InputNumber, Modal } from '@bilibili/ui';
import userPageStore from './store';

export default function Zaiceshi() {
  /**
   本代码由 Voltron 自动生成，不要修改
   */

  const {
    drawerOpen,
    modalOpen,
    openStateOfModal5,
    handleClosingOfDrawer0,
    handleClickingOfButton1,
    handleCancelingOfModal0,
    handleOkOfModal0,
    handleClickingOfButton2,
    handleClickingOfButton0
  } = userPageStore();
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Input.TextArea allowClear bordered maxLength={1000} showCount defaultValue="src/components" />
      <Input.Password allowClear bordered showCount={false} />
      <InputNumber defaultValue={2} controls disabled={false} />
      <Drawer open={drawerOpen} title="新建抽屉" onClose={handleClosingOfDrawer0}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, height: '100%' }}>
          <Button style={{ padding: 8 }} onClick={handleClickingOfButton0}>
            按钮
          </Button>
        </div>
      </Drawer>
      <Button style={{ padding: 8 }} onClick={handleClickingOfButton1}>
        新建表单
      </Button>
      <Modal
        title="默认弹窗"
        open={modalOpen}
        onCancel={handleCancelingOfModal0}
        onOk={handleOkOfModal0}
        getContainer=""
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, height: '100%' }} />
      </Modal>
      <Button style={{ padding: 8 }} onClick={handleClickingOfButton2}>
        编辑表单
      </Button>
      <Modal title="默认弹窗" open={openStateOfModal5} getContainer="">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, height: '100%' }} />
      </Modal>
    </div>
  );
}