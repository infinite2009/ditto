import { deleteVoltronMaterialById } from '@/api';
import { fetchMaterialData } from './fetchMaterialData';
import { message, Modal } from 'antd';

export function createRemoveMaterial(id: string) {
  return function removeMaterial() {
    Modal.confirm({
      title: '删除组件',
      content: '确定删除该组件吗？',
      onOk: async () => {
        const result = await deleteVoltronMaterialById({
          id
        });
        if (result.code !== 0) {
          throw new Error(result.message);
        }
        message.success('删除成功');
        await fetchMaterialData();
      }
    });
  };
}
