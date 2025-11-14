import { useModifyMaterialFormData, getModifyMaterialFormModel } from '../store/modifyMaterialFormData';

export function useMaterialModifyDrawerVisible() {
  return useModifyMaterialFormData(() => !!getModifyMaterialFormModel());
}

export function closeMaterialModifyDrawerVisible() {
  useModifyMaterialFormData.setState(null);
}
