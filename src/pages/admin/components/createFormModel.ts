import { KeyOfMaterialDTOVisible, KeyOfMaterialPropsDTOVisible, MaterialFormModal } from '../types';
import { validateMaterialField } from '../formutils/services';

/**
 * 验证 FormModal 里的多个字段
 * @param requiredFieldsInMaterial 物料表单必填字段
 * @param requiredFieldsInMaterialProps 物料属性表单必填字段
 * @param getFormDataModal 获取 FormModal 的函数
 * @returns 是否验证通过
 *
 * TODO 这里缺乏抽象
 */
export function validateMaterialData(
  requiredFieldsInMaterial: KeyOfMaterialDTOVisible[],
  requiredFieldsInMaterialProps: KeyOfMaterialPropsDTOVisible[],
  getFormDataModal: () => MaterialFormModal
): boolean {
  const material = getFormDataModal();

  let isOk = true;

  for (const field of requiredFieldsInMaterial) {
    const result = validateMaterialField(field, getFormDataModal as any);
    if (!result) {
      isOk = false;
    }
  }

  for (const prop of material.props) {
    for (const field of requiredFieldsInMaterialProps) {
      const result = validateMaterialField(field, () => prop as any);
      if (!result) {
        isOk = false;
      }
    }
  }

  return isOk;
}
