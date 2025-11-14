/** 创建物料 */

import { CreateMaterialFormData, MaterialDTO } from '../types';
import { postVoltronMaterial } from '@/api';
import { useAdminPageStore } from '../store/store';
import { validateMaterialData } from '../components/createFormModel';
import { message } from 'antd';
import { fetchMaterialData } from './fetchMaterialData';
import { requiredInMaterialFields, requiredInPropsFields } from '../components/CreateMaterialFormFields';
import { getCreateMaterialFormModel, getCreateMaterialFormValues } from '../store/createMaterialFormData';

export async function createMaterialData() {
  const formData = getCreateMaterialFormModel();
  console.log(
    'formData',
    formData,
    validateMaterialData(requiredInMaterialFields, requiredInPropsFields, getCreateMaterialFormModel)
  );
  if (!validateMaterialData(requiredInMaterialFields, requiredInPropsFields, getCreateMaterialFormModel)) {
    return;
  }

  // 创建时补全数据

  const dataValue = getCreateMaterialFormValues();
  const material = completeMaterial(dataValue);

  try {
    const result = await postVoltronMaterial(material);
    if (result.code !== 0) {
      throw new Error(result.message);
    }
    message.success('创建成功');
    await fetchMaterialData();
    useAdminPageStore.getState().setShowCreateModal(false);
  } catch (error) {
    console.error('error_in_create_material_data', error);
    message.error('创建失败');
  }
}

// 修订 material 做创建时的必须数据
function completeMaterial(material: CreateMaterialFormData): MaterialDTO {
  return {
    ...(material as MaterialDTO),
    importName: material.importName || material.callingName,
    configName: material.configName || material.callingName,
    categories: material.categories || '默认',
    keywords: material.keywords || '默认',
    coverUrl: material.coverUrl || 'todo:默认的封面URL',
    props: material.props.map(prop => ({
      ...prop,
      valueSource: prop.valueSource || '默认',
      category: prop.category || '默认'
    }))
  };
}
