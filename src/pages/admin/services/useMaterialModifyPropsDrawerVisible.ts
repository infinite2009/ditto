import { getModifyMaterialPropsFormModel } from '../store/modifyMaterialPropsFormData';
import { useModifyMaterialPropsFormData } from '../store/modifyMaterialPropsFormData';

export function useMaterialModifyPropsDrawerVisible() {
  return useModifyMaterialPropsFormData(() => !!getModifyMaterialPropsFormModel());
}

export function closeMaterialModifyPropsDrawer() {
  useModifyMaterialPropsFormData.setState(null);
}
