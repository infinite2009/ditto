import { validateMaterialData } from '../components/createFormModel';
import { requiredInMaterialFields, requiredInPropsFields } from '../components/CreateMaterialFormFields';
import { patchVoltronMaterialById } from '@/api/services';
import { MaterialDTO } from '../types';
import { message } from 'antd';
import { fetchMaterialData } from './fetchMaterialData';
import { formModelValues } from '../formutils/transformer';
import { useModifyMaterialFormData } from '../store/modifyMaterialFormData';

export function createUpdateMaterialData(getFormData: () => any) {
  return async function updateMaterialData() {
    const formData = getFormData();
    console.log('formData', formData);
    if (!formData) {
      return;
    }
    console.log('validateMaterialData', validateMaterialData(requiredInMaterialFields, requiredInPropsFields, getFormData));
    if (!validateMaterialData(requiredInMaterialFields, requiredInPropsFields, getFormData)) {
      return;
    }

    const dataValue = formModelValues(formData) as unknown as MaterialDTO;

    try {
      const result = await patchVoltronMaterialById(dataValue);
      if (result.code !== 0) {
        throw new Error(result.message);
      }
      message.success('更新成功');
      await fetchMaterialData();
      useModifyMaterialFormData.setState(null);
    } catch (error) {
      console.error('error_in_create_material_data', error);
      message.error(`更新失败: ${error.message}`);
    }
  };
}
