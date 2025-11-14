import { useAdminPageStore } from '../store/store';
import { validateMaterialData } from '../components/createFormModel';
import { requiredInMaterialFields, requiredInPropsFields } from '../components/CreateMaterialFormFields';
import { postVoltronMaterialPropBatchDelete, patchVoltronMaterialPropsBatch } from '@/api/services';
import { MaterialDTO } from '../types';
import { message } from 'antd';
import { fetchMaterialData } from './fetchMaterialData';
import { formModelValues } from '../formutils/transformer';
import { useModifyMaterialPropsFormData } from '../store/modifyMaterialPropsFormData';

export function createUpdateMaterialPropsData(getFormData: () => any) {
  return async function updateMaterialPropsData() {
    const formData = getFormData();
    console.log('formData', formData);
    if (!formData) {
      return;
    }

    if (!validateMaterialData(requiredInMaterialFields, requiredInPropsFields, getFormData)) {
      return;
    }

    const dataValue = formModelValues(formData) as unknown as MaterialDTO;
    console.debug('formData values', dataValue);

    try {
      const result = await patchVoltronMaterialPropsBatch({
        materialId: Number(dataValue.id),
        props: dataValue.props.map(prop => ({
          id: Number(prop.id),
          displayName: prop.displayName,
          propName: prop.propName,
          valueType: prop.valueType,
          propValue: prop.propValue,
          templateKeyPathsReg: prop.templateKeyPathsReg,
          valueSource: prop.valueSource
        }))
      });
      if (result.code !== 0) {
        throw new Error(result.message);
      }
      // 删除不存在的属性
      const targetMaterial = useAdminPageStore.getState().material.find(material => material.id === dataValue.id);
      if (!targetMaterial) {
        throw new Error('物料在当前store中不存在, 无法执行删除操作');
      }
      const propsInStore = targetMaterial.props;
      const propsInForm = dataValue.props;
      const propsToDelete = propsInStore.filter(prop => !propsInForm.some(p => p.id === prop.id));
      if (propsToDelete.length > 0) {
        console.debug('propsToDelete', propsToDelete);
        await postVoltronMaterialPropBatchDelete({
          ids: propsToDelete.map(prop => Number(prop.id))
        });
      }
      message.success('更新成功');
      await fetchMaterialData();
      useModifyMaterialPropsFormData.setState(null);
    } catch (error) {
      console.error('error_in_create_material_data', error);
      message.error(`更新失败: ${error.message}`);
    }
  };
}
